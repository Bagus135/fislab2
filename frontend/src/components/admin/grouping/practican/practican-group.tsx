'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle, EllipsisVertical, PlusSquare, Search} from "lucide-react";
import { useState } from "react";
import CreateGroupPractican from "./create-modal";
import { getPractican, getPracticanGroup } from "@/action/admin.action";
import DropDownMenu from "./dropdown-menu";
import DeleteModal from "./delete-modal";

type GetPracticanRes = Awaited<ReturnType<typeof getPractican>>
type GetGroupRes = Awaited<ReturnType<typeof getPracticanGroup>>


export default function PracticanGroup ({practicans , groups } : {practicans : GetPracticanRes, groups : GetGroupRes}){
    const [search , setSearch] = useState("")
    const [openDelete, setOpenDelete] = useState(false)
    const [selectGroup, setSelectedGroup] = useState<getPracticanGroup|null>(null)
    
    return (
        <Card>
            <DeleteModal group={selectGroup} open={openDelete} setOpen={setOpenDelete}/>
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
                    <CreateGroupPractican practicans={practicans}>
                        <Button>
                            <PlusSquare className="size-4"/>
                        </Button>
                    </CreateGroupPractican>
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
                        groups.success && practicans.success && groups.data &&
                        groups.data.filter(a => a.kelompok.toString().includes(search))
                       .map((group,idx) =>(
                            <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{group.kelompok}</TableCell>
                                <TableCell>{group.members.length}</TableCell>
                                <TableCell>
                                    <div className="flex flex-row gap-1 justify-center items-center">
                                        <Circle className={`size-3 ${memberLength(group.members.length).textColor}`}/>
                                        {memberLength(group.members.length).status}
                                    </div>
                                </TableCell>
                                <TableCell onClick={()=> setSelectedGroup(group)} >
                                    <DropDownMenu group={group} practicans={practicans.data} setOpenDel={setOpenDelete}>
                                        <Button variant={"ghost"} size={"sm"} >
                                            <EllipsisVertical className="size-4"/>
                                        </Button>
                                    </DropDownMenu>
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

const memberLength = (load: number) => {
    let result;

    switch (true) {
        case (load < 6):
            result = {
                status: "Underload",
                textColor: "fill-yellow-500 text-yellow-500"
            };
            break;
        case (load >= 6 && load <= 8):
            result = {
                status: "Normal",
                textColor: "fill-green-500 text-green-500"
            };
            break;
        case (load > 8):
            result = {
                status: "Overload",
                textColor: "fill-red-500 text-red-500"
            };
            break;
        default:
            result = {
                status: "Unknown",
                textColor: "fill-gray-500 text-gray-500"
            };
    }

    return result;
};