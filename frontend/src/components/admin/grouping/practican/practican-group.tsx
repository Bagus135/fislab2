'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Circle, Edit, EllipsisVertical, Pencil, PlusSquare, Search, Trash, User} from "lucide-react";
import { useState } from "react";
import CreateGroupPractican from "./create-modal";
import { getPractican, getPracticanGroup } from "@/action/admin.action";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EditMemberPracticanModal from "./editmember-modal";
import DeleteModal from "./delete-modal";
import DetailPracticanGroupsModal from "./showdetail-modal";

type GetPracticanRes = Awaited<ReturnType<typeof getPractican>>
type GetGroupRes = Awaited<ReturnType<typeof getPracticanGroup>>

export default function PracticanGroup ({practicans , groups } : {practicans : GetPracticanRes, groups : GetGroupRes}){
    const [search , setSearch] = useState("")
    const [openDelete, setOpenDelete] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [openShowMember, setOpenShowMember] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false)
    const [group, setGroup] = useState<getPracticanGroup|null>(null)

    return (
    <>
        <DeleteModal open={openDelete} setOpen={setOpenDelete} group={group}/>
        <DetailPracticanGroupsModal group={group} open={openShowMember} setOpen={setOpenShowMember}/>
        <EditMemberPracticanModal group={group} open={openEdit} setOpen={setOpenEdit} practicans={practicans}/>
        <Card>
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
                        groups.success &&
                        groups.data.map((group,idx) =>(
                            <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{group.kelompok}</TableCell>
                                <TableCell>{group.members.length}</TableCell>
                                <TableCell>
                                    <div className="flex flex-row gap-1 justify-center items-center">
                                        <Circle className="size-3 fill-green-500 text-green-500"/>
                                        Normal
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu key={idx} onOpenChange={setOpenDropdown} open={openDropdown}>
                                        <DropdownMenuTrigger asChild >
                                            <Button variant={"ghost"} size={"sm"} >
                                                <EllipsisVertical className="size-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-auto">
                                            <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                                                <Button 
                                                    variant={"ghost"} 
                                                    className="font-semibold gap-2"
                                                    onClick={()=>{
                                                        setOpenDropdown(false);
                                                        setOpenShowMember(true);
                                                        setGroup(group)
                                                    }}
                                                    >
                                                    <User className="size-4 mr-1"/>
                                                    <span className="inline text-sm ">
                                                        Show Member
                                                    </span>
                                                </Button>
                                                <Button 
                                                    variant={"ghost"} 
                                                    className="font-semibold gap-2"
                                                    onClick={()=>{
                                                        setOpenDropdown(false);
                                                        setOpenEdit(true);
                                                        setGroup(group)
                                                    }}>
                                                    <Edit className="size-4 mr-1"/>
                                                    <span className="inline text-sm ">
                                                        Edit Member
                                                    </span>
                                                </Button>
                                                <Button 
                                                    variant={"ghost"} 
                                                    className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                                                    onClick={()=>{
                                                        setOpenDropdown(false);
                                                        setOpenDelete(true);
                                                        setGroup(group)
                                                    }}>
                                                    <Trash className="size-4 mr-1"/>
                                                    <span className="inline text-sm ">
                                                        Delete Group
                                                    </span>
                                                </Button>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
    )
}
