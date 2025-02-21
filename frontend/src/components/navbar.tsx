'use server'

import Link from "next/link";
import ThemeButton from "./themeToogle";
import { Button } from "./ui/button";

import { MobileSidebar } from "./sidebar";
import { Github } from "lucide-react";
import ProfileDropdown from "./dropdown-profile";

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



export default Navbar