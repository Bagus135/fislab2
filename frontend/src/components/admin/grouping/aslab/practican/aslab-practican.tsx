'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {PlusSquare, Search, Trash} from "lucide-react";
import { useState } from "react";
import CreateSesionPracticum from "./createsession-modal";
import { getAllAssistant, getAllScheduleAdmin, getPracticanGroup } from "@/action/admin.action";
import DropDownMenu from "./dropdown-menu";

type PropsType = {
    assistants : Awaited<ReturnType<typeof getAllAssistant>>,
    groups : Awaited<ReturnType<typeof getPracticanGroup>>, 
    schedules : Awaited<ReturnType<typeof getAllScheduleAdmin>>,
}

export default function AslabPracticanGroup ({assistants,groups, schedules}: PropsType){
    const [search , setSearch] = useState("")
    return (
        assistants.success && groups.success && schedules.success &&
        <Card>
            <CardHeader>
                <CardTitle>Aslab-Practican Grouping</CardTitle>
                <CardDescription>Connect Asistant Laboratorium to Practican Group</CardDescription>
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
                    <CreateSesionPracticum assistants={assistants.data} groups={groups.data}>
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
                         schedules.data.length > 0 && schedules.data.map((schedule,i) =>(

                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{schedule.group.group}</TableCell>
                                <TableCell>{schedule.group.week}</TableCell>
                                <TableCell>{schedule.practicum.code}</TableCell>
                                <TableCell>{schedule.assistant.name}</TableCell>
                                <TableCell>
                                    <DropDownMenu assistants={assistants.data} schedule={schedule}/>
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
