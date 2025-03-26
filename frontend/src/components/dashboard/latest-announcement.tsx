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
                                 <svg className="size-full max-w-14 min-w-8 transform -scale-x-100 dark:fill-white" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                    <rect fill="none" height="256" width="256"/>
                                    <path d="M152,80V203.7a7.9,7.9,0,0,0,3.6,6.7l11,7.3a8,8,0,0,0,12.2-4.7L192,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                                    <path d="M192,160a40,40,0,0,0,0-80H152S97.5,80,45.1,36.1A8,8,0,0,0,32,42.2V197.8a8,8,0,0,0,13.1,6.1C97.5,160,152,160,152,160Z" fill="none" stroke="currentColor " strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                                </svg>
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