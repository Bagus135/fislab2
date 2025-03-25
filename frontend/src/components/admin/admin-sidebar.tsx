'use client'

import { BookCopy, Gauge, GaugeCircleIcon, Megaphone, Menu, SquareActivity, SquareUser, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function AdminSidebarDesktop (){
    return (
        <div className="w-full h-[calc(100vh-4rem) flex flex-col space-y-4">
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/dashboard'}>
                <div className="w-8  flex justify-center">
                    <GaugeCircleIcon className="size-6"/>
                </div>
                <p className=" ">Dashboard</p>
            </Link>
        </Button>
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/grouping'}>
                <div className="w-8  flex justify-center">
                    <Users className="size-6"/>
                </div>
                <p className=" ">Grouping</p>
            </Link>
        </Button>
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/monitoring'}>
                <div className="w-8  flex justify-center">
                    <SquareActivity className="size-6"/>
                </div>
                <p className="">Monitoring</p>
            </Link>
        </Button>
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/moduls'}>
                <div className="w-8  flex justify-center">
                    <BookCopy className="size-6"/>
                </div>
                <p className=" ">Modul</p>
            </Link>
        </Button>
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/users'}>
                <div className="w-8  flex justify-center">
                    <SquareUser className="size-6"/>
                </div>
                <p className="">Users</p>
            </Link>
        </Button>
        <Button variant={'ghost'} className="w-full flex items-center justify-start mt-2" asChild>
            <Link href={'/admin/announcement'}>
                <div className="w-8  flex justify-center">
                    <Megaphone className="size-6"/>
                </div>
                <p className="">Announcement</p>
            </Link>
        </Button>
    </div>
    )
}

export function AdminSidebarMobile (){
    const [showMenu , setShowMenu] = useState(false)
    const pathname = usePathname();
    return (
        pathname.startsWith("/admin") &&
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
            <SheetTrigger asChild>
                <Button variant={'outline'} size={'lg'} className="h-8 px-2 mr-2 w-auto md:hidden">
                    <Menu className="size-4 font-bold"/>
                </Button>
            </SheetTrigger>
            <SheetContent side={"left"} className="w-[200px] min-h-screen pt-5 pr-2">
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
                <div className=" flex flex-col space-y-4 mt-6 w-full ">
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/dashboard'}>
                            <div className="w-8  flex justify-center">
                                <GaugeCircleIcon className="size-6"/>
                            </div>
                            <p className=" ">Dashboard</p>
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/grouping'}>
                            <div className="w-8  flex justify-center">
                                <Users className="size-6"/>
                            </div>
                            <p className=" ">Grouping</p>
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/monitoring'}>
                            <div className="w-8  flex justify-center">
                                <SquareActivity className="size-6"/>
                            </div>
                            <p className=" ">Monitoring</p>
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/moduls'}>
                            <div className="w-8  flex justify-center">
                                <BookCopy className="size-6"/>
                            </div>
                            <p className=" ">Modul</p>
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/users'}>
                            <div className="w-8  flex justify-center">
                                <SquareUser className="size-6"/>
                            </div>
                            <p className="">Users</p>
                        </Link>
                    </Button>
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <Link href={'/admin/announcement'}>
                            <div className="w-8  flex justify-center">
                                <Megaphone className="size-6"/>
                            </div>
                            <p className="">Announcement</p>
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
