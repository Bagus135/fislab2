"use client"
import { Mail, MessageCircle, SquareUser } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import DetailPicModal from "./detailPic-modal";

export default function ProfilePreview({profile} : {profile : GetSelfProfileType}){
  
    return (    
        <Card className="border-none shadow-none">
            <CardContent className="pt-6">
                <div className="flex flex-col">
                    <div className="w-full flex justify-center">
                        <DetailPicModal profile={profile}>
                            <Avatar className="w-40 h-40 relative z-[0] bg-slate-500 cursor-pointer" >
                                <AvatarImage src={!profile.profile_picture.trim()? "/avatar.png" : `/api/profile/picture/${profile.id}?t=${new Date().getTime()}`}/>
                            </Avatar>
                        </DetailPicModal>
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
    )
}