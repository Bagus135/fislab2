import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BadgeInfo, Edit, EllipsisVertical, Trash } from "lucide-react";
import { useState } from "react";
import DetailModul from "./detail-modal";

type Props = {
    modul : getModul,
    setOpenDelete : (o:boolean)=>void,
    setOpenEdit : (o:boolean)=>void,
}

export default function DropdownMenuModul ({setOpenDelete,setOpenEdit, modul} : Props) {
    const [openDropdown, setOpenDropdown] = useState(false);
    return (
        <DropdownMenu onOpenChange={setOpenDropdown} open={openDropdown}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <DetailModul modul={modul}>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <BadgeInfo className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Modul Detail
                            </span>
                        </Button>
                    </DetailModul>
                        <Button variant={"ghost"} className="font-semibold gap-2" onClick={()=>{
                            setOpenDropdown(false);
                            setOpenEdit(true);
                        }}>
                            <Edit className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Modul
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
                                Delete Modul
                            </span>
                        </Button>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}