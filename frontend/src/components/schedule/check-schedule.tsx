'use client'

import { getCheckSchedule } from "@/action/schedule.action"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { addTwoHours } from "@/utilts/addtwohour"

type Props = {
    schedules : Awaited<ReturnType<typeof getCheckSchedule>>
}

export  default function CheckScheduleCard ({schedules}:Props) {
    const [input , setInput] = useState({
        date : '',
        time : ''
    });
    
    return (
    <Card className="mx-2">
        <CardHeader>
            <CardTitle>Check Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Label className="min-w-8">Date</Label>
                <Input type="date" 
                        className="block h-8 w-2/3"
                        value={input.date}
                        onChange={(e)=> setInput({...input, date: e.target.value})}
                        />
            </div>
            <div className="flex items-center space-x-2">
                <Label className="min-w-8">Time</Label>
                <Select  required onValueChange={(value)=>setInput({...input, time: value})}>
                    <SelectTrigger id="aslab"  className="h-8 w-2/3">
                        <SelectValue placeholder="Select Here"/>
                    </SelectTrigger>
                    <SelectContent  className="w-2/3">
                            <SelectGroup>
                                <SelectItem value="07:00">07:00 - 09:00</SelectItem>
                                <SelectItem value="09:00">09:00 - 11:00</SelectItem>
                                <SelectItem value="11:00">11:00 - 13:00</SelectItem>
                                <SelectItem value="13:30">13:30 - 15:30</SelectItem>
                                <SelectItem value="15:30">15:30 - 17:30</SelectItem>
                                <SelectItem value="19:00">19:00 - 21:00</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Separator/>
            <div className="flex text-center flex-col">
                <div className="flex flex-col gap-2">
                    { schedules.success ? 
                    schedules.data.filter((schedule) => schedule.date.includes(input.date) && schedule.time.includes(input.time))
                    .map((schedule,idx)=>(
                        Object.values(input).includes("") ? idx < 3 &&
                        <CardListComponent key={idx} schedule={schedule}/>
                        :
                        <CardListComponent key={idx} schedule={schedule}/>
                    ))
                    :
                    <p> No upcoming Schedule</p> 
                    }
                </div>
            </div>
        </CardContent>
    </Card>
    )
}

const CardListComponent = ({schedule}: {schedule : CheckScheduleType}) =>{
    return (
        <Card className="border-none  shadow-none p-0 m-0">
            <CardContent className="grid grid-cols-10 p-0 m-0 border-b py-2">
                <div className="col-span-7 flex flex-col items-start text-start">
                    <p className="font-bold tracking-wider text-sm">{schedule.code}</p>
                    <p className="font-light tracking-wide text-xs">{schedule.assistantName}</p>
                    <p className="font-thin tracking-wide text-xs">Group {schedule.group}</p>
                </div>
                <div className="col-span-3 flex flex-col items-end justify-center">
                    <p className="tracking-wide text-xs font-semibold">{schedule.date=== "00:00"? "-" :schedule.date}</p>
                    <p className="font-light tracking-wide text-xs">{`${schedule.time} - ${addTwoHours(schedule.time)}`}</p>
                </div>
            </CardContent>
        </Card>
    )
}
