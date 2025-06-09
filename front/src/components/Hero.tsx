import React from 'react';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const Hero = () => {
  const scrollToContent = () => {
    const contentSection = document.getElementById('content-section');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="h-screen flex items-center pt-0 pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center fade-in w-full">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-base font-medium mb-12">
          <Zap className="w-5 h-5" />
          <span>先进的AI识别技术</span>
        </div>
        
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
          机器视觉
          <span className="text-green-500 block">识别系统</span>
        </h1>
        
        <p className="text-2xl sm:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          使用最先进的计算机视觉技术，适用于智慧城市服务与运营，包括电动车识别、道路病害识别、水面漂浮物识别、安全帽识别等。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={scrollToContent}
            className="group px-10 py-5 bg-apple-blue text-white rounded-full font-semibold text-xl hover:bg-blue-600 transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3"
          >
            <span>立即体验</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {/*  
          <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
            查看文档
          </button>
        </div>
        
        { Features 部分 - 暂时注释
        <div className="grid md:grid-cols-3 gap-8 slide-up">
          <div className="bg-white rounded-2xl p-8 shadow-apple hover-lift">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">速度快</h3>
            <p className="text-gray-600">使用优化的AI模型，毫秒级处理图像</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-apple hover-lift">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">准确率高</h3>
            <p className="text-gray-600">领先的检测精度</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-apple hover-lift">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">多场景应用</h3>
            <p className="text-gray-600">支持多种场景应用</p>
          </div>
        </div>
        */}
      </div>
    </section>
  );
};

export default Hero;