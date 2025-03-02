"use client"
import { Mail, MessageCircle, PencilIcon, SquareUser } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useRef} from "react";
import ProfileImageDialog from "./cropimg-dialog";

export default function ProfilePreview({profile} : {profile : GetSelfProfileType}){
    const ref = useRef<HTMLInputElement | null>(null);
    console.log(profile.profile_picture);
    
    const handleClickImg = ()=>{
        
        if(ref.current){
            ref.current.click()
        }
    }
    return (    
    <>
        <ProfileImageDialog inputRef={ref}/>
        <Card className="border-none shadow-none">
            <CardContent className="pt-6">
                <div className="flex flex-col">
                    <div className="w-full flex justify-center">
                        <Avatar className="w-40 h-40 relative z-[0] bg-slate-500" >
                            <AvatarImage src={!profile.profile_picture.trim()? "/avatar.png" : `/api/profile/picture/${profile.id}?t=${new Date().getTime()}`}/>
                            <Button variant={'outline'} 
                                    className="px-2 rounded-full absolute right-0 bottom-0 transform -translate-x-1/2 -translate-y-1/2 z-[10]" 
                                    size={'sm'}
                                    onClick={handleClickImg}
                                    >
                                <PencilIcon className="size-4 text-muted-foreground"  />
                            </Button> 
                        </Avatar>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-center">{profile.name}</h1>
                    <p className="text-muted-foreground text-center">{profile.nrp}</p>
                    <p className="mt-2 text-sm text-center">{profile.about || "-"}</p>

                    <div className="w-full mt-8 space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                            <SquareUser className="size-4 mr-2"/>
                            {profile.role}
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <MessageCircle className="size-4 mr-2"/>
                            {profile.phone}
                        </div>
                        
                        <div className="flex items-center text-muted-foreground text-xs">
                            <Mail className="size-4 mr-2"/>
                            {profile.email}
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    </>
    )
}