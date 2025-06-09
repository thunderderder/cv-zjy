import React, { useState, useRef, useEffect } from 'react';
import { Bike, AlertTriangle, Droplets, HardHat, TestTube, Briefcase, ChevronDown } from 'lucide-react';
import { Mode } from '../App';

export type Scene = 'ebike' | 'road' | 'water' | 'helmet';

interface SceneSelectorProps {
  scene: Scene;
  onSceneChange: (scene: Scene) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  uploadSectionRef: React.RefObject<HTMLDivElement>;
}

const SceneSelector = ({ scene, onSceneChange, mode, onModeChange, uploadSectionRef }: SceneSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scenes = [
    {
      id: 'ebike' as Scene,
      name: '电动车识别',
      description: '智能识别电动车及其违规行为',
      icon: Bike
    },
    {
      id: 'road' as Scene,
      name: '道路病害识别',
      description: '自动检测道路破损和隐患',
      icon: AlertTriangle
    },
    {
      id: 'water' as Scene,
      name: '水面漂浮物识别',
      description: '监测水域环境污染物',
      icon: Droplets
    },
    {
      id: 'helmet' as Scene,
      name: '安全帽识别',
      description: '工地安全帽佩戴检测',
      icon: HardHat
    }
  ];

  const handleSceneClick = (sceneId: Scene) => {
    onSceneChange(sceneId);
    uploadSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-apple fade-in relative">
      <div className="absolute top-8 right-8" ref={dropdownRef}>
        <div 
          className="relative flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer min-w-[120px]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {mode === 'test' ? 
            <TestTube className="w-4 h-4 text-blue-600 flex-shrink-0" /> : 
            <Briefcase className="w-4 h-4 text-green-600 flex-shrink-0" />
          }
          <span className={`text-sm font-medium ${mode === 'test' ? 'text-blue-600' : 'text-green-600'}`}>
            {mode === 'test' ? '测试模式' : '生产模式'}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-auto ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 w-full">
            <button
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${
                mode === 'test' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-blue-600 hover:bg-blue-50'
              } transition-colors duration-150`}
              onClick={() => {
                onModeChange('test');
                setIsOpen(false);
              }}
            >
              <TestTube className="w-4 h-4 flex-shrink-0" />
              <span>测试模式</span>
            </button>
            <button
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${
                mode === 'production' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-green-600 hover:bg-green-50'
              } transition-colors duration-150`}
              onClick={() => {
                onModeChange('production');
                setIsOpen(false);
              }}
            >
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span>生产模式</span>
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">选择识别场景</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-2">
        {scenes.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSceneClick(item.id)}
            className={`w-full p-8 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center ${
              scene === item.id
                ? mode === 'test'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <item.icon className={`w-16 h-16 mb-6 ${
              scene === item.id 
                ? mode === 'test'
                  ? 'text-blue-600'
                  : 'text-green-600'
                : 'text-gray-500'
            }`} />
            <div className="text-xl font-medium">{item.name}</div>
            <div className="text-base text-gray-500 mt-2">{item.description}</div>
          </button>
        ))}
      </div>
      
      {/* 状态显示区域 - 暂时不需要
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">当前场景：</span>
          {scenes.find(s => s.id === scene)?.description}
        </div>
      </div>
      */}
    </div>
  );
};

export default SceneSelector; 