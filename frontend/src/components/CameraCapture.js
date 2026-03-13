import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Camera, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [cameraError, setCameraError] = useState(false)

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setImgSrc(imageSrc)
      onCapture(imageSrc)
    }
  }

  const retake = () => {
    setImgSrc(null)
    onCapture(null)
  }

  const handleUserMediaError = () => {
    setCameraError(true)
  }

  if (cameraError) {
    return (
      <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
        <div className="text-center">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Kamera tidak tersedia</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
        {!imgSrc ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              onUserMediaError={handleUserMediaError}
            />
            <div className="absolute inset-0 border-2 border-dashed border-white/30 m-8 rounded-lg pointer-events-none" />
          </>
        ) : (
          <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>
      
      {!imgSrc ? (
        <Button
          type="button"
          onClick={capture}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          data-testid="capture-button"
        >
          <Camera className="w-5 h-5 mr-2" />
          Ambil Foto
        </Button>
      ) : (
        <Button
          type="button"
          onClick={retake}
          variant="outline"
          className="w-full h-14 rounded-xl"
          data-testid="retake-button"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Ambil Ulang
        </Button>
      )}
    </div>
  )
}