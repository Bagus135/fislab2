import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import DeleteModal from "./delete-modal";
import { useState } from "react";
import EditModulModal from "./edit-modal";



export default function DropdownMenuModul ({modul} : {modul:getModul}) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openEdit , setOpenEdit] = useState(false)
    const [openDelete , setOpenDelete] = useState(false)
    return (
    <>
        <EditModulModal modul={modul} open={openEdit} setOpen={setOpenEdit}/>
        <DeleteModal modul={modul} open={openDelete} setOpen={setOpenDelete}/>
        <DropdownMenu onOpenChange={setOpenDropdown} open={openDropdown}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                        <Button variant={"ghost"} className="font-semibold gap-2" onClick={()=>{
                            setOpenDropdown(false);
                            setOpenEdit(true);
                        }}>
                            <Edit className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Member
                            </span>
                        </Button>
                        <Button variant={"ghost"} 
                                className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                                onClick={()=>{
                                    setOpenDropdown(false);
                                    setOpenDelete(true);
                                }}>
                            <Trash className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Delete Group
                            </span>
                        </Button>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}