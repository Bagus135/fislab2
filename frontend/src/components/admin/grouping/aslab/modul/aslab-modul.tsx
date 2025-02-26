'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search} from "lucide-react";
import { useState } from "react";
import { getAllAssistant, getModul } from "@/action/admin.action";
import DropDownMenu from "./dropdown-menu";

type PropsType = {
    assistants : Awaited<ReturnType<typeof getAllAssistant>>,
    moduls : Awaited<ReturnType<typeof getModul>>,
}

export default function AslabModulGroup ({assistants, moduls}: PropsType){
    const [search , setSearch] = useState("")
    return (
        assistants.success && 
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
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">No</TableHead>
                        <TableHead className="text-center">Code</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        assistants.data && moduls.success &&
                        assistants.data.map((assistant,i) =>(
                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{i+1}</TableCell>
                                <TableCell>{assistant.code||"-"}</TableCell>
                                <TableCell>{assistant.name}</TableCell>
                                <TableCell >
                                    <DropDownMenu assistant = {assistant} moduls={moduls.data} />
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