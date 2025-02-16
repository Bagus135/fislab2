'use client'

import { ArrowRightCircle, Gauge, SquareActivity, SquareUser, User, UsersRound } from "lucide-react";
import { TabsList, TabsTrigger } from "../ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useState } from "react";

export function AdminTabsListDesktop (){
    return (
        <TabsList className="w-full justify-center items-start gap-8 flex flex-col m-0 rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
                value="grouping"
                className=" p-2 text-xs md:text-sm w-full flex items-center justify-start gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <UsersRound className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Grouping</p>
            </TabsTrigger>
            <TabsTrigger
                value="monitoring"
                className=" p-2 text-xs md:text-sm w-full flex items-center justify-start gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <SquareActivity className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Monitoring</p>
            </TabsTrigger>
            <TabsTrigger
                value="users"
                className=" p-2 text-xs md:text-sm w-full flex items-center justify-start gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                    <div className="w-8  flex justify-center">
                        <SquareUser className="size-6"/>
                    </div>
                    <p className="hidden lg:flex ml-2 ">Users</p>
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
            <AdminTabsListDesktop/>
        </SheetContent>
    </Sheet>
    )
}
