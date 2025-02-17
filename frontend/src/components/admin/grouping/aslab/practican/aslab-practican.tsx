'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {PlusSquare, Search, Trash} from "lucide-react";
import { useState } from "react";
import CreateSesionPracticum from "./createsession-modal";

export default function AslabPracticanGroup (){
    const [search , setSearch] = useState("")
    return (
        <Card>
            <CardHeader>
                <CardTitle>Aslab-Modul Grouping</CardTitle>
                <CardDescription>Connect Asistant Laboratorium to Modul</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search group number..." 
                            className="pl-12 lg:w-80"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <CreateSesionPracticum>
                        <Button>
                            <PlusSquare className="size-4"/>
                        </Button>
                    </CreateSesionPracticum>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">Group</TableHead>
                        <TableHead className="text-center">Week</TableHead>
                        <TableHead className="text-center">Modul</TableHead>
                        <TableHead className="text-center">Aslab</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [...Array(20)].map((_,i) =>(

                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">Group {i}</TableCell>
                                <TableCell>{i}</TableCell>
                                <TableCell>MP-{i}</TableCell>
                                <TableCell>Alief Hisyam Al Hasany Nur Rahmat</TableCell>
                                <TableCell>
                                    <Button size={"sm"} className="bg-red-500 hover:bg-red-600 text-black">
                                        <Trash className="size-4"/>
                                    </Button>
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
