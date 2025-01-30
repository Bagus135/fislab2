import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Megaphone } from "lucide-react";

export function AnnouncementCard (){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Announcement</CardTitle>
                <CardDescription>Latest Announcement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {[1,2,3].map((_,idx)=>(
                <div className="grid grid-cols-12" key={idx}>
                    <div className="col-span-2 min-w-8 flex justify-center">
                        <Megaphone className="size-full max-w-14 min-w-8"/>
                    </div>
                    <div className="col-span-10 flex flex-col ml-2">
                        <p className="font-bold text-sm tracking-wider line-clamp-2">Announcment</p>
                        <p className=" text-xs line-clamp-2">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eaque, totam blanditiis. Delectus sunt, sit nulla reprehenderit fuga dignissimos facilis iste odit consectetur assumenda corrupti asperiores. Magnam distinctio cupiditate eum provident?</p>
                    </div>
                </div>
            ))
                }
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant={"outline"}>See All Announcement</Button>
            </CardFooter>
        </Card>
    )
}

export function TimeCard(){
    return (
        <Card>
            <CardContent className="p-2 px-4 rounded-sm flex flex-row justify-between items-center bg-blue-400">
                <div className="flex flex-col text-start">
                    <p className="font-bold tracking-widest text-start">Saturday</p>
                    <p className="tracking-wider text-start">18 December 2025</p>
                </div>
                <div className="flex items-center justify-end">
                    <span className="text-sm text-end ">Week 12</span>
                </div>
            </CardContent>
        </Card>
    )
}

export function UpcomingCard(){
    return (
        <Card>
            <CardHeader className="space-y-0 rounded-t-lg flex-row justify-between items-center p-4">
                <CardTitle>Upcoming Practicum</CardTitle>
                <CardTitle className="text-sm">Week - 2 </CardTitle>
            </CardHeader>
            <Separator orientation="horizontal"/>
            <CardContent>
                <div className="flex flex-col gap-1 text-center mt-2">
                    <p className="font-bold tracking-wider">Tetes Minyak Milikan dan Frank Hertz</p>
                    <p>Modern Physics - 1</p>
                    <p>Alief Hisyam Al Hasany Nur Rahmat</p>
                    <p>18 January 2025</p>
                    <p>18.00 - 19.00</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant={"outline"}>
                    Schedule
                    <ArrowRight className="size-4"/>         
                </Button>
            </CardFooter>
        </Card>
    )
}

export function UserGreetings (){
    return (
            <div className="flex flex-col md:mx-4">
                    <p className="font-bold tracking-wider">WELCOME! Mas Alief</p>
                    <p className="text-xs">Bagaimana Kabarmu Hari Ini ?</p>
            </div>
                )
}