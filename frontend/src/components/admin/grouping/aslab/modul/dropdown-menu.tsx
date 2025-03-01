import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {Edit, EllipsisVertical, Plug, Unplug } from "lucide-react"
import {useState } from "react"
import ConnectModulAslabModal from "./connect-modal"
import DeleteModal from "./delete-modal"
import EditModulAslab from "./edit-modal"

type Props = {
    assistant : getAllAssistant
    moduls : getModul[],
}

export default function DropDownMenu ({assistant, moduls}:Props) {
    const [open, setOpen] = useState(false);
    return (
    <>
        <DropdownMenu onOpenChange={setOpen} open={open}>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <ConnectModulAslabModal assistant={assistant} moduls={moduls}>
                        <Button variant={"ghost"} 
                                className="font-semibold gap-2"
                                >
                            <Plug className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Connect to Modul
                            </span>
                        </Button>
                    </ConnectModulAslabModal>
                    <EditModulAslab assistant={assistant}  moduls={moduls}>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Edit className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Change Modul
                            </span>
                        </Button>
                    </EditModulAslab>
                    <DeleteModal assistant={assistant} >
                        <Button variant={"ghost"} className="text-red-500 hover:text-red-600 font-semibold  gap-2">
                            <Unplug className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                    Remove to Modul
                            </span>
                        </Button>
                    </DeleteModal>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}