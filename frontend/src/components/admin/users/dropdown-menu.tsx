import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Pencil, Stamp, Trash } from "lucide-react";
import EditUserModal from "./edituser-modal";
import EditRoleModal from "./editrole-modal";
import { useState } from "react";

type Props = {
    setOpenDelete : (a : boolean) =>void,
}

export default function DropDownMenu ({setOpenDelete} : Props ){
    const [open, setOpen] = useState(false)
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"} className="w-full">
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto" >
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <EditUserModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Pencil className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Member
                            </span>
                        </Button>
                    </EditUserModal>
                    <EditRoleModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Stamp className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Role
                            </span>
                        </Button>
                    </EditRoleModal>
                    <Button variant={"ghost"} 
                            className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                            onClick={()=>{
                                setOpenDelete(true);
                                setOpen(false)
                            }}>
                        <Trash className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Delete Group
                        </span>
                    </Button>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}