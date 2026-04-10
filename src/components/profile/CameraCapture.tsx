import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Camera, RotateCcw, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarUpdated: (url: string) => void;
}

export const CameraCapture = ({ open, onOpenChange, onAvatarUpdated }: CameraCaptureProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Camera is not supported in this browser/environment.";
      setCameraError(msg);
      toast({
        title: "Camera Unsupported",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure any previous stream is stopped before starting again
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          // Ignore autoplay/play errors; the stream may still attach.
        });
      }

      setCameraActive(true);
    } catch (error: any) {
      console.error("Camera error:", error);

      const name = error?.name as string | undefined;
      const msg =
        name === "NotAllowedError"
          ? "Camera permission was blocked. Allow camera access in your browser, then try again."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : name === "NotReadableError"
              ? "Camera is already in use by another app (Zoom/Meet/etc.). Close it and try again."
              : name === "SecurityError"
                ? "Camera access is blocked by the browser security policy. If you’re using an embedded preview, try opening the app in a new tab."
                : "Unable to access camera. Please check permissions.";

      setCameraError(msg);
      toast({
        title: "Camera Error",
        description: msg,
        variant: "destructive",
      });
      stopCamera();
    }
  }, [stopCamera, toast]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the image for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const uploadPhoto = async () => {
    if (!capturedImage || !user) return;
    
    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: "Your profile photo has been updated.",
      });

      onAvatarUpdated(publicUrl);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to save your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Radix calls this whenever the user closes via ESC / overlay click / close button
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  // Start/stop camera only AFTER the dialog has mounted (prevents "loading forever")
  useEffect(() => {
    if (!open) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    const t = window.setTimeout(() => {
      startCamera();
    }, 0);

    return () => {
      window.clearTimeout(t);
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Take Profile Photo
          </DialogTitle>
          <DialogDescription>
            Use your camera to take a profile photo. Make sure to allow camera access when prompted by your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {cameraError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{cameraError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={startCamera}
              >
                Try Again
              </Button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                onClick={retakePhoto}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={uploadPhoto}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Use Photo
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="w-full sm:w-auto"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
