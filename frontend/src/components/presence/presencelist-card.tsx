'use client'
import { AlarmClock, Building, CalendarDaysIcon, Mail, QrCode, UserSquare, UserSquare2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import GenerateCodeModal from "./generatecode-modal";
import { addTwoHours } from "@/utilts/addtwohour";
import InputCodeModal from "./inputcode-modal";
import CheckAttendance from "./attendance-member";
import {useState } from "react";
import { Badge } from "../ui/badge";
import { isSameOrAfterDate, isTodayDate } from "@/utilts/isToday";
import { getBackgroundColor, getBgColorAttd } from "@/utilts/getBgStatus";

export function PresenceCardAslab({schedules} : {schedules : getAssistantSchedules[] }){
    const [selectedSchedule, setSelectedSchedule] = useState<getAssistantSchedules|null>(null)
    const [openCheck, setOpenCheck] = useState(false);

 return (
    <>
    <CheckAttendance open={openCheck} schedule={selectedSchedule} setOpen={setOpenCheck} />
    { schedules.map((schedule, idx)=>(
        <Card key={idx} className="border-none shadow-none p-0">
        <CardContent className="flex flex-col gap-2 py-4 p-0">
            <div className="flex-row gap-2  flex justify-between">
                <div className="flex flex-row gap-2 justify-start">
                    <div className="flex bg-blue-500 rounded-md items-center">
                        <p className="text-sm px-2 font-semibold text-accent uppercase text-center whitespace-nowrap">{schedule.practicum.code}</p>
                    </div>
                    <div className="flex">
                        <p className="font-semibold tracking-wider text-blue-400">
                           {schedule.practicum.title}
                        </p>
                    </div>
                </div>
                {
                    !['UNSCHEDULED', 'SCHEDULED'].includes(schedule.schedule.status) &&
                    <div className="flex items-center">
                        <Badge variant={"outline"} className={getBackgroundColor(schedule.schedule.status) + 'justify-center'}>{schedule.schedule.status}</Badge> 
                    </div>

                }
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
                {
                    ['UNSCHEDULED', 'SCHEDULED'].includes(schedule.schedule.status) ?
                    !!isSameOrAfterDate(schedule.schedule.date) ?
                        <div className="flex flex-col gap-2">
                            <Button 
                                size={"sm"} 
                                variant={'default'} 
                                className="flex gap-2 px-2 flex-row"
                                onClick={()=>{
                                    setSelectedSchedule(schedule)
                                    setOpenCheck(true)
                                }}
                                >
                                    <UserSquare className="size-4"/>
                                    <p className="text-xs">Check Attendance</p>
                            </Button>
                        <GenerateCodeModal schedule={schedule}>
                            <Button size={"sm"} variant={'default'} className="flex gap-2 px-2 flex-row">
                                <QrCode className="size-4"/>
                                <p className="text-xs">Generate Code</p>
                            </Button>
                        </GenerateCodeModal>
                    </div>
                    :
                    <div className="flex items-center">
                        <Badge variant={"secondary"}>Not on the schedule</Badge>           
                    </div>           
                :
                    <div className="flex flex-col gap-2 justify-center">
                            <Button 
                                size={"sm"} 
                                variant={'default'} 
                                className="flex gap-2 px-2 flex-row"
                                onClick={()=>{
                                    setSelectedSchedule(schedule)
                                    setOpenCheck(true)
                                }}
                                >
                                    <UserSquare className="size-4"/>
                                    <p className="text-xs">Check Attendance</p>
                            </Button>          
                </div>           
                }
            </div>
            </CardContent>
    </Card>
    ))}
    </>
)}

type PracticanProps = {
    schedules : getPracticanSchedules[], 
    stats : statAttendanceType['attendanceDetails'] |null
}

export function PresenceCardPractican({schedules, stats} : PracticanProps){
 return (
    schedules.map((schedule, idx)=>(
    <Card key={idx} className="border-none shadow-none p-0">
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
                { stats && !!stats.find((a)=> a.scheduleId === schedule.id) ?
                    !!stats.find(a => a.status === "TIDAK_HADIR" && a.scheduleId ===schedule.id) ?
                    !!isTodayDate(schedule.schedule.date) || schedule.schedule.status === 'SCHEDULED'?
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
                                <p className="text-xs">Enter Code</p>
                            </Button>
                        </InputCodeModal>
                    </div>
                        :

                    <div className="flex items-center">
                        <Badge variant={"outline"} className={getBgColorAttd(stats.find((a)=> a.scheduleId === schedule.id)?.status)}>{stats.find((a)=> a.scheduleId === schedule.id)?.status}</Badge>           
                    </div>
                     :
                <div className="flex items-center">
                    <Badge variant={"outline"} className={getBgColorAttd(stats.find((a)=> a.scheduleId === schedule.id)?.status)}>{stats.find((a)=> a.scheduleId === schedule.id)?.status}</Badge>           
                </div>
                     
                :
                <div className="flex items-center">
                    <Badge variant={"secondary"}>Not Started</Badge>           
                </div>
        }
            </div>
        </CardContent>
    </Card>
    ))
 )
}