import os
import sys
import torch
import cv2
import numpy as np
import torch.nn as nn
import torchvision
import json
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# 导入必要的函数
def attempt_load(weights, map_location=None):
    """加载模型权重"""
    # 使用weights_only=False来加载完整模型
    model_dict = torch.load(weights, map_location=map_location, weights_only=False)
    if isinstance(model_dict, dict) and 'model' in model_dict:
        model = model_dict['model']
        if hasattr(model, 'module'):
            model = model.module
        model = model.float().eval()
        return model
    return model_dict

def letterbox(im, new_shape=(640, 640), color=(114, 114, 114), auto=True, scaleFill=False, scaleup=True, stride=32):
    # Resize and pad image while meeting stride-multiple constraints
    shape = im.shape[:2]  # current shape [height, width]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    # Scale ratio (new / old)
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # only scale down, do not scale up (for better val mAP)
        r = min(r, 1.0)

    # Compute padding
    ratio = r, r  # width, height ratios
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding
    if auto:  # minimum rectangle
        dw, dh = np.mod(dw, stride), np.mod(dh, stride)  # wh padding
    elif scaleFill:  # stretch
        dw, dh = 0.0, 0.0
        new_unpad = (new_shape[1], new_shape[0])
        ratio = new_shape[1] / shape[1], new_shape[0] / shape[0]  # width, height ratios

    dw /= 2  # divide padding into 2 sides
    dh /= 2

    if shape[::-1] != new_unpad:  # resize
        im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)  # add border
    return im, ratio, (dw, dh)

def xywh2xyxy(x):
    # Convert nx4 boxes from [x, y, w, h] to [x1, y1, x2, y2]
    y = x.clone() if isinstance(x, torch.Tensor) else np.copy(x)
    y[:, 0] = x[:, 0] - x[:, 2] / 2  # top left x
    y[:, 1] = x[:, 1] - x[:, 3] / 2  # top left y
    y[:, 2] = x[:, 0] + x[:, 2] / 2  # bottom right x
    y[:, 3] = x[:, 1] + x[:, 3] / 2  # bottom right y
    return y

def non_max_suppression(prediction, conf_thres=0.25, iou_thres=0.45, classes=None, agnostic=False, multi_label=False, max_det=300):
    """非极大值抑制"""
    if prediction.dtype is torch.float16:
        prediction = prediction.float()  # to FP32
        
    nc = prediction.shape[2] - 5  # number of classes
    xc = prediction[..., 4] > conf_thres  # candidates
    
    # Settings
    min_wh, max_wh = 2, 4096  # (pixels) minimum and maximum box width and height
    max_nms = 30000  # maximum number of boxes into torchvision.ops.nms()
    
    output = [torch.zeros((0, 6), device=prediction.device)] * prediction.shape[0]
    
    for xi, x in enumerate(prediction):  # image index, image inference
        x = x[xc[xi]]  # confidence
        
        # If none remain process next image
        if not x.shape[0]:
            continue
            
        # Compute conf
        x[:, 5:] *= x[:, 4:5]  # conf = obj_conf * cls_conf
        
        # Box (center x, center y, width, height) to (x1, y1, x2, y2)
        box = xywh2xyxy(x[:, :4])
        
        # Detections matrix nx6 (xyxy, conf, cls)
        if multi_label:
            i, j = (x[:, 5:] > conf_thres).nonzero(as_tuple=True)
            x = torch.cat((box[i], x[i, j + 5, None], j[:, None].float()), 1)
        else:  # best class only
            conf, j = x[:, 5:].max(1, keepdim=True)
            x = torch.cat((box, conf, j.float()), 1)[conf.view(-1) > conf_thres]
        
        # Filter by class
        if classes is not None:
            x = x[(x[:, 5:6] == torch.tensor(classes, device=x.device)).any(1)]
        
        # Check shape
        n = x.shape[0]  # number of boxes
        if not n:  # no boxes
            continue
        elif n > max_nms:  # excess boxes
            x = x[x[:, 4].argsort(descending=True)[:max_nms]]  # sort by confidence
        
        # Batched NMS
        c = x[:, 5:6] * (0 if agnostic else max_wh)  # classes
        boxes, scores = x[:, :4] + c, x[:, 4]  # boxes (offset by class), scores
        i = torchvision.ops.nms(boxes, scores, iou_thres)  # NMS
        if i.shape[0] > max_det:  # limit detections
            i = i[:max_det]
        output[xi] = x[i]
        
    return output

