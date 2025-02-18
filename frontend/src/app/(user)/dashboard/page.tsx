import { getToken } from "@/action/auth.action"
import { BarChartComponent, RadialChart } from "@/components/dashboard/dashboardchart"
import AnnouncementCard from "@/components/dashboard/latest-announcement"
import TimeCard from "@/components/dashboard/timecard"
import UpcomingCard from "@/components/dashboard/upcoming-schedule"
import Error from "next/error"
import NotFound from "./not-found"

export default async function DashboardPage (){

  try {
    const res = await getToken()

  } catch (error : any) {
    return NotFound({message : error.message})
  }

  return (
      <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
        <div className="flex flex-col md:mx-4">
            <p className="font-bold tracking-wider">WELCOME! Mas Alief</p>
            <p className="text-xs">Bagaimana Kabarmu Hari Ini ?</p>
        </div>
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
            <div className="md:grid md:col-span-6 " >
              <RadialChart/>
            </div>
            <div className="md:grid md:col-span-4  flex items-stretch">
                <AnnouncementCard/>
            </div>
         </div>
      </div>
  )
}