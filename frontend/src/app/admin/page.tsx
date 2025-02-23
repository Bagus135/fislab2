import { getAllAssistant, getAllScheduleAdmin, getAllUsers, getModul, getPractican, getPracticanGroup } from "@/action/admin.action";
import AslabModulGroup from "@/components/admin/grouping/aslab/modul/aslab-modul";
import AslabPracticanGroup from "@/components/admin/grouping/aslab/practican/aslab-practican";
import PracticanGroup from "@/components/admin/grouping/practican/practican-group";
import ModulList from "@/components/admin/modul/modullist-card";
import AslabMonitoring from "@/components/admin/monitoring/aslab/monitoring-aslab";
import PracticanScoreMonitor from "@/components/admin/monitoring/practican/monitoring-practican";
import UserListCard from "@/components/admin/users/userslist-card";
import { TabsContent } from "@/components/ui/tabs";
import { Fragment } from "react";

export default async function AdminPage (){
    const [
        users, 
        moduls, 
        practicans, 
        practicanGroups, 
        assistants,
        schedules
                    ]  = await Promise.all([
                        getAllUsers(), 
                        getModul(),
                        getPractican(),
                        getPracticanGroup(), 
                        getAllAssistant(),
                        getAllScheduleAdmin()
                    ]);
    
    return (
       <Fragment>
            <TabsContent value="grouping" className="flex flex-col gap-4 " >
                <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex flex-col">
                    <div className="col-span-5 flex flex-col gap-4">
                        <PracticanGroup practicans={practicans} groups={practicanGroups}/>
                        <AslabModulGroup assistants={assistants} moduls={moduls}/>
                    </div>
                    <div className="col-span-5">
                        <AslabPracticanGroup assistants={assistants} groups={practicanGroups} schedules={schedules}/>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="users" className="w-full ">
                <UserListCard users={users}/>
            </TabsContent>
            <TabsContent value="modul" className="w-full ">
                <ModulList moduls={moduls}/>
            </TabsContent>

            <TabsContent value="monitoring" className="w-full ">
                <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex flex-col">
                    <div className="col-span-5">
                        <PracticanScoreMonitor/>
                    </div>
                    <div className="col-span-5">
                        <AslabMonitoring/>
                    </div>
                </div>
            </TabsContent>
       </Fragment>
    )
}
