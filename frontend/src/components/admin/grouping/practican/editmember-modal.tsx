'use client'
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle, Pencil } from "lucide-react";
import { useState } from "react";

export default function EditMemberPracticanModal ({children}: {children : React.ReactNode}){
    const [selectedValue, setSelectedValue] = useState<number[]>([])
    console.log(selectedValue)
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Member </DrawerTitle>
                    <DrawerDescription>Edit Member Practican Group 6</DrawerDescription>
                </DrawerHeader>
                <ScrollArea className="max-h-[calc(100vh-10rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:bg-gray-100
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" >
                    <ScrollBar orientation="vertical"/>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead></TableHead>
                        <TableHead className="text-center">Group</TableHead>
                        <TableHead className="text-center">Member</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [...Array(20)].map((_,i) =>(

                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                            <TableCell>
                                <Checkbox checked={selectedValue.includes(i)} onCheckedChange={(checked)=> checked? setSelectedValue([...selectedValue, i]): setSelectedValue(selectedValue.filter((item)=> item !== i)) }/>
                            </TableCell>
                            <TableCell className="font-medium">Group {i}</TableCell>
                            <TableCell>7</TableCell>
                            <TableCell>
                                <div className="flex flex-row gap-1 justify-center items-center">
                                    <Circle className="size-3 fill-green-500 text-green-500"/>
                                    Normal
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                        }
                    </TableBody>
                </Table>
                </ScrollArea>
                <DrawerFooter className="flex flex-row gap-4 justify-end">
                    <DrawerClose asChild>
                        <Button variant={"outline"}>
                            Close
                        </Button>
                    </DrawerClose>
                    <Button variant={"outline"}>
                        <Pencil className="size-4"/>
                        Edit Member
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}