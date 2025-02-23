import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeftRight, EllipsisVertical, Plug, Unplug } from "lucide-react"
import { ReactNode, useState } from "react"
import EditDialog from "./edit-dialog"

type Props = {
    assistant : getAllAssistant
    moduls : getModul[],
    assistants : getAllAssistant[]
}

export default function DropDownMenu ({i}: {i : number}) {
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
                        <EditDialog i={i}/>
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