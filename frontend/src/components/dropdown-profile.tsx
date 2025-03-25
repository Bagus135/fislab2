'use client'

import { BarChartBigIcon, ChevronDown, LogOut, UserRoundCog, UserRoundPen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { removeCookies } from "@/action/auth.action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfilePic } from "@/action/profile.action";
import { Skeleton } from "./ui/skeleton";

export default function ProfileDropdown ({role , id} : {role : string, id : string}){
    const [pic , setPic] = useState(false)
    const [loading, setLoading] = useState({
        loadingPic : false,
        logOut : false,
    });
    const {toast} = useToast();
    const router = useRouter();

    useEffect(()=>{
        const getPic = async () =>{
            try{
                setLoading({...loading, loadingPic : true })
                const res = await getProfilePic(id)
                setPic(res)
            } finally {
                setLoading({...loading, loadingPic : false })
            }
        }
        getPic()
    }, [id])
    
    const handleLogout = async () => {
        try {
            if(loading.logOut) return
            setLoading({...loading, logOut : true })
            await removeCookies();
            router.push("/login")
            toast({
                variant : "success",
                title : "Log out successfully",
                description : "Good Bye ^_^"
            })
        } catch (error : any) {
            toast({
                variant : "destructive",
                title : "Log out failed",
                description : error.message
            })
        } finally {
            setLoading({...loading, logOut : false })
        }
    }
    

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    { loading.loadingPic ?
                        <Avatar >
                            <Button variant={'ghost'} className="flex px-2 md:px-2 ">
                                <Skeleton className="w-6 h-6 rounded-full"/>
                                <ChevronDown className="size-4 hidden md:block"/>
                            </Button>
                        </Avatar>
                        :
                        <Avatar >
                            <Button variant={'ghost'} className="flex px-2 md:px-2 ">
                                <AvatarImage src={!pic ? `/avatar.png` : `/api/profile/picture/${id}?t=${new Date().getTime()}`} alt="profilePic" className="w-6 h-6 rounded-full"/>
                                <ChevronDown className="size-4 hidden md:block"/>
                            </Button>
                        </Avatar>
                    }
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto -translate-x-2">
                    <DropdownMenuGroup >
                        { ["PRAKTIKAN", "ASISTEN"].includes(role) &&
                           <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 " asChild>
                           <Link href={`/dashboard`}>
                               <BarChartBigIcon className="w-4 h-4"/>
                               <span className="inline">
                                   Dashboard
                               </span>
                           </Link>
                       </DropdownMenuLabel>
                        }
                        
                        <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 " asChild>
                            <Link href={`/profile/me`}>
                                <UserRoundPen className="w-4 h-4"/>
                                <span className="inline">
                                    Profile
                                </span>
                            </Link>
                        </DropdownMenuLabel>
                        { ["ADMIN", "SUPER_ADMIN"].includes(role) &&
                            <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 " asChild>
                            <Link href={`/admin`}>
                                <UserRoundCog className="w-4 h-4"/>
                                <span className="inline">
                                    Admin
                                </span>
                            </Link>
                        </DropdownMenuLabel>
                        }
                        <DropdownMenuLabel  className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 cursor-pointer"  onClick={handleLogout} >
                                <LogOut className="w-4 h-4"/>
                                <p className="inline">
                                    Log Out
                                    { loading.logOut &&
                                        <span className="animate-caret-blink">
                                            {' ...'}
                                        </span>
                                    }
                                </p>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}