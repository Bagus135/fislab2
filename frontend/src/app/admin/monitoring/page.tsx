'use server';

import { getAllPracticanGrade, getAssistantStatus } from "@/action/admin.action";
import AslabMonitoring from "@/components/admin/monitoring/aslab/monitoring-aslab";
import PracticanScoreMonitor from "@/components/admin/monitoring/practican/monitoring-practican";

export default async function AdminPage (){
    const [asistantStatus, practicanGrade] = await Promise.all([getAssistantStatus(), getAllPracticanGrade()])
    return (
         <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex flex-col">
            <div className="col-span-5">
                <PracticanScoreMonitor data={practicanGrade.data} />
            </div>
            <div className="col-span-5">
                <AslabMonitoring data={asistantStatus}/>
            </div>
        </div>
    )
}