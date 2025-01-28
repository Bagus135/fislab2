"use client"

import { eachDayOfInterval ,endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import {  ChevronLeft, ChevronRight, } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export default function OwnCalendar () {
    const dayArray = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const [currentDate, setCurrentDate] = useState(new Date())

    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({
        start : startDate,
        end : endDate
    })
    

    const handlePrevMonth = ()=>{
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))
    }
    const handleNextMonth = ()=>{
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))
    }

    return (
       <div className="flex flex-col gap-2"> 
            <div className="flex flex-row items-center justify-between">
                <Button variant={'ghost'} size={'icon'} onClick={handlePrevMonth} className="border border-input bg-background">
                    <ChevronLeft className="size-4"/>
                </Button>
                <p className="font-bold tracking-wide">{format(currentDate,'MMMM yyyy')}</p>
                <Button variant={'ghost'} size={'icon'} onClick={handleNextMonth} className="border border-input bg-background">
                    <ChevronRight className="size-4"/>
                </Button>
            </div>
                <Separator orientation="horizontal"/>
                <div className="grid grid-cols-7 gap-2 mt-4">
                    {dayArray.map((day, idx)=>(
                        <div key={idx} className="text-center">
                            <div className={`font-bold`}>
                                {day}
                            </div>
                        </div>))}

                    {days.map((day, idx)=>(
                        <div key={idx} className="text-center">
                            <div className={`${isSameMonth(day, currentDate )?  (isToday(day)? "font-bold" : "font-normal") : "font-light text-gray-400" } `}>
                                {format(day,'d')}
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    )
}