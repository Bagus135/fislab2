import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { format, isAfter, isToday, parse, parseISO } from "date-fns";
import { addTwoHours } from "@/utilts/addtwohour";

export default function UpcomingCard({schedules} : {schedules : getNearestSchedule[]}){
    const nearestSchedule = getNearestSchedule(schedules)
    return (
        <Card>
            <CardHeader className="space-y-0 rounded-t-lg flex-row justify-between items-center p-4">
                <CardTitle>Upcoming Practicum</CardTitle>
            </CardHeader>
            <Separator orientation="horizontal"/>
            <CardContent>
                { nearestSchedule ?  
                    <div className="flex flex-col gap-1 text-center mt-2">
                        <p className="font-bold tracking-wider">{nearestSchedule.practicum}</p>
                        <p>{nearestSchedule.code}</p>
                        <p>{nearestSchedule.assistantName}</p>
                        <p>{format(parseISO(nearestSchedule.date), "dd MMMM yyyy")}</p>
                        <p>{nearestSchedule.time} - {addTwoHours(nearestSchedule.time)}</p>
                    </div>
                :
                <div className="flex justify-center items-center"> No upcoming schedule</div>
                }
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

const getNearestSchedule = (schedules: getNearestSchedule[]): getNearestSchedule | null => {
    const today = new Date(); // Tanggal hari ini

    // Filter jadwal yang belum berlalu (tanggal >= hari ini)
    const upcomingSchedules = schedules.filter(schedule => {
        const scheduleDate = parseISO(schedule.date); // Konversi string date ke objek Date
        return isAfter(scheduleDate, today) || isToday(scheduleDate);
    });

    // Jika tidak ada jadwal yang tersedia
    if (upcomingSchedules.length === 0) {
        return null;
    }

    // Urutkan jadwal berdasarkan tanggal terdekat
    upcomingSchedules.sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    // Kembalikan jadwal terdekat
    return upcomingSchedules[0];
};
