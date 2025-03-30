'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusSquare, Search } from "lucide-react";
import { useState } from "react";
import DropDownMenu from "./dropdown-menu";
import CreateUserModal from "./createuser-modal";
import { getAllUsers } from "@/action/admin.action";
import ProfileModal from "@/components/profile-modal";
import DeleteModal from "./delete-modal";

type UsersPropsType = Awaited<ReturnType<typeof getAllUsers>>

export default function UserListCard({ users }: { users: UsersPropsType }) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [selectedUser , setSelectedUser] = useState<AllUserTypes|null>(null)

    const handleClickProfile = (id: string ) => {
        setSelectedId(id);
        setOpen(true);
    }

    return (
        users.success &&
        <Card>
            <ProfileModal id={selectedId} open={open} setOpen={setOpen} />
            <DeleteModal open={openDelete} setOpen={setOpenDelete} user={selectedUser}/>
            <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>Physics Laboratorium Participants</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4" />
                        </span>
                        <Input
                            placeholder="Search name or NRP user..."
                            className="pl-12"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <CreateUserModal>
                        <Button>
                            <PlusSquare className="size-4" />
                        </Button>
                    </CreateUserModal>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">No</TableHead>
                            <TableHead className="text-center">Name</TableHead>
                            <TableHead className="text-center">NRP</TableHead>
                            <TableHead className="text-center">Role</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.filter(user => user.name.toLowerCase().includes(search.toLowerCase())|| user.nrp.includes(search)) 
                            .map((user, idx) => (
                                <TableRow key={user.id} 
                                            className="odd:bg-white even:bg-gray-200 cursor-pointer dark:odd:bg-gray-900/50 dark:even:bg-gray-950"
                                            onClick={() => handleClickProfile(user.id)}>
                                    <TableCell className="font-medium">{idx + 1}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.nrp}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell onClick={(e)=>{
                                        e.stopPropagation()
                                        setSelectedUser(user)
                                    }}>
                                        <DropDownMenu setOpenDelete={setOpenDelete}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}