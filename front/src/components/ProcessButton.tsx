import React from 'react';
import { Play, Check } from 'lucide-react';
import { Mode } from '../App';

interface ProcessButtonProps {
  onProcess: () => void;
  isProcessing: boolean;
  isCompleted?: boolean;
  mode: Mode;
  disabled: boolean;
}

const ProcessButton = ({ onProcess, isProcessing, isCompleted = false, mode, disabled }: ProcessButtonProps) => {
  return (
    <button
      onClick={onProcess}
      disabled={isProcessing || disabled || isCompleted}
      className={`w-full py-3 px-8 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
        isProcessing || disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : isCompleted
            ? mode === 'test'
              ? 'bg-blue-500 text-white cursor-not-allowed'
              : 'bg-green-500 text-white cursor-not-allowed'
            : mode === 'test'
              ? 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'
              : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg'
      }`}
    >
      {isProcessing ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span>处理中...</span>
        </>
      ) : isCompleted ? (
        <>
          <Check className="w-5 h-5" />
          <span>已完成</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5" />
          <span>开始识别</span>
        </>
      )}
    </button>
  );
};

export default ProcessButton; 