'use server'

import { getGradeUser } from "@/action/grade.action"
import { BarChartComponent, RadialChart } from "@/components/dashboard/dashboardchart";

export default async function PracticanDashboard (){
    const userGrade = await getGradeUser();
    
    return (
        userGrade.success && userGrade.role === "PRAKTIKAN" &&
        <div className="grid auto-rows-min gap-4 xl:grid-cols-10">
            <div className="xl:grid xl:col-span-6 " >
                <BarChartComponent data={userGrade.data}/>
            </div>
            <div className="xl:grid xl:col-span-4  flex items-stretch">
                <RadialChart data={userGrade.data}/>
            </div>
        </div>
    )
}