def scale_coords(img1_shape, coords, img0_shape, ratio_pad=None):
    """缩放坐标"""
    if ratio_pad is None:  # calculate from img0_shape
        gain = min(img1_shape[0] / img0_shape[0], img1_shape[1] / img0_shape[1])  # gain  = old / new
        pad = (img1_shape[1] - img0_shape[1] * gain) / 2, (img1_shape[0] - img0_shape[0] * gain) / 2  # wh padding
    else:
        gain = ratio_pad[0][0]
        pad = ratio_pad[1]

    coords[:, [0, 2]] -= pad[0]  # x padding
    coords[:, [1, 3]] -= pad[1]  # y padding
    coords[:, :4] /= gain
    clip_coords(coords, img0_shape)
    return coords

def clip_coords(boxes, img_shape):
    """将边界框坐标限制在图像范围内"""
    boxes[:, 0].clamp_(0, img_shape[1])  # x1
    boxes[:, 1].clamp_(0, img_shape[0])  # y1
    boxes[:, 2].clamp_(0, img_shape[1])  # x2
    boxes[:, 3].clamp_(0, img_shape[0])  # y2

def get_exif_data(image_path):
    """获取图片的EXIF数据"""
    try:
        image = Image.open(image_path)
        exif = image._getexif()
        if exif is None:
            return {}
        
        exif_data = {}
        for tag_id in exif:
            tag = TAGS.get(tag_id, tag_id)
            data = exif[tag_id]
            if tag == "GPSInfo":
                gps_data = {}
                for gps_tag in data:
                    sub_tag = GPSTAGS.get(gps_tag, gps_tag)
                    gps_data[sub_tag] = data[gps_tag]
                data = gps_data
            exif_data[tag] = data
        return exif_data
    except Exception as e:
        print(f"读取EXIF数据时出错: {str(e)}")
        return {}

def convert_to_degrees(value):
    """将GPS坐标转换为度数"""
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except:
        return None

def get_image_metadata(image_path):
    """获取图片元数据"""
    exif_data = get_exif_data(image_path)
    metadata = {
        "device_id": "DJI",  # 默认设备ID
        "timestamp": None,
        "latitude": None,
        "longitude": None,
        "altitude": None,
        "road_name": "深圳市",  # 默认道路名称
        "road_section": "龙华区"  # 默认路段编号
    }
    
    # 提取时间戳
    if "DateTimeOriginal" in exif_data:
        metadata["timestamp"] = exif_data["DateTimeOriginal"]
    
    # 提取GPS信息
    if "GPSInfo" in exif_data:
        gps = exif_data["GPSInfo"]
        
        # 提取纬度
        if "GPSLatitude" in gps and "GPSLatitudeRef" in gps:
            lat = convert_to_degrees(gps["GPSLatitude"])
            if gps["GPSLatitudeRef"] == "S":
                lat = -lat
            metadata["latitude"] = lat
        
        # 提取经度
        if "GPSLongitude" in gps and "GPSLongitudeRef" in gps:
            lon = convert_to_degrees(gps["GPSLongitude"])
            if gps["GPSLongitudeRef"] == "W":
                lon = -lon
            metadata["longitude"] = lon
        
        # 提取高度
        if "GPSAltitude" in gps:
            metadata["altitude"] = float(gps["GPSAltitude"])
    
    return metadata

