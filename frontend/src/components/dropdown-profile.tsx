'use client'

import { ChevronDown, Loader2Icon, LogOut, UserRoundCog, UserRoundPen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { removeCookies } from "@/action/auth.action";

export default function ProfileDropdown (){
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar >
                        <Button variant={'ghost'} className="flex px-2 md:px-2 ">
                            <AvatarImage src="/avatar.png" alt="profilePic" className="w-6 h-6"/>
                            <ChevronDown className="size-4 hidden md:block"/>
                        </Button>
                        <AvatarFallback>
                            <Loader2Icon className="animate-spin size-4"/>
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto -translate-x-2">
                    <DropdownMenuGroup >
                        <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 " asChild>
                            <Link href={`/profile/me`}>
                                <UserRoundPen className="w-4 h-4"/>
                                <span className="inline">
                                    Profile
                                </span>
                            </Link>
                        </DropdownMenuLabel>
                        <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5 " asChild>
                            <Link href={`/admin`}>
                                <UserRoundCog className="w-4 h-4"/>
                                <span className="inline">
                                    Admin
                                </span>
                            </Link>
                        </DropdownMenuLabel>
                        <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5"  onClick={removeCookies} >
                                <LogOut className="w-4 h-4"/>
                                <span className="inline">
                                    Log Out
                                </span>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}