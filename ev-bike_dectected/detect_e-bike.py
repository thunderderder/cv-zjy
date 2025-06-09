from modelscope.pipelines import pipeline

# 初始化pipeline
pipe = pipeline('domain-specific-object-detection', 'IoT-Edge/EBike_Detection', model_revision='v1.0.0')

# 对resources文件夹中的图片进行检测
print("\n处理图片: resources/1.jpg")
output = pipe('resources/1.jpg')
print("检测结果:")
print(output)

print("\n处理图片: resources/2.jpg")
output = pipe('resources/2.jpg')
print("检测结果:")
print(output)

print("\n处理图片: resources/test.JPG")
output = pipe('resources/test.JPG')
print("检测结果:")
print(output)