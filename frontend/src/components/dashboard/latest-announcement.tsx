import { Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export default function AnnouncementCard (){
    return (
        <Card >
            <CardHeader className="pt-4">
                <CardTitle>Announcement</CardTitle>
                <CardDescription>Latest Announcement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {[1,2,3].map((_,idx)=>(
                <div className="grid grid-cols-12" key={idx}>
                    <div className="col-span-2 lg:col-span-1 min-w-8 flex justify-center">
                        <Megaphone className="size-full max-w-14 min-w-8"/>
                    </div>
                    <div className="col-span-10 lg:col-span-11 flex flex-col ml-2">
                        <p className="font-bold text-sm tracking-wider line-clamp-2">Announcment</p>
                        <p className=" text-xs line-clamp-2">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eaque, totam blanditiis. Delectus sunt, sit nulla reprehenderit fuga dignissimos facilis iste odit consectetur assumenda corrupti asperiores. Magnam distinctio cupiditate eum provident?</p>
                    </div>
                </div>
            ))
                }
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant={"outline"} size={"sm"} asChild>
                    <Link href={'/dashboard'}>
                        See All Announcement
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}