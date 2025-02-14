import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { EllipsisVertical, Pencil, Stamp, Trash, User } from "lucide-react";
import DeleteModal from "./delete-modal";
import EditUserModal from "./edituser-modal";
import ProfileModal from "@/components/profile-modal";
import EditRoleModal from "./editrole-modal";

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
                    <ProfileModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <User className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Show Profile
                            </span>
                        </Button>
                    </ProfileModal>
                    <EditUserModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Pencil className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Member
                            </span>
                        </Button>
                    </EditUserModal>
                    <EditRoleModal>
                        <Button variant={"ghost"} className="font-semibold gap-2">
                            <Stamp className="size-4 mr-1"/>
                            <span className="inline text-sm ">
                                Edit Role
                            </span>
                        </Button>
                    </EditRoleModal>
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