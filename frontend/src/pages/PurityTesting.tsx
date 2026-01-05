import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle, Gem, QrCode, Play, Square,
  ScanLine, Download, Monitor, Video, Check
} from 'lucide-react';
import { StepIndicator } from '../components/journey/StepIndicator';
import { showToast } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ModernLayout } from '@/components/layouts/ModernLayout';
import { CameraSelect } from '../components/ui/camera-select';
import { useCameraDetection } from '../hooks/useCameraDetection';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

// Backend Base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function PurityTesting() {
  const navigate = useNavigate();
  const [jewelleryItems, setJewelleryItems] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedActivities, setDetectedActivities] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [rubbingCompleted, setRubbingCompleted] = useState(false);
  const [acidCompleted, setAcidCompleted] = useState(false);

  // Refs for local video elements
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const stream1Ref = useRef(null);
  const stream2Ref = useRef(null);
  const analysisIntervalRef = useRef(null);
  const isRecordingRef = useRef(false);

  const {
    cameras, selectedFaceCam, selectedScanCam, permission,
    selectFaceCam, selectScanCam, testCamera, requestPermission
  } = useCameraDetection();

  const [showCameraSelection, setShowCameraSelection] = useState(!selectedFaceCam || !selectedScanCam);

  useEffect(() => {
    if (!selectedFaceCam || !selectedScanCam) setShowCameraSelection(true);
  }, [selectedFaceCam, selectedScanCam]);

  useEffect(() => {
    const initCameras = async () => { if (permission.status === 'prompt') await requestPermission(); };
    initCameras();
  }, [permission.status]);

  useEffect(() => {
    const storedItems = localStorage.getItem('jewelleryItems');
    if (storedItems) setJewelleryItems(JSON.parse(storedItems));
    else { showToast('No items found', 'error'); navigate('/rbi-compliance'); }
    return () => stopVideoRecording(false);
  }, [navigate]);

  const startVideoRecording = async () => {
    try {
      if (!selectedFaceCam || !selectedScanCam) {
        setShowCameraSelection(true);
        return showToast('Select cameras first', 'error');
      }

      const stream1 = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: selectedFaceCam.deviceId }, width: 640, height: 480 } });
      stream1Ref.current = stream1;
      if (video1Ref.current) video1Ref.current.srcObject = stream1;

      const device2Id = selectedFaceCam.deviceId === selectedScanCam.deviceId ? selectedFaceCam.deviceId : selectedScanCam.deviceId;
      const stream2 = selectedFaceCam.deviceId === selectedScanCam.deviceId ? stream1 : await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: device2Id }, width: 640, height: 480 } });

      stream2Ref.current = stream2;
      if (video2Ref.current) video2Ref.current.srcObject = stream2;

      setIsRecording(true);
      isRecordingRef.current = true;
      setDetectedActivities([]);
      setRubbingCompleted(false);
      setAcidCompleted(false);

      try { await fetch(`${BASE_URL}/api/purity/reset_status`, { method: 'POST' }); } catch (e) { }
      setTimeout(startAnalysisLoop, 100);
      showToast('Analysis started', 'success');
    } catch (e) {
      showToast('Failed to start cameras', 'error');
    }
  };

  const startAnalysisLoop = () => {
    const runAnalysis = async () => {
      if (!isRecordingRef.current || !stream1Ref.current) return;
      try {
        const frame1 = captureFrameToB64(video1Ref.current, canvas1Ref.current);
        const frame2 = captureFrameToB64(video2Ref.current, canvas2Ref.current);

        if (frame1 || frame2) {
          const res = await fetch(`${BASE_URL}/api/purity/analyze`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame1, frame2 })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.rubbing_detected && !rubbingCompleted) {
              setRubbingCompleted(true);
              setDetectedActivities(prev => [...prev, { activity: 'rubbing', timestamp: Date.now() }]);
              showToast('Rubbing detected', 'success');
            }
            if (data.acid_detected && !acidCompleted) {
              setAcidCompleted(true);
              setDetectedActivities(prev => [...prev, { activity: 'acid_testing', timestamp: Date.now() }]);
              showToast('Acid testing detected', 'success');
            }
          }
        }
      } catch (err) { }
      if (isRecordingRef.current) analysisIntervalRef.current = setTimeout(runAnalysis, 500);
    };
    runAnalysis();
  };

  const captureFrameToB64 = (video, canvas) => {
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = 480; canvas.height = 360;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.6);
  };

  const stopVideoRecording = (notify = true) => {
    if (analysisIntervalRef.current) clearTimeout(analysisIntervalRef.current);
    if (stream1Ref.current) stream1Ref.current.getTracks().forEach(t => t.stop());
    if (stream2Ref.current) stream2Ref.current.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    isRecordingRef.current = false;
    if (notify) showToast('Analysis stopped', 'info');
  };

  const handleNext = () => {
    if (!rubbingCompleted || !acidCompleted) return showToast('Complete all purity tests', 'error');
    localStorage.setItem('purityResults', JSON.stringify({ rubbingCompleted, acidCompleted, detectedActivities, timestamp: new Date().toISOString() }));
    navigate('/appraisal-summary');
  };

  const generateQRCode = async () => {
    const data = { rubbing: rubbingCompleted, acid: acidCompleted, timestamp: Date.now() };
    setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data)));
    setShowQrCode(true);
  };

  return (
    <ModernLayout title="New Appraisal" subtitle="Purity Testing">
      <div className="max-w-6xl mx-auto space-y-8">
        <StepIndicator currentStep={4} />

        {/* Top Bar: Camera Setup & Control */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${isRecording ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500' : 'bg-slate-400'}`} />
              {isRecording ? 'System Active' : 'Ready'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCameraSelection(!showCameraSelection)}>
              <Video className="w-4 h-4 mr-2" /> {showCameraSelection ? 'Hide Cameras' : 'Cameras'}
            </Button>
            {isRecording ? (
              <Button variant="destructive" onClick={() => stopVideoRecording()}>
                <Square className="w-4 h-4 mr-2" /> Stop Analysis
              </Button>
            ) : (
              <Button onClick={startVideoRecording} disabled={!selectedFaceCam || !selectedScanCam} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="w-4 h-4 mr-2" /> Start Analysis
              </Button>
            )}
          </div>
        </div>

        {showCameraSelection && (
          <Card className="bg-slate-50 border-slate-200 shadow-inner">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <CameraSelect label="Top View (Rubbing)" devices={cameras} selectedDevice={selectedFaceCam} onSelect={selectFaceCam} onTest={testCamera} />
              <CameraSelect label="Side View (Acid)" devices={cameras} selectedDevice={selectedScanCam} onSelect={selectScanCam} onTest={testCamera} />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <Card className="lg:col-span-2 overflow-hidden shadow-sm border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 bg-white">
              <CardTitle className="text-base flex items-center gap-2"><ScanLine className="w-4 h-4 text-blue-600" /> Live Analysis Feed</CardTitle>
            </CardHeader>
            <div className="grid grid-rows-2 gap-px bg-slate-100 h-[600px]">
              <div className="relative bg-black group overflow-hidden">
                <video ref={video1Ref} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvas1Ref} className="hidden" />
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Top View</div>
              </div>
              <div className="relative bg-black group overflow-hidden">
                <video ref={video2Ref} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvas2Ref} className="hidden" />
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Side View</div>
              </div>
            </div>
          </Card>

          {/* Sidebar: Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Test Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${rubbingCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rubbingCompleted ? 'bg-green-100 text-green-600' : 'bg-white text-slate-300'}`}>
                    {rubbingCompleted ? <Check className="w-6 h-6" /> : <Gem className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Rubbing Test</p>
                    <p className="text-xs text-slate-500">{rubbingCompleted ? 'Verified' : 'Pending...'}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${acidCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${acidCompleted ? 'bg-green-100 text-green-600' : 'bg-white text-slate-300'}`}>
                    {acidCompleted ? <Check className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Acid Test</p>
                    <p className="text-xs text-slate-500">{acidCompleted ? 'Verified' : 'Pending...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Activity Log</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto space-y-2 pr-2">
                  {detectedActivities.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">No activities detected</p>
                  ) : detectedActivities.map((act, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-medium text-slate-700">{act.activity === 'rubbing' ? 'Rubbing' : 'Acid Test'}</span>
                      <span className="text-xs text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={generateQRCode} disabled={!rubbingCompleted && !acidCompleted}>
              <QrCode className="w-4 h-4 mr-2" /> Generate QR
            </Button>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => navigate('/rbi-compliance')}>Back</Button>
          <Button onClick={handleNext} disabled={!rubbingCompleted || !acidCompleted} className="bg-slate-900 text-white">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {showQrCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-sm">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4">Test Token</h3>
                <img src={qrCodeUrl} className="w-48 h-48 mb-4 border rounded-lg" />
                <Button onClick={() => setShowQrCode(false)} className="w-full">Close</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}