'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusSquare, Search, } from "lucide-react";
import { useState } from "react";
import DropdownMenuModul from "./dropdown-menu";
import CreateModul from "./create-modal";
import { getModul } from "@/action/admin.action";
import EditModulModal from "./edit-modal";
import DeleteModulModal from "./delete-modal";

type ModulListProps = Awaited<ReturnType<typeof getModul>>

export default function ModulList({moduls} :{ moduls : ModulListProps}){
    const [search , setSearch] = useState("")
    const [selectedModul, setSelectedModul] = useState<getModul|null>(null);
    const [openEdit , setOpenEdit] = useState(false);
    const [openDelete , setOpenDelete] = useState(false);

    return (
       
        <Card>
            <EditModulModal modul={selectedModul} open={openEdit} setOpen={setOpenEdit}/>
            <DeleteModulModal modul={selectedModul} open={openDelete} setOpen={setOpenDelete}/>
            <CardHeader>
                <CardTitle>Practicum Modul</CardTitle>
                <CardDescription>Manage practicum modul</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search Code or Title Modul..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <CreateModul>
                        <Button>
                            <PlusSquare className="size-4"/>
                        </Button>
                    </CreateModul>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">No</TableHead>
                        <TableHead className="text-center">Code</TableHead>
                        <TableHead className="text-center">Title</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                         moduls.success && moduls.data && 
                         moduls.data.filter(a => a.code.toLowerCase().includes(search.toLowerCase()) || a.title.toLowerCase().includes(search.toLowerCase()))
                         .map((modul,idx) =>(
                        <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell>{modul.code}</TableCell>
                            <TableCell>{modul.title}</TableCell>
                            <TableCell onClick={()=>setSelectedModul(modul)}>
                              <DropdownMenuModul modul={modul} setOpenDelete={setOpenDelete} setOpenEdit={setOpenEdit} key={idx}/>
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
