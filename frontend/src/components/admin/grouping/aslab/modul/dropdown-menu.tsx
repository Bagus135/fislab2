import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeftRight, EllipsisVertical, Plug, Unplug } from "lucide-react"
import { ReactNode, useState } from "react"
import ConnectModulAslabModal from "./connect-modal"
import SwapModulAslabModal from "./swap-modal"
import DeleteModal from "./delete-modal"

type Props = {
    assistant : getAllAssistant
    moduls : getModul[],
    assistants : getAllAssistant[]
}

export default function DropDownMenu ({assistant, moduls , assistants}:Props) {
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
                    <SwapModulAslabModal assistant={assistant} assistants={assistants} moduls={moduls}>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <ArrowLeftRight className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Swap Asistant
                            </span>
                        </Button>
                    </SwapModulAslabModal>
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