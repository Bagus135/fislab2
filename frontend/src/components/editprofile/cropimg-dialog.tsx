'use client';

import { RefObject, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileImageDialogProps {
  dialogRef : RefObject<HTMLButtonElement | null>
}

export default function ProfileImageDialog({ 
  dialogRef,
}: ProfileImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    width: 200,
    height: 200,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const cropImage = useCallback(
    async (image: HTMLImageElement, crop: Crop) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        return canvas.toDataURL('image/jpeg');
      }
    },
    []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden" ref={dialogRef}>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Upload and crop your profile picture. The image will be cropped to a square.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-10rem)]">
        <div className="space-y-4 py-4">
          <Input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="cursor-pointer"
          />

          {originalImage && (
            <div className="max-w-full overflow-hidden rounded-lg border mb-2">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <Image
                  ref={imgRef as any}
                  src={originalImage}
                  alt="Original"
                  width={500}
                  height={500}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </ReactCrop>
            </div>
          )}
          <p className={`${!error.trim()? "hidden": "block text-red-500 mt-0"}`}>test</p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              setOriginalImage(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            disabled={!completedCrop || !originalImage|| loading}
          >
            { loading? <Loader2Icon className='size-4 animate-spin'/>
              :
            `Save Changes`
            }
          </Button>
        </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}