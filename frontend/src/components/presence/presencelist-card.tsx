import { AlarmClock, Building, CalendarDaysIcon, Mail, QrCode, UserSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Fragment } from "react";
import GenerateCodeModal from "./generatecode-modal";
import { addTwoHours } from "@/utilts/addtwohour";
import InputCodeModal from "./inputcode-modal";

type Props = {
    schedules :  {
        success: true;
        role: "PRAKTIKAN";
        data: getPracticanSchedules[];
    } | {
        success: true;
        role: "ASISTEN";
        data: getAssistantSchedules[];
    }
}

export default function PresenceListCard({schedules} : Props){
    return  (
        <Card>
            <CardHeader >
                <CardTitle>Presence List</CardTitle>
            </CardHeader>
            <Separator/>
            <CardContent className="flex flex-col gap-6 mt-4">
                {schedules.role==="ASISTEN" ?

                schedules.data.map((schedule,idx) => (
                    <Fragment key={idx}>
                        <PresenceCardAslab schedule={schedule} />
                        <Separator/>
                    </Fragment>
                ))
                    :
                    schedules.data.map((schedule,idx) => (
                    <Fragment key={idx}>
                        <PresenceCardPractican schedule={schedule} />
                        <Separator/>
                    </Fragment>
                ))
                }
            </CardContent>
        </Card>
    )
}



function PresenceCardAslab({schedule} : {schedule : getAssistantSchedules }){
    
 return (
    <Card className="border-none shadow-none p-0">
        <CardContent className="flex flex-col gap-2 py-4 p-0">
            <div className="flex-row gap-2  flex justify-start">
                <div className="flex bg-blue-500 rounded-md items-center">
                    <p className="text-sm px-2 font-semibold text-accent uppercase text-center whitespace-nowrap">{schedule.practicum.code}</p>
                </div>
                <div className="flex">
                    <p className="font-semibold tracking-wider text-blue-400">
                        {schedule.practicum.title}
                    </p>
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-between mt-2">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-2">
                        <AlarmClock className="size-4"/>
                        <p className="text-xs">{schedule.schedule.time === "00:00" ? "-" :`${schedule.schedule.time} - ${addTwoHours(schedule.schedule.time)}`}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <CalendarDaysIcon className="size-4"/>
                        <p className="text-xs">{schedule.schedule.date === "1-01-01" ? "-" : schedule.schedule.date}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Building className="size-4"/>
                        <p className="text-xs">Madya Laboratory</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <UserSquare2 className="size-4"/>
                        <p className="text-xs">Group {schedule.group}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                        <Button size={"sm"} variant={'default'} className="flex gap-2 px-2 flex-row">
                            <QrCode className="size-4"/>
                            <p className="text-xs">Enter Code</p>
                        </Button>
                    <GenerateCodeModal schedule={schedule}>
                        <Button size={"sm"} variant={'default'} className="flex gap-2 px-2 flex-row">
                            <QrCode className="size-4"/>
                            <p className="text-xs">Generate Code</p>
                        </Button>
                    </GenerateCodeModal>
                </div>           
            </div>
        </CardContent>
    </Card>
 )
}
function PresenceCardPractican({schedule} : {schedule : getPracticanSchedules }){
 return (
    <Card className="border-none shadow-none p-0">
        <CardContent className="flex flex-col gap-2 py-4 p-0">
            <div className="flex-row gap-2  flex justify-start">
                <div className="flex bg-blue-500 rounded-md items-center">
                    <p className="text-sm px-2 font-semibold text-accent uppercase text-center whitespace-nowrap">{schedule.practicum.code}</p>
                </div>
                <div className="flex">
                    <p className="font-semibold tracking-wider text-blue-400">
                        {schedule.practicum.title}
                    </p>
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-between mt-2">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-2">
                        <AlarmClock className="size-4"/>
                        <p className="text-xs">{schedule.schedule.time === "00:00"? "-" : `${schedule.schedule.time} - ${addTwoHours(schedule.schedule.time)}`}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <CalendarDaysIcon className="size-4"/>
                        <p className="text-xs">{schedule.schedule.date === "1-01-01" ? "-" : schedule.schedule.date}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Building className="size-4"/>
                        <p className="text-xs">Madya Laboratory</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <UserSquare2 className="size-4"/>
                        <p className="text-xs">{schedule.assistant.name}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                        <Button size={"sm"} 
                                variant={'outline'} 
                                className="flex gap-2 px-2 flex-row"
                                disabled
                                >
                            <Mail className="size-4"/>
                            <p className="text-xs">Permit Mail</p>
                        </Button>
                    <InputCodeModal schedule={schedule}>
                        <Button size={"sm"} variant={'default'} className="flex gap-2 px-2 flex-row">
                            <QrCode className="size-4"/>
                            <p className="text-xs">Generate Code</p>
                        </Button>
                    </InputCodeModal>
                </div>           
            </div>
        </CardContent>
    </Card>
 )
}