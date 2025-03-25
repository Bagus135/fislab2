import { getName } from "@/action/profile.action";
import { getCheckSchedule } from "@/action/schedule.action";
import TimeCard from "@/components/dashboard/timecard";
import ModulPracticumCard from "@/components/practicum/modulcard";
import CheckScheduleCard from "@/components/schedule/check-schedule";

export default async function Page (){
    const [{name}, allSchedule] = await Promise.all([getName(), getCheckSchedule()])
    return (
          <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
                <div className="flex flex-col md:mx-4">
                    <p className="font-bold tracking-wider">WELCOME! {name}</p>
                    <p className="text-xs">How are you today? The weather seems nice today, right?</p>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-10">
                    <div className="md:col-span-6 flex flex-col order-last md:order-first" >
                        <CheckScheduleCard schedules={allSchedule}/>
                    </div>
                    <div className="flex flex-col  md:col-span-4  md:gap-2 gap-4">
                        <div className="">
                          <TimeCard/>
                        </div>
                        <div className="">
                          <ModulPracticumCard/>
                        </div>
                    </div>
                 </div>
              </div>
    )
}