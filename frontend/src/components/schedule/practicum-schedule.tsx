'use client'

import { useState } from "react"
import ProfileModal from "../profile-modal"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import {Edit, Users} from "lucide-react"
import InputScheduleAslab from "./assistant/schedule-input"
import { addTwoHours } from "@/utilts/addtwohour"
import ProfilePicture from "../profile-picture"
import { Badge } from "../ui/badge"
import { getBackgroundColor } from "@/utilts/getBgStatus"

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
                <Card key={idx}>
                    <CardContent className="grid grid-flow-row h-auto p-3 py-4 space-y-2  ">
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex flex-col ">
                                <p className="font-semibold text-base tracking-widest">{schedule.practicum.title}</p>
                                <p className="font-light text-xs">{schedule.practicum.code}</p>
                            </div>
                            <div className="col-span-1 flex items-center justify-end">
                                <Badge variant={"outline"} className={ getBackgroundColor(schedule.schedule.status) + `text-end text-xs md:text-sm capitalize`}>{schedule.schedule.status.toLowerCase()}</Badge>
                            </div>
                        </div>
                            <Separator orientation="horizontal"/>
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex ">
                                    <div className="flex flex-rows items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md" 
                                         onClick={()=>handleClickDialog(schedule.assistant.id)}>
                                        <ProfilePicture id={schedule.assistant.id} size="w-10 h-10"/>
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
                    <Card key={idx}>
                        <CardContent className="grid grid-flow-row h-auto p-3 py-4 space-y-2  ">
                            <div className=" grid grid-cols-3 space-x-2 w-full ">
                                <div className="col-span-2 flex flex-col ">
                                    <p className="font-semibold text-base tracking-widest">{schedule.practicum.title}</p>
                                    <p className="font-light text-xs">{schedule.practicum.code}</p>
                                </div>
                                <div className="col-span-1 flex items-center justify-end">
                                    <Badge variant={"outline"} className={getBackgroundColor(schedule.schedule.status) +  `text-end text-xs md:text-sm capitalize`}>{schedule.schedule.status.toLowerCase()}</Badge>
                                </div>
                            </div>
                                <Separator orientation="horizontal"/>
                            <div className=" grid grid-cols-3 space-x-2 w-full ">
                                <div className="col-span-2 flex ">
                                        <div className="flex flex-rows items-center space-x-2 rounded-md">
                                        <svg height="1792" className="size-8 dark:fill-white" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg"><path d="M529 896q-162 5-265 128h-134q-82 0-138-40.5t-56-118.5q0-353 124-353 6 0 43.5 21t97.5 42.5 119 21.5q67 0 133-23-5 37-5 66 0 139 81 256zm1071 637q0 120-73 189.5t-194 69.5h-874q-121 0-194-69.5t-73-189.5q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q10 0 43 21.5t73 48 107 48 135 21.5 135-21.5 107-48 73-48 43-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-1024-1277q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm704 384q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5zm576 225q0 78-56 118.5t-138 40.5h-134q-103-123-265-128 81-117 81-256 0-29-5-66 66 23 133 23 59 0 119-21.5t97.5-42.5 43.5-21q124 0 124 353zm-128-609q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181z"/></svg>
                                            <p className="text-sm line-clamp-2  ">Group {schedule.group}</p>
                                        </div>
                                </div>
                                <div className="col-span-1 flex flex-col items-end justify-end">
                                    <p className="text-end text-xs">{`Week ${schedule.schedule.week}`}</p>
                                    <p className="text-end text-xs">{schedule.schedule.date === "1-01-01" ? "-" :schedule.schedule.date }</p>
                                    <p className="text-end text-xs font-light">{schedule.schedule.time === "00:00" ?"-" : `${schedule.schedule.time} - ${addTwoHours(schedule.schedule.time)}`}</p>
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

