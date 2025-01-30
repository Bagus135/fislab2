import {BarChartComponent, RadialChart } from "./barChart";
import { AnnouncementCard, TimeCard, UpcomingCard, UserGreetings } from "./component";

export default function DashboardPage (){
  return (
      <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
        <UserGreetings/>
        <div className="grid auto-rows-min gap-4 md:grid-cols-10">
            <div className="md:col-span-6 md:grid order-last md:order-first" >
              <BarChartComponent/>
            </div>
            <div className="flex flex-col md:grid items-stretch md:col-span-4  md:gap-2 gap-4">
                <div className="">
                  <TimeCard/>
                </div>
                <div className="grid">
                  <UpcomingCard/>
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