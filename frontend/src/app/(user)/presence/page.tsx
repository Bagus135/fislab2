import PracticanPresencePage from "./practicanPage";
import AsistantPresencePage from "./asistantPage";
import { getScheduleUser } from "@/action/schedule.action";

export default async function PresencePage() {
  const userSchedule = await getScheduleUser()
  return (
    userSchedule.success &&
    <>
    {
      userSchedule.role === "PRAKTIKAN" &&
      <PracticanPresencePage schedules={userSchedule.data}/>
    } {
      userSchedule.role === "ASISTEN" &&
      <AsistantPresencePage schedules={userSchedule.data}/>
    } 
    </>
  )
}

