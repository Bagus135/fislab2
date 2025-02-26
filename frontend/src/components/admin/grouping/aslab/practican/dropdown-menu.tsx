import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeftRight, Edit, EllipsisVertical, Plug, Unplug } from "lucide-react"
import { ReactNode, useState } from "react"
import EditSessionModal from "./edit-dialog"

type Props = {
    schedule : AllScheduleAdmin,
    setOpenDelete : (a : boolean) => void
}

export default function DropDownMenu ({ schedule, setOpenDelete}: Props) {
    const [open, setOpen] = useState(false)
    return (
    <>
        <DropdownMenu open={open}  onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"} className="w-full">
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <DropdownMenuItem asChild>
                        <EditSessionModal schedule={schedule} >
                            <Button variant={"ghost"} className="font-semibold gap-2">
                                <Edit className="size-4 mr-1"/>
                                <span className="inline text-sm ">
                                    Edit Session
                                </span>
                            </Button>
                        </EditSessionModal>
                    </DropdownMenuItem>
                    <Button variant={"ghost"} 
                            className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                            onClick={()=>{
                                setOpenDelete(true);
                                setOpen(false)                                
                            }}  
                        >
                        <Unplug className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                                Remove to Group
                        </span>
                    </Button>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}