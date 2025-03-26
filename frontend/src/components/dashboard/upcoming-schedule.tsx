import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { addTwoHours } from "@/utilts/addtwohour";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function UpcomingCard({schedule, role} : {schedule : getNearestSchedule, role : string}){
    return (
        <Card>
            <CardHeader className="space-y-0 rounded-t-lg flex-row justify-between items-center p-4">
                <CardTitle>Upcoming Practicum</CardTitle>
            </CardHeader>
            <Separator orientation="horizontal"/>
            <CardContent>
                { !!schedule ?  
                    <div className="flex flex-col gap-1 text-center mt-2">
                        <p className="font-bold tracking-wider">{schedule.practicum}</p>
                        <p>{schedule.code}</p>
                        <p>{ role === "ASISTEN" ? `Group  ${schedule.group}` : schedule.assistantName}</p>
                        <p>{format(parseISO(schedule.date), "dd MMMM yyyy")}</p>
                        <p>{schedule.time} - {addTwoHours(schedule.time)}</p>
                    </div>
                :
                <div className="flex justify-center items-center"> No upcoming schedule</div>
                }
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant={"outline"} asChild>
                    <Link href={'/schedule'}>
                        Schedule
                        <ArrowRight className="size-4"/>         
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
