import { getDecodeToken } from "@/action/auth.action"
import AnnouncementCard from "@/components/dashboard/latest-announcement"
import TimeCard from "@/components/dashboard/timecard"
import UpcomingCard from "@/components/dashboard/upcoming-schedule"
import NotFound from "../not-found"
import PracticanDashboard from "./practicanpage"
import { getName } from "@/action/profile.action"

export default async function DashboardPage (){
  const dcodeTkn = await getDecodeToken();
  if(!dcodeTkn.success)  return NotFound({code : '401', message : "Not Authorized"})
  const {name} = await getName()
  const {role} = dcodeTkn.data
  
  return (
      <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
        <div className="flex flex-col md:mx-4">
            <p className="font-bold tracking-wider">WELCOME! {name}</p>
            <p className="text-xs">How are you today? The weather seems nice today, right?</p>
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-10">
            <div className="md:col-span-6 md:grid order-last md:order-first" >
              <AnnouncementCard/>
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
            { role === "PRAKTIKAN" &&
             <PracticanDashboard/>
          }
      </div>
  )
}