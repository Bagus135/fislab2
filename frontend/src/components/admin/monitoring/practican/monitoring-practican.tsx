'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  Filter, Search} from "lucide-react";
import { useState } from "react";
import { FilterMonitoringPractican } from "./dropdownmenu-filter";
import PracticanMonitoringModal from "./detail-dialog";

export default function AslabMonitoring (){
    const [search , setSearch] = useState("")
    return (
        <Card>
            <CardHeader>
                <CardTitle>Practican's Score Monitor</CardTitle>
                <CardDescription>See all practican's score</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search NRP or Name..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <FilterMonitoringPractican>
                        <Button>
                            <Filter className="size-4"/>
                        </Button>
                    </FilterMonitoringPractican>

                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">NRP</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [...Array(20)].map((_,i) =>(

                            <PracticanMonitoringModal key={i}>
                                <TableRow className="odd:bg-white cursor-pointer even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                    <TableCell className="font-medium">500122106{i}</TableCell>
                                    <TableCell>Alief Hisyam Al Hasany Nur Rahmat</TableCell>
                                    <TableCell>{i}/10</TableCell>
                                    <TableCell>8{i}</TableCell>
                                </TableRow>
                            </PracticanMonitoringModal>
                        ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
