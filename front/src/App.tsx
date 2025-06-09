import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SceneSelector from './components/SceneSelector';
import UploadSection from './components/UploadSection';
import ResultsDisplay from './components/ResultsDisplay';
import ProcessButton from './components/ProcessButton';

export type Mode = 'test' | 'production';
export type Scene = 'ebike' | 'road' | 'water' | 'helmet';

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

interface ImageDetection {
  imageIndex: number;
  vehicles: Detection[];
}

interface Results {
  totalImages: number;
  vehiclesDetected: number;
  confidence: number;
  detections: ImageDetection[];
}

function App() {
  const [mode, setMode] = useState<Mode>('test');
  const [scene, setScene] = useState<Scene>('ebike');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsCompleted(false);
  };

  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    setIsCompleted(false);
    
    // 创建初始结果对象
    const initialResults: Results = {
      totalImages: uploadedFiles.length,
      vehiclesDetected: 0,
      confidence: 0,
      detections: []
    };
    setResults(initialResults);
    
    // 模拟逐个处理图片
    for (let i = 0; i < uploadedFiles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 每张图片处理时间
      
      const newDetection = {
        imageIndex: i,
        vehicles: [{
          type: 'Electric Vehicle',
          confidence: 0.95 + Math.random() * 0.05,
          boundingBox: {
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            width: 200 + Math.random() * 100,
            height: 150 + Math.random() * 50
          }
        }]
      };
      
      setResults(prev => {
        if (!prev) return initialResults;
        return {
          ...prev,
          totalImages: prev.totalImages,
          vehiclesDetected: prev.vehiclesDetected + 1,
          confidence: (prev.confidence * prev.detections.length + 0.95) / (prev.detections.length + 1),
          detections: [...prev.detections, newDetection]
        };
      });
    }
    
    setIsProcessing(false);
    setIsCompleted(true);
  };

  const clearFiles = () => {
    uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setUploadedFiles([]);
    setResults(null);
    setIsCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Header />
      <main>
        <Hero />
        
        <div id="content-section" className="pt-20">
          <section className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SceneSelector 
              scene={scene} 
              onSceneChange={setScene}
              mode={mode}
              onModeChange={setMode}
              uploadSectionRef={uploadSectionRef}
            />
          </section>
          
          <section className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div ref={uploadSectionRef}>
                <UploadSection 
                  onFileUpload={handleFileUpload}
                  uploadedFiles={uploadedFiles}
                  onProcess={handleProcessFiles}
                  onClear={clearFiles}
                  isProcessing={isProcessing}
                  mode={mode}
                />
              </div>
              
              <div className="lg:col-span-2">
                <ResultsDisplay 
                  results={results}
                  uploadedFiles={uploadedFiles}
                  isProcessing={isProcessing}
                  mode={mode}
                />
              </div>
            </div>
          </section>

          <section className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <ProcessButton
              onProcess={handleProcessFiles}
              isProcessing={isProcessing}
              isCompleted={isCompleted}
              mode={mode}
              disabled={uploadedFiles.length === 0}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;