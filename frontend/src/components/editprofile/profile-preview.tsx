"use client"
import { Instagram, LinkIcon, MessageCircle, PencilIcon } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useRef } from "react";
import { Input } from "../ui/input";
import ProfileImageDialog from "./cropimg-dialog";

export default function ProfilePreview(){
    const ref = useRef<HTMLInputElement | null>(null);

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
                            <AvatarImage src={"/avatar.png"}/>
                            <Button variant={'outline'} 
                                    className="px-2 rounded-full absolute right-0 bottom-0 transform -translate-x-1/2 -translate-y-1/2 z-[10]" 
                                    size={'sm'}
                                    onClick={handleClickImg}
                                    >
                                <PencilIcon className="size-4 text-muted-foreground"  />
                            </Button> 
                        </Avatar>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-center">Alief Hisyam Al Hasany Nur Rahmat</h1>
                    <p className="text-muted-foreground text-center">5001221060</p>
                    <p className="mt-2 text-sm text-center">Saya adalah seorang pemula</p>

                    <div className="w-full mt-6 space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                            <MessageCircle className="size-4 mr-2"/>
                            +6282336658441
                        </div>
                        
                    <div className="flex items-center text-muted-foreground">
                        <Instagram className="size-4 mr-2"/>
                        @bagustaqim_
                    </div>

                        <div className="flex items-center text-muted-foreground">
                            <LinkIcon className="size-4 mr-2"/>
                            <a href={`https://a.com`}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer">
                                    https://a.com
                                </a>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </>
    )
}