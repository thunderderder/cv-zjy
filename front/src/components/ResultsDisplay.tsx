import React from 'react';
import { BarChart3, CheckCircle, AlertCircle, Car, Eye } from 'lucide-react';
import { Mode } from '../App';

interface UploadedFile {
  file: File;
  preview: string;
}

interface Detection {
  type: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface Results {
  totalImages: number;
  vehiclesDetected: number;
  confidence: number;
  detections: Array<{
    imageIndex: number;
    vehicles: Detection[];
  }>;
}

interface ResultsDisplayProps {
  results: Results | null;
  uploadedFiles: UploadedFile[];
  isProcessing: boolean;
  mode: Mode;
}

const ResultsDisplay = ({ results, uploadedFiles, isProcessing, mode }: ResultsDisplayProps) => {
  if (isProcessing && !results) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-apple fade-in h-[180px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${mode === 'test' ? 'border-blue-200 border-t-blue-500' : 'border-green-200 border-t-green-500'} rounded-full animate-spin mx-auto mb-3`}></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">正在处理图片</h3>
          <p className="text-sm text-gray-600">AI正在分析您的图片...</p>
        </div>
      </div>
    );
  }

  if (!results && uploadedFiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-apple fade-in h-[180px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">准备分析</h3>
          <p className="text-sm text-gray-600">上传文件夹开始识别</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-apple fade-in h-[180px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className={`w-12 h-12 ${mode === 'test' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Eye className={`w-6 h-6 ${mode === 'test' ? 'text-blue-500' : 'text-green-500'}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">图片已就绪</h3>
          <p className="text-sm text-gray-600">点击"开始识别"来分析您的 {uploadedFiles.length} 张图片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple fade-in h-[180px] flex flex-col">
      {/* Summary Card */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">检测结果</h3>
        <h4 className="text-sm font-medium text-gray-700 mt-2">
          已处理 {results.detections.length} / {results.totalImages} 张图片
        </h4>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{Math.round((results.detections.length / results.totalImages) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${mode === 'test' ? 'bg-blue-500' : 'bg-green-500'} rounded-full transition-all duration-300`}
            style={{ width: `${(results.detections.length / results.totalImages) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Latest Detection */}
      {results.detections.length > 0 && (
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            {results.detections[results.detections.length - 1].vehicles.length > 0 ? (
              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
            <p className="text-xs text-gray-900 truncate">
              {uploadedFiles[results.detections[results.detections.length - 1].imageIndex]?.file.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;