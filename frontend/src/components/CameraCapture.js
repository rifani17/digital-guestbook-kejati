import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, X } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

export const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)

  const openCamera = () => {
    setIsModalOpen(true)
    setCameraError(false)
    setIsCameraReady(false)
  }

  const closeCamera = () => {
    setIsModalOpen(false)
    setIsCameraReady(false)
  }

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setImgSrc(imageSrc)
      onCapture(imageSrc)
      setIsModalOpen(false)
    }
  }

  const retake = () => {
    setImgSrc(null)
    onCapture(null)
    openCamera()
  }

  const handleUserMediaError = () => {
    setCameraError(true)
  }

  const handleUserMedia = () => {
    setIsCameraReady(true)
  }

  // Show preview if photo is captured
  if (imgSrc) {
    return (
      <div className="space-y-3">
        <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
          <img src={imgSrc} alt="Foto yang diambil" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={retake}
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            data-testid="retake-button"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Ganti Foto
          </Button>
          <Button
            type="button"
            onClick={() => { setImgSrc(null); onCapture(null); }}
            variant="outline"
            className="h-12 rounded-xl text-red-600 hover:text-red-700 hover:border-red-300"
            data-testid="remove-photo-button"
          >
            <X className="w-4 h-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>
    )
  }

  // Show button to open camera
  return (
    <>
      <div 
        onClick={openCamera}
        className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-colors"
      >
        <div className="text-center">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Klik untuk ambil foto</p>
          <p className="text-xs text-slate-400 mt-1">Menggunakan kamera perangkat</p>
        </div>
      </div>

      {/* Camera Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Ambil Foto
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 space-y-4">
            {cameraError ? (
              <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Kamera tidak tersedia</p>
                  <p className="text-xs text-slate-400 mt-1">Pastikan izin kamera sudah diberikan</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  onUserMediaError={handleUserMediaError}
                  onUserMedia={handleUserMedia}
                  videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720
                  }}
                />
                {!isCameraReady && (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm">Memuat kamera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 border-2 border-dashed border-white/30 m-6 rounded-lg pointer-events-none" />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={closeCamera}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={capture}
                disabled={!isCameraReady || cameraError}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                data-testid="capture-button"
              >
                <Camera className="w-4 h-4 mr-2" />
                Ambil Foto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
