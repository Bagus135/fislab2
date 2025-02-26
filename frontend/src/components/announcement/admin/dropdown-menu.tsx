import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {Edit, Trash } from "lucide-react";
import EditAnnouncementModal from "./edit-modal";
import DeleteModalAnnouncement from "./delete-modal";
import { ReactNode, useState } from "react";

export default function DropDownMenu ({children , announcement} : {children: ReactNode, announcement : AllAnnouncementType} ){
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <EditAnnouncementModal announcement={announcement} open={isEditOpen} setOpen={setIsEditOpen}/>
            <DeleteModalAnnouncement id={announcement.id}  open={isDeleteOpen} setOpen={setIsDeleteOpen}/>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild  onClick={(e)=>e.stopPropagation()}>
                {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto flex flex-col gap-2 items-start"  onClick={(e)=>e.stopPropagation()}>
                    <Button variant={"ghost"} 
                            className=" font-semibold  gap-2" 
                            onClick={(e)=>{
                                            setIsOpen(false) 
                                            setIsEditOpen(true) 
                                        }
                    }>
                        <Edit className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Edit Announcement
                        </span>
                    </Button>
                            <Button variant={"ghost"} 
                                    className="text-red-500 hover:text-red-600 font-semibold  gap-2" 
                                    onClick={(e)=>{
                                            setIsOpen(false);
                                            setIsDeleteOpen(true)
                                    }}>
                                <Trash className="size-4 mr-1"/>
                                <span className="inline text-sm ">
                                    Delete Announcement
                                </span>
                            </Button>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}