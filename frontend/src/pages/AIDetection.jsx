import { useState, useRef } from 'react';
import { Upload, Camera, Video, Play, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AIDetection() {
  const [activeTab, setActiveTab] = useState('image'); // image, video, camera
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = () => {
    if (!preview) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        image: preview, // In real app, this would be the processed image with bounding boxes
        count: Math.floor(Math.random() * 5) + 1,
        confidence: (Math.random() * 15 + 85).toFixed(1),
        time: (Math.random() * 0.5 + 0.1).toFixed(2),
        severity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
      });
      toast.success("Detection complete!");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">AI Detection Studio</h1>
        <p className="text-slate-500 dark:text-slate-400">Run computer vision models on custom images, videos or live camera feeds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="card space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'image' ? 'bg-white dark:bg-dark-card shadow text-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              onClick={() => setActiveTab('image')}
            >
              <Upload className="w-4 h-4" /> Image
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'video' ? 'bg-white dark:bg-dark-card shadow text-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              onClick={() => setActiveTab('video')}
            >
              <Video className="w-4 h-4" /> Video
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'camera' ? 'bg-white dark:bg-dark-card shadow text-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              onClick={() => setActiveTab('camera')}
            >
              <Camera className="w-4 h-4" /> Camera
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
              accept={activeTab === 'video' ? "video/*" : "image/*"}
            />
            {preview ? (
              <div className="text-success flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 mb-2" />
                <p className="font-medium">File Selected</p>
                <p className="text-xs text-slate-500 mt-1">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center">
                {activeTab === 'video' ? <Video className="w-12 h-12 mb-2" /> : <Upload className="w-12 h-12 mb-2" />}
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs mt-1">PNG, JPG, MP4 up to 50MB</p>
              </div>
            )}
          </div>

          <button 
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isProcessing || !preview ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 hover:-translate-y-0.5'}`}
            onClick={handleProcess}
            disabled={isProcessing || !preview}
          >
            {isProcessing ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing Model...</>
            ) : (
              <><Play className="w-5 h-5 fill-current" /> Run Detection</>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Detection Results</h3>
            {result && (
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
                <Download className="w-4 h-4" /> Download Processed File
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden relative min-h-[400px] flex items-center justify-center">
            {isProcessing ? (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <div className="text-primary-600 font-medium animate-pulse">Running YOLOv8 inference...</div>
              </div>
            ) : null}

            {result ? (
              <div className="w-full h-full relative">
                {/* Simulated bounding box */}
                <div className="absolute top-[30%] left-[40%] w-[20%] h-[15%] border-2 border-red-500 bg-red-500/20 z-10 rounded">
                  <div className="absolute -top-6 left-[-2px] bg-red-500 text-white text-xs font-bold px-1 rounded-t">Pothole {result.confidence}%</div>
                </div>
                {result.count > 1 && (
                  <div className="absolute top-[60%] left-[20%] w-[15%] h-[10%] border-2 border-orange-500 bg-orange-500/20 z-10 rounded">
                    <div className="absolute -top-6 left-[-2px] bg-orange-500 text-white text-xs font-bold px-1 rounded-t">Pothole 89.2%</div>
                  </div>
                )}
                <img src={result.image} alt="Processed" className="w-full h-full object-contain" />
              </div>
            ) : preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <AlertCircle className="w-16 h-16 mb-2 opacity-50" />
                <p>Upload media and run detection to see results</p>
              </div>
            )}
          </div>

          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                <div className="text-xs text-slate-500 mb-1">Potholes Detected</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{result.count}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                <div className="text-xs text-slate-500 mb-1">Max Confidence</div>
                <div className="text-xl font-bold text-success">{result.confidence}%</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                <div className="text-xs text-slate-500 mb-1">Processing Time</div>
                <div className="text-xl font-bold text-primary-600">{result.time}s</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                <div className="text-xs text-slate-500 mb-1">Max Severity</div>
                <div className={`text-xl font-bold ${result.severity === 'High' ? 'text-danger' : result.severity === 'Medium' ? 'text-warning' : 'text-success'}`}>
                  {result.severity}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
