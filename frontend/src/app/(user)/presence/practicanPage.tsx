import { statAttendance } from "@/action/presense.action";
import { AttendanceStat } from "@/components/presence/attendance-stat";
import { PresenceCardPractican } from "@/components/presence/presencelist-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PracticanPresencePage({schedules} : {schedules : getPracticanSchedules[]}){
    const statAttend = await statAttendance()
    
    return (
        <div className="grid md:grid-cols-9 gap-4">
        <div className="md:col-span-3 flex-1 md:order-last">
            <AttendanceStat summary={statAttend ? statAttend.summary : null}/>
        </div>
        <div className="md:col-span-6 flex flex-col gap-4">
        <Card>
            <CardHeader >
                <CardTitle>Presence List</CardTitle>
            </CardHeader>
            <Separator/>
            <CardContent className="flex flex-col gap-6 mt-4">
                <PresenceCardPractican schedules={schedules} stats={statAttend? statAttend.attendanceDetails : null}/>
            </CardContent>
        </Card>
        </div>
    </div>
    )
}