import { getCheckSchedule, getScheduleUser } from "@/action/schedule.action";
import CheckScheduleCard from "@/components/schedule/check-schedule";
import EventCard from "@/components/schedule/eventcard";
import CardSchedule from "@/components/schedule/practicum-schedule";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default async function SchedulePage(){
    const [userSchedule, allSchedule] = await Promise.all([getScheduleUser(), getCheckSchedule()])
    
    return (
        <div className="grid auto-rows-min  lg:grid-cols-10  xl:grid-cols-8 lg:gap-4 space-y-4 lg:space-y-0 p-2">
            <div className=" lg:col-span-4 xl:col-span-3 lg:flex lg:flex-col  lg:min-h-[calc(100vh-6rem)] lg:order-last space-y-4" >
                <EventCard schedules={userSchedule}/>
                <CheckScheduleCard schedules={allSchedule}/>
            </div>
            <div className="lg:col-span-6 xl:col-span-5 ">
                {userSchedule.success &&
                    <Card className="mx-2 lg:mr-0">
                        <CardHeader className="pl-4 pb-2 ">
                            <CardTitle className="tracking-wider text-lg">Practicum Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                            <CardSchedule schedules={userSchedule}/>
                        </CardContent>
                    </Card>
                }
            </div>
        </div>
    )
}

