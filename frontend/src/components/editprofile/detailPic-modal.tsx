import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useRef, useState } from "react";
import ProfileImageDialog from "./cropimg-dialog";
import { Button } from "../ui/button";
import { Loader2Icon, PencilIcon, Trash2 } from "lucide-react";
import { deleteProfilePicture } from "@/action/profile.action";

export default function DetailPicModal({children, profile} : {children : React.ReactNode, profile:GetSelfProfileType}){
    const ref = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState({
        delete : false
    })


    const handleClickImg = ()=>{
        
        if(ref.current){
            ref.current.click()
        }
    }

    const handleDeletePic = async()=>{
        try {
          setLoading({
            ...loading, delete : true
          })
          await deleteProfilePicture()
        } catch (error:any) {
          return null
        } finally {
          setLoading({
            ...loading, delete : false
          })
        }
      }
    
    return (
    <>
        <ProfileImageDialog inputRef={ref}/>
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none w-auto h-auto  p-0 ">
                <DialogHeader className="hidden">
                    <DialogTitle/>
                    <DialogDescription/>
                </DialogHeader>
                <div className="flex flex-col w-auto items-center">
                    <Image 
                        width={600}
                        height={600}
                        alt="profile image"
                        src={!profile.profile_picture.trim()? "/avatar.png" : `/api/profile/picture/${profile.id}?t=${new Date().getTime()}`}/>
                    <div className="flex flex-row gap-2 bg-primary-foreground p-2 w-full ">
                        <Button variant={'ghost'} 
                                size={'sm'}
                                onClick={handleClickImg}
                                className="focus-visible:ring-0 w-1/2"
                                >
                            <PencilIcon className="size-4 "  />
                        </Button> 
                        <Button variant={'ghost'} 
                                size={'sm'}
                                onClick={handleDeletePic}
                                className="focus-visible:ring-0 w-1/2"
                                >
                            { loading.delete ? 
                                <Loader2Icon className="size-4 animate-spin"/>
                                :
                                <Trash2 className="size-4 text-red-400 hover:text-red-500"  />
                                }
                        </Button> 
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </>
    )
}