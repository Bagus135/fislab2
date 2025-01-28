'use client'
import Link from "next/link";
import { Button } from "./ui/button"; // shadcn
import { Calendar, Gauge, Home, HomeIcon, Menu, Search, SigmaSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Separator } from "./ui/separator";

export default function SideBar () {
    return (
        <div className="w-full h-[calc(100vh-4rem) flex flex-col space-y-4">
            <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Gauge className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Dashboard</p>
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
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Home className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2">Home</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start" asChild>
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Home className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2">Home</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start" asChild>
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Home className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2">Home</p>
                </Link>
            </Button>
            <Button variant={'ghost'} className="w-full flex items-center justify-start" asChild>
                <Link href={'/schedule'}>
                    <div className="w-8  flex justify-center">
                        <Home className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2">Home</p>
                </Link>
            </Button>
        </div>
    )
}

export function MobileSidebar () {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
            <SheetTrigger asChild>
                <Button variant={'outline'} size={'lg'} className="h-8 px-2 mr-2 w-auto md:hidden">
                    <Menu className="size-4 font-bold"/>
                </Button>
            </SheetTrigger>
            <SheetContent side={'left'} className="w-[200px] min-h-screen pt-5">
                <SheetHeader >
                    <SheetTitle className="flex flex-row items-center gap-4 ">
                        <img src="/logofisika.png" className=" h-6 w-6 dark:hidden"/>
                        <img src="/whitephi.png" className=" h-6 w-6 hidden dark:block"/>
                        <p className="text-xl font-mono font-bold text-primary tracking-wider ">
                                FISLAB
                            </p>
                    </SheetTitle>
                </SheetHeader>
                <div className=" flex flex-col space-y-4 mt-6">
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild>
                        <Link href={'/'}>
                            <HomeIcon className="size-6"/>
                            <Separator orientation="vertical"/>
                                Home
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild>
                        <Link href={'/'}>
                            <HomeIcon className="size-6"/>
                            <Separator orientation="vertical"/>
                                Home
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild>
                        <Link href={'/'}>
                            <HomeIcon className="size-6"/>
                            <Separator orientation="vertical"/>
                                Home
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild>
                        <Link href={'/'}>
                            <HomeIcon className="size-6"/>
                            <Separator orientation="vertical"/>
                                Home
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}