import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, User } from 'lucide-react';
import { StepIndicator } from '../components/journey/StepIndicator';
import { LiveCamera, LiveCameraHandle } from '../components/journey/LiveCamera';
import { CameraSelector } from '../components/CameraSelector';
import { apiService } from '../services/api';
import { generateAppraiserId, showToast } from '../lib/utils';
import { ModernLayout } from '@/components/layouts/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AppraiserDetails() {
  const navigate = useNavigate();
  const cameraRef = useRef<LiveCameraHandle>(null);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  useEffect(() => {
    const savedPhoto = localStorage.getItem('newAppraiserPhoto');
    if (savedPhoto) {
      setPhoto(savedPhoto);
      localStorage.removeItem('newAppraiserPhoto');
      showToast('Photo captured from facial recognition.', 'info');
    }
  }, []);

  const handleOpenCamera = () => {
    setIsCameraReady(false);
    cameraRef.current?.openCamera();
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    cameraRef.current?.closeCamera();
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  const handleCapture = () => {
    if (!isCameraReady) {
      showToast('Camera is starting...', 'info');
      return;
    }
    const imageData = cameraRef.current?.captureImage();
    if (imageData && imageData !== 'data:,' && imageData.length > 100) {
      setPhoto(imageData);
      handleCloseCamera();
      showToast('Photo captured!', 'success');
    } else {
      showToast('Failed to capture photo.', 'error');
    }
  };

  const handleRetake = () => {
    setPhoto('');
    handleOpenCamera();
  };

  const handleNext = async () => {
    if (!name.trim()) return showToast('Enter appraiser name', 'error');
    if (!photo) return showToast('Capture appraiser photo', 'error');

    setIsLoading(true);
    try {
      const appraiserId = generateAppraiserId();
      const timestamp = new Date().toISOString();

      await apiService.saveAppraiser({
        name: name.trim(),
        id: appraiserId,
        image: photo,
        timestamp: timestamp,
      });

      const appraiserData = {
        id: Date.now(),
        appraiser_id: appraiserId,
        name: name.trim(),
        photo: photo,
        timestamp: timestamp,
      };

      localStorage.setItem('currentAppraiser', JSON.stringify(appraiserData));
      navigate('/customer-image');
    } catch (error: any) {
      showToast('Failed to save details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernLayout title="New Appraisal" subtitle="Step 1: Appraiser Verification">
      <div className="max-w-5xl mx-auto space-y-8">

        <StepIndicator currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form Section */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>Verify your identity to begin the session.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Photo ID</label>
                  {photo ? (
                    <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                      <img src={photo} alt="Appraiser" className="w-full h-56 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" onClick={handleRetake}>Retake Photo</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Capture photo from camera</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Guidelines</h4>
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>• Ensure well-lit environment.</li>
                  <li>• Face should be clearly visible.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Camera Section */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Camera</CardTitle>
              <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${isCameraOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isCameraOpen ? 'bg-green-500' : 'bg-slate-400'}`} />
                {isCameraOpen ? 'Live' : 'Offline'}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <LiveCamera
                  ref={cameraRef}
                  currentStepKey={1}
                  selectedDeviceId={selectedCameraId}
                  displayMode="inline"
                  onOpen={() => setIsCameraOpen(true)}
                  onClose={() => { setIsCameraOpen(false); setIsCameraReady(false); }}
                  onReadyChange={setIsCameraReady}
                  onError={(msg) => showToast(msg, 'error')}
                />
                {!isCameraOpen && <p className="text-white/50 text-sm">Camera inactive</p>}
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
                    <Button onClick={handleCapture} disabled={!isCameraReady} className="col-span-2">
                      <Camera className="w-4 h-4 mr-2" /> Capture
                    </Button>
                    <Button variant="ghost" onClick={handleCloseCamera} className="col-span-2 text-xs">Stop Camera</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleOpenCamera} className="col-span-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Camera className="w-4 h-4 mr-2" /> Start Camera
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={isLoading || !name || !photo} className="bg-slate-900 text-white hover:bg-slate-800">
            {isLoading ? 'Processing...' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
}
