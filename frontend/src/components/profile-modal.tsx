'use client'

import {Loader2Icon, Mail, MessageCircle, Tag } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { getToken } from "@/action/auth.action";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfilePic } from "@/action/profile.action";


type GetDetailProfileType =
    | { success: true; data: DetailProfileType } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export default  function ProfileModal({id , open ,setOpen} : { id : string ,open:boolean ,setOpen : (open : boolean) => void }) {
   const [user , setUser] = useState<GetDetailProfileType|null>(null)
   const [loading, setLoading] = useState(false);
   const [pic, setPic] = useState(false)
   
    useEffect( () =>{
        const getDetailProfile = async(id : string) =>{
            try {
                setLoading(true)
                const token = await getToken();
                const [res, profilePic] =  await Promise.all([fetch(`/api/profile/${id}`,{
                    headers : {
                        "Content-Type" : "application/json",
                        "Authorization" : token,
                    },
                    method : "GET"
                }),
                getProfilePic(id)
                ])

                const data = await res.json();
                
                if(!res.ok) throw data
                
                setPic(profilePic)
                setUser({
                    success : true,
                    data : data
                })
                
                
            } catch (error : any) {
                setUser({
                    success : false,
                    data : error
                })  
            } finally {
                setLoading(false)
            }
        }
        getDetailProfile(id)
    },[id])
    
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="p-0 border-none shadow-none">
                <DialogHeader className="hidden">
                    <DialogTitle />
                    <DialogDescription />
                </DialogHeader>
                <Card className="border-none shadow-none">
                    { loading ? 
                    <CardContent className="h-[calc(50vh)] flex items-center justify-center">
                        <Loader2Icon className="size-6 animate-spin"/>
                    </CardContent>
                        :
                   user &&
                    <CardContent className="p-0 border-none shadow-none">
                        { user.success ?
                        <>
                            <div className="bg-slate-500 relative h-[120px] py-4">
                                <div className="w-full absolute flex justify-center">
                                    <Avatar className="w-40 h-40 relative z-[0] bg-slate-500" >
                                        <AvatarImage src={!pic? "/avatar.png" : `/api/profile/picture/${user.data.id}?t=${new Date().getTime()}`}/>
                                    </Avatar>
                                </div>
                            </div>
                            <div className="p-6 mt-10">

                                <h1 className="mt-4 text-2xl font-bold text-center">{user.data.name}</h1>
                                <p className="text-muted-foreground text-center">{user.data.nrp}</p>
                                <p className="mt-2 text-sm text-center">{user.data.about }</p>


                                <div className="w-full mt-6 space-y-2 text-sm ">
                                    <div className="flex items-center text-muted-foreground capitalize">
                                        <Tag className="size-4 mr-2"/>
                                        {user.data.role }
                                    </div>
                                        <div className="flex items-center text-muted-foreground"> 
                                            <Link href={`https://wa.me/${user.data.phone || '-'}`} className="flex items-center text-muted-foreground hover:underline">
                                                <MessageCircle className="size-4 mr-2"/>
                                                {user.data.phone || '-'}
                                            </Link>
                                        </div>
                                        
                                    <div className="flex items-center text-muted-foreground">
                                        <Mail className="size-4 mr-2"/>
                                        {user.data.email || '-'}
                                    </div>
                                
                                </div>
                            </div>
                        </>
                            :
                            <div className=" text-center capitalize p-6 mt-10">
                               Error : {user.data.error}
                            </div>
                            }
                    </CardContent>
                    }
                </Card>
            </DialogContent>
        </Dialog>
    )
}