import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Trash2, Play, FolderOpen, X } from 'lucide-react';
import { Mode } from '../App';

interface UploadedFile {
  file: File;
  preview: string;
}

interface UploadSectionProps {
  onFileUpload: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onProcess: () => void;
  onClear: () => void;
  isProcessing: boolean;
  mode: Mode;
}

// 扩展 HTMLInputElement 类型以支持文件夹选择属性
interface CustomFileInput extends Omit<HTMLInputElement, 'webkitdirectory'> {
  webkitdirectory: boolean;
  directory?: string;
  mozdirectory?: string;
}

// 确认对话框组件
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-6 shadow-xl w-[400px] relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadSection = ({ 
  onFileUpload, 
  uploadedFiles, 
  onProcess, 
  onClear, 
  isProcessing, 
  mode 
}: UploadSectionProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    onFileUpload(imageFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    noClick: true  // 禁用默认的点击行为
  });

  const inputProps = {
    ...getInputProps(),
    directory: '',
    webkitdirectory: '',
    mozdirectory: '',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple fade-in h-[180px] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">上传文件夹</h3>
          {uploadedFiles.length > 0 && (
            <button
              onClick={() => {
                const input = document.createElement('input') as CustomFileInput;
                input.type = 'file';
                input.webkitdirectory = true;
                input.directory = '';
                input.mozdirectory = '';
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  const imageFiles = files.filter(file => 
                    file.type.startsWith('image/')
                  );
                  onFileUpload(imageFiles);
                };
                input.click();
              }}
              className="text-gray-500 hover:text-blue-500 transition-colors"
              title="增量上传"
            >
              <Upload className="w-5 h-5" />
            </button>
          )}
        </div>
        {uploadedFiles.length > 0 && (
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="清空"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onClear}
        title="确认清空"
        message="确定要清空所有已上传的图片吗？此操作无法撤销。"
      />

      {/* Upload Area - Only show when no files are uploaded */}
      {uploadedFiles.length === 0 ? (
        <div
          {...getRootProps()}
          onClick={() => {
            const input = document.createElement('input') as CustomFileInput;
            input.type = 'file';
            input.webkitdirectory = true;
            input.directory = '';
            input.mozdirectory = '';
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              const imageFiles = files.filter(file => 
                file.type.startsWith('image/')
              );
              onFileUpload(imageFiles);
            };
            input.click();
          }}
          className={`flex-grow border-2 border-dashed rounded-xl mt-2 text-center cursor-pointer transition-all duration-200 flex items-center justify-center ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...inputProps} />
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <FolderOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <Upload className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-gray-700 font-medium">
                {isDragActive
                  ? '将文件夹拖放到这里...'
                  : '将文件夹拖放到这里或点击上传'
                }
              </p>
              <p className="text-xs text-gray-500">
                支持识别 JPEG、PNG、WebP 格式图片
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col mt-2">
          <div className="flex-grow">
            <h4 className="text-sm font-medium text-gray-700">
              已上传 {uploadedFiles.length} 张图片
            </h4>
            <div className="mt-2 space-y-1 h-[90px] overflow-y-auto">
              {uploadedFiles.map((fileData, index) => (
                <div key={index} className="flex items-center space-x-3 p-1 hover:bg-gray-50 rounded-lg">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <img
                      src={fileData.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border border-gray-200"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-gray-700 truncate" title={fileData.file.name}>
                      {fileData.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;