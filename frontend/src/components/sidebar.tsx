'use client'
import Link from "next/link";
import { Button } from "./ui/button"; // shadcn
import { BarChartBigIcon, Calendar, CheckSquare, FlaskConical, Gauge, Megaphone, Menu, } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function SideBar () {
    return (
        <div className="w-full h-[calc(100vh-4rem) flex flex-col space-y-4">
            <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
                <Link href={'/dashboard'}>
                    <div className="w-8  flex justify-center">
                        <Gauge className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Dashboard</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
                <Link href={'/practicum'}>
                    <div className="w-8  flex justify-center">
                        <FlaskConical className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Practicum</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Calendar className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Schedule</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start" asChild>
                <Link href={'/presence'}>
                    <div className="w-8  flex justify-center">
                        <CheckSquare className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2">Presence</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start" asChild>
                <Link href={'/announcement'}>
                    <div className="w-8  flex justify-center">
                    <svg className="size-6 transform -scale-x-100 dark:fill-white" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <rect fill="none" height="256" width="256"/>
                        <path d="M152,80V203.7a7.9,7.9,0,0,0,3.6,6.7l11,7.3a8,8,0,0,0,12.2-4.7L192,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                        <path d="M192,160a40,40,0,0,0,0-80H152S97.5,80,45.1,36.1A8,8,0,0,0,32,42.2V197.8a8,8,0,0,0,13.1,6.1C97.5,160,152,160,152,160Z" fill="none" stroke="currentColor " strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                    </svg>
                    </div>
                    <p className="hidden lg:flex ml-2">Announcement</p>
                </Link>
            </Button>
        </div>
    )
}

export function MobileSidebar () {
    const [showMenu, setShowMenu] = useState(false);
    const pathname = usePathname()
    return (
        (!pathname.startsWith("/admin") && !pathname.startsWith("/profile"))&&
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
            <SheetTrigger asChild>
                <Button variant={'outline'} size={'lg'} className="h-8 px-2 mr-2 w-auto md:hidden">
                    <Menu className="size-4 font-bold"/>
                </Button>
            </SheetTrigger>
            <SheetContent side={"left"} className="w-[200px] min-h-screen pt-5">
                <SheetHeader>
                    <SheetTitle className="flex flex-row items-center gap-4 ">
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
                        <p className="text-xl font-mono font-bold text-primary tracking-wider ">
                                FISLAB
                            </p>
                    </SheetTitle>
                </SheetHeader>
                <div className=" flex flex-col space-y-4 mt-6">
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/dashboard'}>
                            <BarChartBigIcon className="size-6"/>
                            <Separator orientation="vertical"/>
                                Dashboard
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/practicum'}>
                            <FlaskConical className="size-6"/>
                            <Separator orientation="vertical"/>
                                Practicum
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/schedule'}>
                            <Calendar className="size-6"/>
                            <Separator orientation="vertical"/>
                                Schedule
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/presence'}>
                            <CheckSquare className="size-6"/>
                            <Separator orientation="vertical"/>
                                Presence
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/announcement'}>
                            <svg className="size-6 transform -scale-x-100 dark:fill-white" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                <rect fill="none" height="256" width="256"/>
                                <path d="M152,80V203.7a7.9,7.9,0,0,0,3.6,6.7l11,7.3a8,8,0,0,0,12.2-4.7L192,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                                <path d="M192,160a40,40,0,0,0,0-80H152S97.5,80,45.1,36.1A8,8,0,0,0,32,42.2V197.8a8,8,0,0,0,13.1,6.1C97.5,160,152,160,152,160Z" fill="none" stroke="currentColor " strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                            </svg>
                            <Separator orientation="vertical"/>
                                Announcement
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}