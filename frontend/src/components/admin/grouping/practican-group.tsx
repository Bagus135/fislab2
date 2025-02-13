'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle, EllipsisVertical, Pencil, PlusSquare, Search, Trash, User } from "lucide-react";
import { useState } from "react";

export default function PracticanGroup (){
    const [search , setSearch] = useState("")
    return (
        <Card>
            <CardHeader>
                <CardTitle>Practican Group</CardTitle>
                <CardDescription>Create Group for practican</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search group number..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <Button>
                        <PlusSquare className="size-4"/>
                    </Button>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">Group</TableHead>
                        <TableHead className="text-center">Member</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [1,2,3].map(i =>(

                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                            <TableCell className="font-medium">Group 5</TableCell>
                            <TableCell>7</TableCell>
                            <TableCell>
                                <div className="flex flex-row gap-1 justify-center items-center">
                                    <Circle className="size-3 fill-green-500 text-green-500"/>
                                    Normal
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropDownMenu/>
                            </TableCell>
                        </TableRow>
                        ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function DropDownMenu (){
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <Button variant={"ghost"} className="font-semibold gap-2">
                        <User className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Show Member
                        </span>
                    </Button>
                    <Button variant={"ghost"} className="font-semibold gap-2">
                        <Pencil className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Edit Member
                        </span>
                    </Button>
                    <Separator/>
                    <DeleteModal>
                        <Button variant={"ghost"} className="text-red-500 hover:text-red-600 font-semibold  gap-2">
                            <Trash className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Delete Group
                            </span>
                        </Button>
                    </DeleteModal>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DeleteModal ({children}:{children : React.ReactNode}){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Group</DialogTitle>
                    <DialogDescription>Are you sure delete this practican group 6 ? This action is permanent </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end">
                    <Button className="flex flex-row gap-2 bg-red-500">
                        <Trash className="size-4"/>
                        Delete
                    </Button>
                    <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog> 
    )
}