import { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, ArrowLeft, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';
import { StepIndicator } from '../components/journey/StepIndicator';
import { LiveCamera, LiveCameraHandle } from '../components/journey/LiveCamera';
import { CameraSelector } from '../components/CameraSelector';
import { showToast } from '../lib/utils';
import { ModernLayout } from '@/components/layouts/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const stageToStepKey: Record<string, number> = {
  appraiser: 1,
  customer: 2,
  rbi: 3,
  purity: 4,
  summary: 5,
};

export function CustomerImage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cameraRef = useRef<LiveCameraHandle>(null);
  const [frontImage, setFrontImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const stage = useMemo(() => new URLSearchParams(location.search).get("stage") || "customer", [location.search]);
  const currentStepKey = stageToStepKey[stage] || 2;

  useEffect(() => {
    const appraiser = localStorage.getItem('currentAppraiser');
    if (!appraiser) {
      showToast('Please complete appraiser details first', 'error');
      navigate('/appraiser-details');
    }
  }, [navigate]);

  const handleOpenCamera = () => {
    cameraRef.current?.openCamera();
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    cameraRef.current?.closeCamera();
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    const imageData = cameraRef.current?.captureImage();
    if (imageData && imageData !== 'data:,' && imageData.length > 100) {
      setFrontImage(imageData);
      showToast('Customer photo captured!', 'success');
      handleCloseCamera();
    } else {
      showToast('Failed to capture photo.', 'error');
    }
  };

  const handleRetake = () => {
    setFrontImage('');
    handleOpenCamera();
  };

  const handleNext = async () => {
    if (!frontImage) {
      showToast('Please capture front view photo', 'error');
      return;
    }
    setIsLoading(true);
    try {
      localStorage.setItem('customerFrontImage', frontImage);
      localStorage.removeItem('customerSideImage');
      showToast('Customer images saved!', 'success');
      navigate('/rbi-compliance');
    } catch (error) {
      showToast('Failed to save customer images', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernLayout title="New Appraisal" subtitle="Customer Verification">
      <div className="max-w-5xl mx-auto space-y-8">

        <StepIndicator currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Instructions & Preview */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Customer Photo</CardTitle>
              <CardDescription>Capture a clear front-view photo of the customer.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              {frontImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200">
                    <img src={frontImage} alt="Customer" className="w-full h-64 object-cover" />
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
                      <Check className="w-3 h-3 mr-1" /> Captured
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRetake} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" /> Retake
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-600">No image captured</p>
                  <p className="text-sm">Use the camera panel to take a photo</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Requirements</h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• Front view face capture required.</li>
                  <li>• Neutral expression, eyes visible.</li>
                  <li>• Ensure good lighting.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Live Camera Feed */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Camera Feed</CardTitle>
              <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${isCameraOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isCameraOpen ? 'bg-green-500' : 'bg-slate-400'}`} />
                {isCameraOpen ? 'Live' : 'Offline'}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <LiveCamera
                  ref={cameraRef}
                  currentStepKey={currentStepKey}
                  selectedDeviceId={selectedCameraId}
                  displayMode="inline"
                  onOpen={() => setIsCameraOpen(true)}
                  onClose={() => setIsCameraOpen(false)}
                />
                {!isCameraOpen && <p className="text-white/50 text-sm">Camera is inactive</p>}
              </div>

              {!isCameraOpen && (
                <CameraSelector
                  onCameraSelect={setSelectedCameraId}
                  selectedDeviceId={selectedCameraId}
                  autoDetect={true}
                />
              )}

              <div className="grid grid-cols-2 gap-4 mt-auto">
                {isCameraOpen ? (
                  <>
                    <Button variant="default" onClick={handleCapture} className="col-span-2 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 text-white">
                      <Camera className="w-5 h-5 mr-2" /> Capture Photo
                    </Button>
                    <Button variant="ghost" onClick={handleCloseCamera} className="col-span-2 text-xs text-slate-500">
                      Stop Camera
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleOpenCamera} className="col-span-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Camera className="w-5 h-5 mr-2" /> Start Camera
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => navigate('/appraiser-details')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!frontImage || isLoading} className="bg-slate-900 text-white hover:bg-slate-800">
            {isLoading ? 'Processing...' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </ModernLayout>
  );
}
