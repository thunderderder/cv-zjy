import torch
import numpy as np
from torch.serialization import add_safe_globals

def print_model_info(model_path):
    # 添加安全的全局变量
    add_safe_globals(['_reconstruct'])
    
    print(f"正在加载模型: {model_path}")
    try:
        # 首先尝试以weights_only=False加载
        model = torch.load(model_path, map_location='cpu', weights_only=False)
        print("\n成功加载完整模型")
    except Exception as e:
        print(f"\n加载完整模型失败，尝试只加载权重: {str(e)}")
        try:
            # 尝试只加载权重
            model = torch.load(model_path, map_location='cpu', weights_only=True)
            print("\n成功加载模型权重")
        except Exception as e:
            print(f"\n加载权重也失败: {str(e)}")
            return
    
    print("\n模型类型:", type(model))
    
    # 如果是字典，打印键
    if isinstance(model, dict):
        print("\n模型字典的键:")
        for key in model.keys():
            print(f"\n- {key}:")
            if key == 'model':
                if hasattr(model[key], 'named_modules'):
                    print("  模型结构:")
                    for name, module in model[key].named_modules():
                        if name:  # 跳过空名称
                            print(f"    {name}: {type(module).__name__}")
                    
                    print("\n  模型参数:")
                    for name, param in model[key].named_parameters():
                        print(f"    {name}: {param.shape}")
            elif isinstance(model[key], dict):
                print("  字典内容:")
                for subkey, value in model[key].items():
                    print(f"    {subkey}: {type(value)}")
            else:
                print(f"  值类型: {type(model[key])}")
    
    # 如果是模型实例，打印结构
    elif isinstance(model, torch.nn.Module):
        print("\n模型结构:")
        for name, module in model.named_modules():
            if name:  # 跳过空名称
                print(f"- {name}: {type(module).__name__}")
        
        print("\n模型参数:")
        for name, param in model.named_parameters():
            print(f"- {name}: {param.shape}")

if __name__ == "__main__":
    print_model_info('pytorch_model.pt') 