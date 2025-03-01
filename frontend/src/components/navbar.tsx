'use server'

import Link from "next/link";
import ThemeButton from "./themeToogle";
import { Button } from "./ui/button";

import { MobileSidebar } from "./sidebar";
import { Github } from "lucide-react";
import ProfileDropdown from "./dropdown-profile";
import { getDecodeToken } from "@/action/auth.action";
import Image from "next/image";
import ClientNavbar from "./navbar-client";

const Navbar = async () =>{
    const token = await getDecodeToken()
    return (
        <nav className="sticky border-b top-0 w-full bg-background/95 backdrop-blur  supports-[backdrop-filter]:bg-background/60 z-50 ">
            <div className="px-2 md:pl-0">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center w-auto">
                        <div className="w-16 md:flex justify-center hidden ">
                              <Image
                                width={100}
                                height={100}
                                src="/logofisika.png"
                                alt="credits picture"
                                className=" h-6 w-6  dark:hidden "
                            />
                              <Image
                                width={100}
                                height={100}
                                src="/whitephi.png"
                                alt="credits picture"
                                className=" h-6 w-6  dark:block hidden"
                            />
                        </div>
                        { token.success ?
                            <MobileSidebar/>
                            :
                            null
                        }
                        <Link href="/" className="text-xl font-mono font-bold text-primary tracking-widest ">
                            FISLAB
                        </Link>
                    </div>
                    <ClientNavbar/>
                    <div className="flex space-x-2 md:space-x-4 items-center">
                        <ThemeButton/>
                        <Button size={'icon'} className="flex items-center gap-2 m-0" asChild variant={"ghost"}>
                            <Link href={'https://github.com/Bagus135/fislab2'}>
                                <Github className="size-4"/>
                            </Link>
                        </Button>
                        { token.success ?
                            <ProfileDropdown role={token.data.role}/>
                            :
                            <Button size={"default"} asChild>
                                <Link href={'/login'}>
                                    Login
                                </Link>
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </nav>
    )
} 



export default Navbar