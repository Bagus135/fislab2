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
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


interface ProfileImageDialogProps {
  inputRef : RefObject<HTMLInputElement | null>
}

export default function ProfileImageDialog({ 
  inputRef,
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      setOpen(true);
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
          <Input
          
            type="file"
            ref={inputRef}
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
            />
      <DialogContent className="sm:max-w-screen-sm p-0">
        <ScrollArea className="max-h-[calc(100vh-10rem)] p-0">
          <div className="w-full p-8">

         
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Upload and crop your profile picture. The image will be cropped to a square.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {originalImage && (
            <div className="max-w-full overflow-hidden rounded-lg border mb-2">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                keepSelection
              >
                <Image
                  ref={imgRef as any}
                  src={originalImage}
                  alt='img'
                  width="0"
                  height="0"
                  sizes="100%"
                  className="w-full h-auto"
                />
              </ReactCrop>
            </div>
          )}
          <p className={`${!error.trim()? "hidden": "block text-red-500 mt-0"}`}>test</p>
        </div>

        <DialogFooter className='gap-4'>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}