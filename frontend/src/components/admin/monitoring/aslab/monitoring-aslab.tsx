'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  Filter, Search} from "lucide-react";
import { useRef, useState } from "react";
import { FilterMonitoringAslab } from "./dropdownmenu-filter";
import AslabMonitoringModal from "./detail-dialog";

export default function AslabMonitoring({data}:{data:AssistantStatus[]}){
    const [search , setSearch] = useState("")
    const [selectedAssistant , setSelectedAssistant] = useState<AssistantStatus|null>(null)
    const ref = useRef<HTMLButtonElement | null>(null);
    const [filter, setFilter] = useState({
        order : "asc",
        sort : "code"
    });
    
    const handleClickDetail = (assistant : AssistantStatus) =>{
        if(ref.current) {
            setSelectedAssistant(assistant)
            ref.current.click();
        }
    }

    const filteredData = hanldleFilter(data, filter, search);

    return (
    <>
        <AslabMonitoringModal assistant={selectedAssistant} btnRef={ref}/>
        <Card>
            <CardHeader>
                <CardTitle>Asistant Laboratorium Monitor</CardTitle>
                <CardDescription>See asistant laboratorium who havent submit the practican score</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    data.length === 0 ?
                    <div className="text-center">
                        ~ No data to show
                    </div>
                :
                <>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search Assistant Name..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <FilterMonitoringAslab filter={filter} setFilter={setFilter}>
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
                        filteredData.map((a,i) =>(
                            <TableRow   key={i} 
                                        className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950"
                                        onClick={()=> handleClickDetail(a)}
                                        >
                                <TableCell className="font-medium">{i+1}</TableCell>
                                <TableCell>{a.code}</TableCell>
                                <TableCell>{a.name}</TableCell>
                                <TableCell>{a.progress}</TableCell>
                            </TableRow>
                        ))
                    }
                    </TableBody>
                </Table>
                </>
                }
            </CardContent>
        </Card>
    </>
    )
}

const hanldleFilter = (
    data : AssistantStatus[],
    filter : {sort : string, order : string},
    search : string,
) => {

    const filteredData =  data.filter((a)=> a.name.toLowerCase().includes(search.toLowerCase()))

    filteredData.sort((a,b) =>{
        let valA , valB
        switch(filter.sort) {
            case 'code' : 
                valA = a.code;
                valB = b.code;
                break;
            case "name" : 
                valA = a.name;
                valB = b.name;
                break;
            case 'progress' :
                valA = a.progress;
                valB = b.progress;
                break;
            default : 
                valA = a.code;
                valB = b.code;
        }

        if (filter.order === "asc") {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    })   
    return filteredData;
}
