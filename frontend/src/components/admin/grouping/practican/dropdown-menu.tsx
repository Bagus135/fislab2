import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Trash, User } from "lucide-react";
import { ReactNode, useState } from "react";
import DetailPracticanGroupsModal from "./showdetail-modal";
import EditMemberPracticanModal from "./editmember-modal";

type Props = {
    group : getPracticanGroup,
    practicans : getPractican,
    setOpenDel : (a:boolean) => void
    children : ReactNode
}

export default function  DropDownMenu ({children, group, practicans,setOpenDel }:Props){
    const [openDropdown, setOpenDropdown] = useState(false);
    return (
    <>
        <DropdownMenu onOpenChange={setOpenDropdown} open={openDropdown}>
            <DropdownMenuTrigger asChild >
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <DetailPracticanGroupsModal group={group}>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <User className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Show Member
                            </span>
                        </Button>
                    </DetailPracticanGroupsModal>
                    <EditMemberPracticanModal group={group} practicans={practicans}>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Edit className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Member
                            </span>
                        </Button>
                    </EditMemberPracticanModal>
                        <Button 
                            variant={"ghost"}  
                            className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                            onClick={()=>{
                                setOpenDel(true)
                                setOpenDropdown(false)
                            }}
                            >
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