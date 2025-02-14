'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle, PlusSquare, Search} from "lucide-react";
import { useState } from "react";
import DropDownMenu from "./dropdown-menu";
import CreateUser from "./createuser-modal";
import CreateUserModal from "./createuser-modal";

export default function UserListCard (){
    const [search , setSearch] = useState("")
    return (
        <Card>
            <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>Physics Laboratorium Participants</CardDescription>
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
                    <CreateUserModal>
                        <Button>
                            <PlusSquare className="size-4"/>
                        </Button>
                    </CreateUserModal>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">No</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">NRP</TableHead>
                        <TableHead className="text-center">Role</TableHead>
                        <TableHead className="text-center hidden md:align-middle md:table-cell ">Last Update</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [...Array(20)].map((_,i) =>(

                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                            <TableCell className="font-medium">{i}</TableCell>
                            <TableCell>Alief Hisyam Al Hasany Nur Rahmat</TableCell>
                            <TableCell>5001221060</TableCell>
                            <TableCell>Asistant</TableCell>
                            <TableCell className="hidden  md:table-cell  md:align-middle" >1 year ago</TableCell>
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
