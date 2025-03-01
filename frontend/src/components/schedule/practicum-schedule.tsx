'use client'

import { useState } from "react"
import ProfileModal from "../profile-modal"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import {Edit, Users2} from "lucide-react"
import InputScheduleAslab from "./assistant/schedule-input"
import { addTwoHours } from "@/utilts/addtwohour"

type Props = {
    schedules :  {
        success: true;
        role: "PRAKTIKAN";
        data: getPracticanSchedules[]|null;
    } | {
        success: true;
        role: "ASISTEN";
        data: getAssistantSchedules[]|null;
    }
}

export default  function CardSchedule({schedules} : Props ) {
    const [open ,setOpen] = useState(false)
    const [selectedId, setSelectedId] = useState("")

    const handleClickDialog = (id : string) => {
        setSelectedId(id)
        setOpen(true)
    }

    return (
        <div className="flex flex-col gap-2">
            <ProfileModal id={selectedId} open={open} setOpen={setOpen}/>
            { 
              !schedules.data ?
              <div className="w-full flex justify-center">
                  <p className="text-center"> No Practicum Assigned</p>
              </div> 
              :
            schedules.role === "PRAKTIKAN" ? 
            schedules.data.map((schedule,idx)=>(
                <Card key={idx} className="bg-slate-200">
                    <CardContent className="grid grid-flow-row h-auto p-3 py-4 space-y-2  ">
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex flex-col ">
                                <p className="font-semibold text-base tracking-widest">{schedule.practicum.title}</p>
                                <p className="font-light text-xs">{schedule.practicum.code}</p>
                            </div>
                            <div className="col-span-1 flex items-center justify-end">
                                <p className="text-end text-xs md:text-sm capitalize">{schedule.schedule.status.toLowerCase()}</p>
                            </div>
                        </div>
                            <Separator orientation="horizontal"/>
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex ">
                                    <div className="flex flex-rows items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md" 
                                         onClick={()=>handleClickDialog(schedule.assistant.id)}>
                                        <Avatar className=" w-10 h-10" asChild>
                                            <AvatarImage src="/avatar.png"/>
                                        </Avatar>
                                        <p className="text-sm line-clamp-2  ">{schedule.assistant.name}</p>
                                    </div>
                            </div>
                            <div className="col-span-1 flex flex-col items-end justify-end">
                                <p className="text-end text-xs">{`Week ${schedule.schedule.week}`}</p>
                                <p className="text-end text-xs">{schedule.schedule.date === "1-01-01" ? "-" :schedule.schedule.date }</p>
                                <p className="text-end text-xs font-light">{schedule.schedule.time === "00:00" ?"-" : `${schedule.schedule.time} - ${addTwoHours(schedule.schedule.time)}`}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
                : 
                !schedules.data ?
                <div className="w-full flex justify-center">
                    <p className="text-center"> No Practicum Assigned</p>
                </div> 
                :
                schedules.data.map((schedule,idx)=>(
                    <Card key={idx} className="bg-slate-200">
                        <CardContent className="grid grid-flow-row h-auto p-3 py-4 space-y-2  ">
                            <div className=" grid grid-cols-3 space-x-2 w-full ">
                                <div className="col-span-2 flex flex-col ">
                                    <p className="font-semibold text-base tracking-widest">{schedule.practicum.title}</p>
                                    <p className="font-light text-xs">{schedule.practicum.code}</p>
                                </div>
                                <div className="col-span-1 flex items-center justify-end">
                                    <p className="text-end text-xs md:text-sm capitalize">{schedule.schedule.status.toLowerCase()}</p>
                                </div>
                            </div>
                                <Separator orientation="horizontal"/>
                            <div className=" grid grid-cols-3 space-x-2 w-full ">
                                <div className="col-span-2 flex ">
                                        <div className="flex flex-rows items-center space-x-2 rounded-md">
                                            <Users2 className="size-8"/>
                                            <p className="text-sm line-clamp-2  ">Group {schedule.group}</p>
                                        </div>
                                </div>
                                <div className="col-span-1 flex flex-col items-end justify-end">
                                    <p className="text-end text-xs">{`Week ${schedule.schedule.week}`}</p>
                                    <p className="text-end text-xs">{schedule.schedule.date === "1-01-01" ? "-" :schedule.schedule.date }</p>
                                    <p className="text-end text-xs font-light">{schedule.schedule.time === "00:00" ?"-" : schedule.schedule.time}</p>
                                </div>
                            </div>
                                <div className="flex justify-end items-center w-full p-0 m-0">
                                    <InputScheduleAslab schedule={schedule}>
                                        <Edit className="size-4 cursor-pointer hover:bg-accent hover:text-accent-foreground"/>
                                    </InputScheduleAslab>
                                </div>
                        </CardContent>
                    </Card>
            ))
            }
        </div>
    )
}
