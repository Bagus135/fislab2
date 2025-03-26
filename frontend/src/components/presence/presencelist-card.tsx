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
import { getBgColorAttd } from "@/utilts/getBgStatus";

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
                        <svg height="1792" className="size-4 dark:fill-white" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg"><path d="M529 896q-162 5-265 128h-134q-82 0-138-40.5t-56-118.5q0-353 124-353 6 0 43.5 21t97.5 42.5 119 21.5q67 0 133-23-5 37-5 66 0 139 81 256zm1071 637q0 120-73 189.5t-194 69.5h-874q-121 0-194-69.5t-73-189.5q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q10 0 43 21.5t73 48 107 48 135 21.5 135-21.5 107-48 73-48 43-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-1024-1277q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm704 384q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5zm576 225q0 78-56 118.5t-138 40.5h-134q-103-123-265-128 81-117 81-256 0-29-5-66 66 23 133 23 59 0 119-21.5t97.5-42.5 43.5-21q124 0 124 353zm-128-609q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181z"/></svg>
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
                        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="size-4 dark:text-white">
                            <rect fill="none" height="256" width="256"/>
                            <circle cx="104" cy="144" fill="none" r="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                            <path d="M53.4,208a56,56,0,0,1,101.2,0H216a8,8,0,0,0,8-8V56a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                            <polyline fill="none" points="176 176 192 176 192 80 64 80 64 96" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                        </svg>
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