import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { EllipsisVertical, Pencil, Trash, User } from "lucide-react";
import DeleteModal from "./delete-modal";
import EditMemberPracticanModal from "./editmember-modal";

export default function DropDownMenu (){
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                    <EllipsisVertical className="size-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup className="flex flex-col gap-2 items-start" >
                    <Button variant={"ghost"} className="font-semibold gap-2">
                        <User className="size-4 mr-1"/>
                        <span className="inline text-sm ">
                            Show Member
                        </span>
                    </Button>
                    <EditMemberPracticanModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Pencil className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Member
                            </span>
                        </Button>
                    </EditMemberPracticanModal>
                    <Separator/>
                    <DeleteModal>
                        <Button variant={"ghost"} className="text-red-500 hover:text-red-600 font-semibold  gap-2">
                            <Trash className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Delete Group
                            </span>
                        </Button>
                    </DeleteModal>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}