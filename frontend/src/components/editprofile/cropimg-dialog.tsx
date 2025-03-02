'use client';

import { RefObject, useRef, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { deleteProfilePicture, uploadProfilePicture } from '@/action/profile.action';
import { useToast } from '@/hooks/use-toast';
import { Loader2Icon, Save, Trash,  } from 'lucide-react';

interface ProfileImageDialogProps {
  inputRef: RefObject<HTMLInputElement | null>
}

export default function ProfileImageDialog({ 
  inputRef,
}: ProfileImageDialogProps) {
  const {toast} = useToast()
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({
    save : false,
    delete : false
  })
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

  const handleSaveChanges = async () => {
    if (!completedCrop || !originalImage || !imgRef.current) return;

    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        imgRef.current!,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convert the canvas to a Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setLoading({
              ...loading , save : true
            })
            const formData = new FormData();
            formData.append('profilePicture', blob, 'profile-picture.png');
            const res = await uploadProfilePicture(formData);
            console.log(res)
            toast({
              title : "Image Uploaded sucessfully",
              variant : 'success',
              description : res.message
            })
            setOpen(false);
            setOriginalImage(null);
            setCompletedCrop(null)
          } catch (error:any) {
            toast({
              title : "Error to uploading image",
              variant : 'destructive',
              description : 'Something went wrong :('
            })
          } finally {
            setLoading({
              ...loading, save : false
            })
          }
        }
      }, 'image/png');
    }

  };

  const handleDeletePic = async()=>{
    try {
      setLoading({
        ...loading, delete : true
      })
      const res = await deleteProfilePicture()
      toast({
         title : "Profile Picture Deleted",
         description : res.message,
         variant : 'success'
      })
      setOpen(false)
    } catch (error:any) {
      toast({
         title : "Failed to deleted Profile Picture",
         description : 'Something Went Wrong',
         variant : 'destructive'
      })
    } finally {
      setLoading({
        ...loading, delete : false
      })
    }
  }


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
                      ref={imgRef}
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
            </div>

            <DialogFooter className='gap-4'>
              <Button 
                variant="outline" 
                className='bg-red-500 hover:bg-red-600'
                onClick={handleDeletePic}>
                  {loading.delete ? 
                    <Loader2Icon className='animate-spin size-4'/>
                    :
                      <>
                      <Trash className='size-4'/>
                      Delete
                      </>
                  }
              </Button>
              <Button 
                disabled={!completedCrop || !originalImage||  loading.delete || loading.save}
                onClick={handleSaveChanges}
              >{ loading.save ?
                <Loader2Icon className='size-4 animate-spin'/>
                  :
                  <>
                  <Save className='size-4'/>
                    Save
                  </>
              }
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}