class EBikeDetector:
    def __init__(self, weights_path='pytorch_model.pt', device='cuda:0' if torch.cuda.is_available() else 'cpu'):
        self.device = torch.device(device)
        print(f"使用设备: {self.device}")
        
        # 加载模型
        print(f"加载模型: {weights_path}")
        self.model = attempt_load(weights_path, self.device)
        self.model.float()
        
        # 设置为评估模式
        self.model.eval()
        
        # 禁用梯度计算
        torch.set_grad_enabled(False)
        
        print("模型加载完成")

    def preprocess_image(self, image_path):
        """预处理图像"""
        # 读取图像
        img0 = cv2.imread(image_path)
        if img0 is None:
            raise ValueError(f"无法读取图像: {image_path}")
            
        print(f"原始图像大小: {img0.shape}")
        
        # 预处理
        img = letterbox(img0)[0]  # 自适应缩放和填充
        img = img.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
        img = np.ascontiguousarray(img)
        
        # 转换为tensor
        img = torch.from_numpy(img).to(self.device)
        img = img.float()
        img /= 255.0  # 归一化到0-1
        if len(img.shape) == 3:
            img = img[None]  # 添加batch维度
            
        return img, img0

    def detect(self, image_path, conf_thres=0.3, iou_thres=0.5):
        """检测图像中的电动车"""
        # 预处理图像
        img, img0 = self.preprocess_image(image_path)
        
        # 推理
        pred = self.model(img)[0]
        
        # NMS
        pred = non_max_suppression(pred, conf_thres, iou_thres)
        
        # 处理检测结果
        results = []
        if pred[0] is not None:
            det = pred[0]
            
            # 将坐标缩放回原始图像大小
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], img0.shape).round()
            
            # 收集结果
            for *xyxy, conf, cls in det:
                x1, y1, x2, y2 = [coord.item() for coord in xyxy]
                results.append({
                    'bbox': [x1, y1, x2, y2],
                    'confidence': conf.item(),
                    'class': 'ebike'
                })
        
        return results

    def process_and_save_results(self, image_path):
        """处理图片并保存结果"""
        try:
            # 获取检测结果
            detection_results = self.detect(image_path)
            
            # 获取图片元数据
            metadata = get_image_metadata(image_path)
            
            # 构建完整的结果
            result = {
                "metadata": metadata,
                "location": {
                    "road_name": metadata["road_name"],
                    "road_section": metadata["road_section"]
                },
                "detection_results": [
                    {
                        "bbox": det["bbox"],
                        "confidence": det["confidence"],
                        "class": det["class"]
                    }
                    for det in detection_results
                ]
            }
            
            # 保存JSON结果
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            json_path = os.path.join("results", f"{base_name}_result.json")
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print(f"结果已保存到: {json_path}")
            
            # 可视化结果
            self.visualize(image_path, detection_results)
            
            return result
            
        except Exception as e:
            print(f"处理图片时出错: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    def visualize(self, image_path, results):
        """可视化检测结果"""
        # 读取原始图像
        img = cv2.imread(image_path)
        
        # 绘制检测框
        for det in results:
            bbox = det['bbox']
            conf = det['confidence']
            
            # 绘制边界框
            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # 添加置信度标签
            label = f"ebike {conf:.2f}"
            cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # 保存结果
        output_path = os.path.join("results", os.path.basename(image_path).rsplit('.', 1)[0] + '_detected.' + image_path.rsplit('.', 1)[1])
        cv2.imwrite(output_path, img)
        print(f"可视化结果已保存到: {output_path}")
        
        return output_path

def main():
    # 创建检测器
    detector = EBikeDetector()
    
    # 获取resources文件夹中的所有图片
    resources_dir = "resources"
    image_extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
    image_files = [
        os.path.join(resources_dir, f) 
        for f in os.listdir(resources_dir) 
        if f.endswith(image_extensions)
    ]
    
    # 确保results文件夹存在
    os.makedirs("results", exist_ok=True)
    
    # 处理每张图片
    for image_path in image_files:
        print(f"\n{'='*50}")
        print(f"处理图片: {image_path}")
        detector.process_and_save_results(image_path)
        print(f"{'='*50}\n")

if __name__ == "__main__":
    main() 