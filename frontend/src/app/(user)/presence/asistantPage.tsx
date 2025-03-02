import { PresenceCardAslab } from "@/components/presence/presencelist-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AsistantPresencePage({schedules} : {schedules : getAssistantSchedules[]|null}){
    return (
        <div className="grid md:grid-cols-9 gap-4">
        <div className="md:col-span-3 flex-1 md:order-last">
            
        </div>
        <div className="md:col-span-6 flex flex-col gap-4">
        {!schedules ?
        <div className="w-full flex justify-center">
            <p className="text-center">
                No Practicum Assigned
            </p>
        </div>
                :
        <Card>
            <CardHeader >
                <CardTitle>Presence List</CardTitle>
            </CardHeader>
            <Separator/>
            <CardContent className="flex flex-col gap-6 mt-4">
                <PresenceCardAslab schedules={schedules} />
            </CardContent>
        </Card>
        }
        </div>
    </div>
    )
}