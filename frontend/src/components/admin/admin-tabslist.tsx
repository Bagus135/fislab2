'use client'

import { ArrowRightCircle, Gauge, User, UsersRound } from "lucide-react";
import { TabsList, TabsTrigger } from "../ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState } from "react";

export function AdminTabsListDesktop (){
    return (
        <TabsList className="w-full justify-center gap-8 flex flex-col m-0 rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
                value="grouping"
                className=" p-2 text-xs md:text-sm w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <UsersRound className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Grouping</p>
            </TabsTrigger>
            <TabsTrigger
                value="a"
                className=" p-2 text-xs md:text-sm w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <Gauge className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Dashboard</p>
            </TabsTrigger>
            <TabsTrigger
                value="b"
                className=" p-2 text-xs md:text-sm w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <Gauge className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Dashboard</p>
            </TabsTrigger>
        </TabsList>
    )
}

export function AdminTabsListMobile (){
    const [showMenu , setShowMenu] = useState(false)
    return (
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetTrigger asChild>
            <Button variant={'outline'} size={'lg'} className="z-20 cursor-pointer h-8 px-2 mr-2 w-auto fixed top-1/2 translate-y-1/2 md:hidden">
                <ArrowRightCircle className="size-4 font-bold"/>
            </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="w-[200px] min-h-screen pt-5">
            <SheetHeader>
                <SheetTitle className="flex flex-row items-center gap-4 ">
                    <img src="/logofisika.png" className=" h-6 w-6 dark:hidden"/>
                    <img src="/whitephi.png" className=" h-6 w-6 hidden dark:block"/>
                    <p className="text-xl font-mono font-bold text-primary tracking-wider ">
                            FISLAB
                        </p>
                </SheetTitle>
            </SheetHeader>
            <TabsList className="w-full justify-center gap-8 flex flex-col m-0 rounded-none h-auto p-0 bg-transparent">
                <div className=" flex flex-col space-y-4 mt-6">
                    <Button variant={'ghost'} className="flex items-center gap-4 justify-start pl-0" asChild  onClick={()=>setShowMenu(!showMenu)}>
                        <TabsTrigger
                            value="profile"
                            className=" p-2 text-xs md:text-sm w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                            <User className="size-4"/>
                            <Separator orientation="vertical"/>
                            Profile
                        </TabsTrigger>
                    </Button>
                </div>
            </TabsList>
        </SheetContent>
    </Sheet>
    )
}
