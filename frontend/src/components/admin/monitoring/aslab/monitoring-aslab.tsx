'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  Filter, Search} from "lucide-react";
import { useState } from "react";
import { FilterMonitoringAslab } from "./dropdownmenu-filter";
import AslabMonitoringModal from "./detail-dialog";

export default function AslabMonitoring (){
    const [search , setSearch] = useState("")
    return (
        <Card>
            <CardHeader>
                <CardTitle>Asistant Laboratorium Monitor</CardTitle>
                <CardDescription>See asistant laboratorium who haven't submit the practican score</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search Code or Name..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <FilterMonitoringAslab>
                        <Button>
                            <Filter className="size-4"/>
                        </Button>
                    </FilterMonitoringAslab>

                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">No</TableHead>
                        <TableHead className="text-center">Code</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        [...Array(20)].map((_,i) =>(
                        <AslabMonitoringModal>
                            <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{i}</TableCell>
                                <TableCell>MP-{i}</TableCell>
                                <TableCell>Alief Hisyam Al Hasany Nur Rahmat</TableCell>
                                <TableCell>1/10</TableCell>
                            </TableRow>
                        </AslabMonitoringModal>
                        ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
