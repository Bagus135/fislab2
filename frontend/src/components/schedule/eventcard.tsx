'use client'

import { useState } from 'react';
import { Card, CardContent } from "../ui/card";
import { parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import chevron icons
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { addTwoHours } from '@/utilts/addtwohour';

type getPracticanSchedules = {
    assistant: {
        id: string;
        name: string;
        nrp: string;
    };
    group: {
        id: string;
        name: number;
    };
    id: number;
    practicum: {
        code: string;
        title: string;
    };
    schedule: {
        date: string; // Format: 'YYYY-MM-DD'
        status: string;
        time: string; // Assuming time is a string
        week: number;
    };
};

type getAssistantSchedules = {
    group: number;
    groupId: string;
    id: number;
    practicum: {
        code: string;
        title: string;
    };
    schedule: {
        date: string; // Format: 'YYYY-MM-DD'
        status: string;
        time: string; // Assuming time is a string
        week: number;
    };
};

type Props = {
    schedules: {
        success: true;
        role: "PRAKTIKAN";
        data: getPracticanSchedules[]|null;
    } | {
        success: true;
        role: "ASISTEN";
        data: getAssistantSchedules[]|null;
    }
}

export default function EventCard({ schedules }: Props) {
    const [monthToFilter, setMonthToFilter] = useState(2); // February
    const [yearToFilter, setYearToFilter] = useState(2025); // Year 2025

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const filterSchedules = (schedules: Props['schedules'], month: number, year: number) => {
        if(!schedules.success||!schedules.data) return []
        console.log(schedules);
        
        return schedules.data && schedules.data.filter(schedule => {
            const scheduleDate = parseISO(schedule.schedule.date);
            return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month - 1; // Month is 0-indexed
        });
    };

    const filteredSchedules = filterSchedules(schedules, monthToFilter, yearToFilter);

    return (
        <Card className="mx-2">
            <CardContent className="p-6">
                <div className="flex justify-between mb-4 items-center">
                    <Button variant={'outline'} size={'sm'} onClick={() => {
                        if (monthToFilter === 1) {
                            setMonthToFilter(12);
                            setYearToFilter(yearToFilter - 1);
                        } else {
                            setMonthToFilter(monthToFilter - 1);
                        }
                    }}>
                        <ChevronLeft className="cursor-pointer" />
                    </Button>
                    <span className="mx-2">{`${monthNames[monthToFilter - 1]} ${yearToFilter}`}</span>
                    <Button variant={'outline'} size={'sm'} onClick={() => {
                        if (monthToFilter === 12) {
                            setMonthToFilter(1);
                            setYearToFilter(yearToFilter + 1);
                        } else {
                            setMonthToFilter(monthToFilter + 1);
                        }
                    }}>
                        <ChevronRight className="cursor-pointer" />
                    </Button>
                </div>
                <Separator className='mb-4'/>
                {filteredSchedules.length !== 0 ? (
                    filteredSchedules.map((data, idx) => (
                        <Card key={idx} className="border-none shadow-none my-4">
                            <CardContent className="p-0 rounded-sm bg-blue-100 pr-2">
                                <div className="grid grid-cols-10">
                                    <div className="col-span-7">
                                        <div className="flex flex-row">
                                            <div className="flex flex-col h-auto justify-center bg-blue-400 px-2 mr-2 items-center">
                                                <p className="font-normal">{data.practicum.code}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 justify-center py-2 pr-2">
                                                <p className="font-bold tracking-wider text-sm">{data.practicum.title}</p>
                                        <span className="font-normal text-xs">{data.schedule.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 flex items-center justify-end">
                                <span className="text-xs text-end">{data.schedule.time}-{addTwoHours(data.schedule.time)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
                )
                :
                <p className='text-center'>No schedule in this month</p>
            }
        </CardContent>
    </Card>
    )
}