import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera, ArrowLeft, ArrowRight, FileImage, Zap, MapPin,
  Globe, Loader2, AlertCircle, Trash2, CheckCircle2
} from 'lucide-react';
import { StepIndicator } from '../components/journey/StepIndicator';
import { LiveCamera, LiveCameraHandle } from '../components/journey/LiveCamera';
import { CameraSelector } from '../components/CameraSelector';
import { showToast } from '../lib/utils';
import { ModernLayout } from '@/components/layouts/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JewelleryItemCapture {
  itemNumber: number;
  image: string;
}

interface OverallImageCapture {
  id: number;
  image: string;
  timestamp: string;
}

const stageToStepKey: Record<string, number> = {
  appraiser: 1, customer: 2, rbi: 3, purity: 4, summary: 5,
};

export function RBICompliance() {
  const navigate = useNavigate();
  const location = useLocation();
  const cameraRef = useRef<LiveCameraHandle>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [overallImages, setOverallImages] = useState<OverallImageCapture[]>([]);
  const [capturedItems, setCapturedItems] = useState<JewelleryItemCapture[]>([]);
  const [currentCapturingItem, setCurrentCapturingItem] = useState<number | null>(null);
  const [captureMode, setCaptureMode] = useState<'overall' | 'individual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const stage = useMemo(() => new URLSearchParams(location.search).get("stage") || "customer", [location.search]);
  const currentStepKey = stageToStepKey[stage] || 3;

  const [gpsData, setGpsData] = useState<{
    latitude: number; longitude: number; source: string; address: string; timestamp: string;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  const fetchGPS = useCallback(async () => {
    setGpsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gps/location`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGpsData(data);
    } catch (err) {
      console.error('GPS Error');
    } finally {
      setGpsLoading(false);
    }
  }, []);

  useEffect(() => {
    const appraiser = localStorage.getItem('currentAppraiser');
    if (!appraiser) { navigate('/appraiser-details'); return; }
    fetchGPS();
  }, [navigate, fetchGPS]);

  const handleOpenOverallCamera = () => {
    setCaptureMode('overall');
    cameraRef.current?.openCamera();
    setIsCameraOpen(true);
  };

  const handleCaptureOverallImage = () => {
    const imageData = cameraRef.current?.captureImage();
    if (imageData) {
      setOverallImages(prev => [...prev, { id: prev.length + 1, image: imageData, timestamp: new Date().toISOString() }]);
      cameraRef.current?.closeCamera();
      setIsCameraOpen(false);
      setCaptureMode(null);
      showToast('Overall image captured!', 'success');
    }
  };

  const handleOpenIndividualCamera = () => {
    const nextItem = Array.from({ length: totalItems }, (_, i) => i + 1).find(num => !capturedItems.find(i => i.itemNumber === num));
    if (nextItem) {
      setCurrentCapturingItem(nextItem);
      setCaptureMode('individual');
      cameraRef.current?.openCamera();
      setIsCameraOpen(true);
    } else {
      showToast('All items captured', 'info');
    }
  };

  const handleCaptureItem = () => {
    if (currentCapturingItem === null) return;
    const imageData = cameraRef.current?.captureImage();
    if (imageData) {
      setCapturedItems(prev => [...prev.filter(i => i.itemNumber !== currentCapturingItem), { itemNumber: currentCapturingItem, image: imageData }]);
      cameraRef.current?.closeCamera();
      setIsCameraOpen(false);
      setCurrentCapturingItem(null);
      setCaptureMode(null);
      showToast(`Item ${currentCapturingItem} captured!`, 'success');
    }
  };

  const handleNext = async () => {
    if (totalItems === 0) return showToast('Enter item count', 'error');
    if (overallImages.length === 0 && capturedItems.length === 0) return showToast('Capture at least one image', 'error');

    setIsLoading(true);
    try {
      const itemsData = capturedItems.length === totalItems
        ? capturedItems.map(i => ({ itemNumber: i.itemNumber, image: i.image, description: `Item ${i.itemNumber}` }))
        : Array.from({ length: totalItems }, (_, i) => ({ itemNumber: i + 1, image: overallImages[0]?.image, description: `Item ${i + 1}` }));

      localStorage.setItem('jewelleryItems', JSON.stringify(itemsData));
      localStorage.setItem('rbiCompliance', JSON.stringify({
        overallImages, totalItems, capturedItems,
        captureMethod: capturedItems.length === totalItems ? 'individual' : 'overall',
        timestamp: new Date().toISOString()
      }));

      showToast('Compliance data saved!', 'success');
      navigate('/purity-testing');
    } catch (error) {
      showToast('Failed to save data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernLayout title="New Appraisal" subtitle="Compliance Documentation">
      <div className="max-w-6xl mx-auto space-y-8">
        <StepIndicator currentStep={3} />

        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jewellery Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min="1" value={totalItems || ''}
                  onChange={(e) => setTotalItems(parseInt(e.target.value) || 0)}
                  className="w-24 text-center text-lg font-bold"
                  placeholder="0"
                />
                <span className="text-sm text-slate-500">Total Items</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Location Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {gpsLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Locating...</div>
              ) : gpsData ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><MapPin className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{gpsData.address}</p>
                    <p className="text-xs text-slate-500 mt-1">{gpsData.latitude.toFixed(4)}, {gpsData.longitude.toFixed(4)}</p>
                  </div>
                </div>
              ) : <div className="text-red-500 text-sm">Location failed</div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-8">

          {/* Left: Capture Modes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Capture Method</h3>

            <button
              onClick={handleOpenOverallCamera}
              className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileImage className="w-6 h-6" />
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                  {overallImages.length} captured
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900">Overall Collection</h4>
                <p className="text-sm text-slate-500">Capture all items in a single frame.</p>
              </div>
            </button>

            <button
              onClick={handleOpenIndividualCamera}
              disabled={totalItems === 0}
              className={`w-full text-left p-4 rounded-xl border transition-all group ${totalItems === 0 ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-full transition-colors ${totalItems === 0 ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                  <Camera className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${capturedItems.length === totalItems && totalItems > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {capturedItems.length} / {totalItems || 0}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900">Individual Items</h4>
                <p className="text-sm text-slate-500">Capture each item separately.</p>
              </div>
            </button>
          </div>

          {/* Right: Camera Feed & Gallery */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-slate-200 shadow-sm relative">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-medium text-slate-800">
                  {captureMode === 'overall' ? 'Overall Capture' : captureMode === 'individual' ? `Item ${currentCapturingItem} Capture` : 'Camera Feed'}
                </h3>
                {isCameraOpen && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold animate-pulse">LIVE</span>}
              </div>

              <div className="aspect-video bg-black relative flex items-center justify-center">
                {captureMode ? (
                  <>
                    <LiveCamera
                      ref={cameraRef}
                      currentStepKey={currentStepKey}
                      selectedDeviceId={selectedCameraId}
                      displayMode="inline"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <Button variant="secondary" onClick={() => {
                        cameraRef.current?.closeCamera();
                        setIsCameraOpen(false);
                        setCaptureMode(null);
                        setCurrentCapturingItem(null);
                      }}>Cancel</Button>
                      <Button onClick={captureMode === 'overall' ? handleCaptureOverallImage : handleCaptureItem}>
                        Capture
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-500">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Select capture method to start</p>
                  </div>
                )}

                {/* Hidden Selector */}
                <div className="hidden">
                  <CameraSelector onCameraSelect={setSelectedCameraId} selectedDeviceId={selectedCameraId} autoDetect={true} />
                </div>
              </div>
            </Card>

            {/* Gallery */}
            {(overallImages.length > 0 || capturedItems.length > 0) && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Captured Images</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {overallImages.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={img.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button onClick={() => setOverallImages(prev => prev.filter(i => i.id !== img.id))} className="text-white hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {capturedItems.map(item => (
                      <div key={item.itemNumber} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={item.image} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 bg-white text-[10px] font-bold rounded shadow-sm">#{item.itemNumber}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => navigate('/customer-image')} className="text-slate-500">Back</Button>
          <Button onClick={handleNext} disabled={isLoading || (totalItems === 0)} className="bg-slate-900 text-white">
            {isLoading ? 'Processing...' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
}
