'use client'

import { EllipsisIcon, MoveRight } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import AnnouncementModal from "./announcement-modal";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import DropDownMenu from "./admin/dropdown-menu";
import { decodedJWT} from "@/action/auth.action";

type Props = {
    announcement : AllAnnouncementType, 
    dcdTkn : decodedJWT
}

export default function AnnouncementCard ({announcement, dcdTkn} :Props) {
    return (
        <AnnouncementModal props={announcement}>
            <Card className="cursor-pointer">
                <div onClick={(e)=>e.stopPropagation()} className={`${dcdTkn.role === "SUPER_ADMIN" || dcdTkn.role === "ADMIN" ? "flex p-0 m-0 justify-end" : "hidden"}`}>
                    <DropDownMenu announcement={announcement}>
                        <Button variant={"ghost"} className="self-end py-0">
                            <EllipsisIcon className="size-4"/>
                        </Button>
                    </DropDownMenu>
                </div> 
                    <div className="p-0 m-0">
                        <CardHeader className={`${dcdTkn.role === "SUPER_ADMIN" || dcdTkn.role === "ADMIN" ? "pt-0" : "pt-6"} pb-2 flex flex-col`}>
                            <CardTitle className=" line-clamp-1">{announcement.title}</CardTitle>
                            <CardDescription className="font-normal line-clamp-2">{announcement.content}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-row justify-between items-center ">
                            <p className="text-xs font-light">{formatDistanceToNow(announcement.updated_at)}</p>
                            <MoveRight className="size-4"/>
                        </CardFooter>
                    </div>
            </Card>
        </AnnouncementModal>
    )
}