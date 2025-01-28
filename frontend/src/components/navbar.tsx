'use server';

import Link from "next/link";
import ThemeButton from "./themeToogle";
import { Button } from "./ui/button";
import { ChevronDown, Github, Loader2Icon, LogOut, Menu, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { MobileSidebar } from "./sidebar";

const Navbar = async () =>{
    return (
        <nav className="sticky border-b top-0 w-full bg-background/95 backdrop-blur  supports-[backdrop-filter]:bg-background/60 z-50 ">
            <div className="px-2 md:pl-0">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center w-auto">
                        <div className="w-16 md:flex justify-center hidden ">
                            <img src="/logofisika.png" className=" h-6 w-6  dark:hidden "/>
                            <img src="/whitephi.png" className=" h-6 w-6  dark:block hidden"/>
                        </div>
                        <MobileSidebar/>
                        <Link href="/" className="text-xl font-mono font-bold text-primary tracking-widest ">
                            FISLAB
                        </Link>
                    </div>
                    <div className="flex space-x-2 md:space-x-4 items-center">
                        <ThemeButton/>
                        <Button size={'icon'} className="flex items-center gap-2 m-0" asChild variant={"ghost"}>
                            <Link href={'https://github.com/Bagus135/fislab2'}>
                                <Github className="size-4"/>
                            </Link>
                        </Button>
                        <ProfileDropdown/>
                    </div>
                </div>
            </div>
        </nav>
    )
} 


function ProfileDropdown (){
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
                                <User className="w-4 h-4"/>
                                <span className="inline">
                                    Profile
                                </span>
                            </Link>
                        </DropdownMenuLabel>
                        <DropdownMenuLabel className="hover:bg-accent hover:text-accent-foreground flex items-center gap-5" >
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


export default Navbar