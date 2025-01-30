import {BarChartComponent, RadialChart } from "./barChart";
import { AnnouncementCard, TimeCard } from "./component";

export default function DashboardPage (){
  return (
      <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-10">
            <div className="md:col-span-6 md:grid order-last md:order-first" >
              <BarChartComponent/>
            </div>
            <div className="flex flex-col md:grid items-stretch md:col-span-4  md:gap-2 gap-4">
                <div className="">
                  <TimeCard/>
                </div>
                <div className="flex items-stretch">
                  <AnnouncementCard/>
                </div>
            </div>
         </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-10">
            <div className="md:col-span-6 " >
              <RadialChart/>
            </div>
            <div className="md:col-span-4  flex items-stretch">
                <AnnouncementCard/>
            </div>
         </div>
      </div>
  )
}