import { Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import AnnouncementModal from "../announcement/announcement-modal";

export default function AnnouncementCard ({announcements} : {announcements : AllAnnouncementType[]}){
    return (
        <Card >
            <CardHeader className="pt-4">
                <CardTitle>Announcement</CardTitle>
                <CardDescription>Latest Announcement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {
                    !announcements?
                    <p className="text-center flex justify-center items-center"> No announcement added yet</p>
                    :
                announcements.map((ann,idx)=>(
                    idx < 3 &&
                    <AnnouncementModal key={idx} props={ann}>
                        <div className="grid grid-cols-12">
                            <div className="col-span-2 lg:col-span-1 min-w-8 flex justify-center">
                                <Megaphone className="size-full max-w-14 min-w-8"/>
                            </div>
                            <div className="col-span-10 lg:col-span-11 flex flex-col ml-2">
                                <p className="font-bold text-sm tracking-wider line-clamp-2">{ann.title}</p>
                                <p className=" text-xs line-clamp-2">{ann.content}</p>
                            </div>
                        </div>
                    </AnnouncementModal>
            ))
                }
            </CardContent>
               {announcements && 
            <CardFooter className="flex justify-end">
                <Button variant={"outline"} size={"sm"} asChild>
                    <Link href={'/announcement'}>
                        See All Announcement
                    </Link>
                </Button>
            </CardFooter>
            }
        </Card>
    )
}