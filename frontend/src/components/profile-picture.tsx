import { getProfilePic } from "@/action/profile.action"
import {  memo, useEffect, useState } from "react"
import { Skeleton } from "./ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const ProfilePicture = memo (function ProfilePicture ({id, size} : {id : string, size : string}) {
    const [pic, setPic] = useState(false)
    const [loadingPic, setLoadingPic] = useState(false)
   useEffect(()=>{
          const getPic = async () =>{
              try{
                  setLoadingPic(true)
                  const res = await getProfilePic(id)
                  setPic(res)
              } finally {
                  setLoadingPic(false);
              }
          }
          getPic()
      }, [id])

    return (
    loadingPic?
        <Skeleton className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"/>
        : 
        <Avatar >
            <AvatarImage className={`${size}`} src={!pic ? `/avatar.png` : `/api/profile/picture/${id}?t=${new Date().getTime()}`}/>
            <AvatarFallback>
                <Skeleton className={`${size} relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full`}/>
            </AvatarFallback>
        </Avatar>
    )
}
)
export default ProfilePicture