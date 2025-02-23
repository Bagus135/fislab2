import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeftRight, Edit, EllipsisVertical, Plug, Unplug } from "lucide-react"
import { ReactNode, useState } from "react"
import EditSessionModal from "./edit-dialog"

type Props = {
    assistants :  getAllAssistant[],
    schedule : AllScheduleAdmin,
}

export default function DropDownMenu ({assistants, schedule}: Props) {
    return (
    <>
        <DropdownMenu modal={true}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <DropdownMenuItem asChild>
                        <EditSessionModal assistants={assistants} schedule={schedule} >
                            <Button variant={"ghost"} className="font-semibold gap-2">
                                <Edit className="size-4 mr-1"/>
                                <span className="inline text-sm ">
                                    Edit Session
                                </span>
                            </Button>
                        </EditSessionModal>
                    </DropdownMenuItem>
                    <Button variant={"ghost"}
                            className="font-semibold gap-2"
                            >
                        <ArrowLeftRight className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Swap Asistant
                        </span>
                    </Button>
                    <Button variant={"ghost"} 
                            className="text-red-500 hover:text-red-600 font-semibold  gap-2"
                        >
                        <Unplug className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                                Delete to Modul
                        </span>
                    </Button>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}