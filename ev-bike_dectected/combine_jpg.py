from PIL import Image
import numpy as np

if __name__ == '__main__':
    # 图片文件列表
    image_files = ['single.png', 'single1.png', 'single2.png', 'single3.png']

    # 获取所有图片的最大高度和总宽度
    max_height = 0
    total_width = 0

    for image_file in image_files:
        image = Image.open(image_file)
        width, height = image.size
        max_height = max(max_height, height)
        total_width += width

    # 创建一个新的空白图片，大小为所有图片拼接后的宽度和高度
    combined_image = Image.new('RGB', (total_width, max_height))

    # 在新图片上逐个粘贴每个图片，并调整大小
    x_offset = 0
    for image_file in image_files:
        image = Image.open(image_file)
        width, height = image.size
        
        # 调整图片大小以适应拼接
        resized_image = image.resize((width, max_height))
        
        # 粘贴图片到新图片上
        combined_image.paste(resized_image, (x_offset, 0))
        
        # 更新下一个图片的x偏移量
        x_offset += width

    # 保存拼接后的图片
    combined_image.save('combined_image.jpg')
