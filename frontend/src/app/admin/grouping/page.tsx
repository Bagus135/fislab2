import { getAllAssistant, getAllScheduleAdmin, getAllUsers, getModul, getPractican, getPracticanGroup } from "@/action/admin.action";
import { getName } from "@/action/profile.action";
import AslabModulGroup from "@/components/admin/grouping/aslab/modul/aslab-modul";
import AslabPracticanGroup from "@/components/admin/grouping/aslab/practican/aslab-practican";
import PracticanGroup from "@/components/admin/grouping/practican/practican-group";

export default async function Page(){
        const [
            {name},
            moduls, 
            practicans, 
            practicanGroups, 
            assistants,
            schedules
                        ]  = await Promise.all([
                            getName(),
                            getModul(),
                            getPractican(),
                            getPracticanGroup(), 
                            getAllAssistant(),
                            getAllScheduleAdmin()
                        ]);

    return (
    <div  className="flex flex-col gap-4 " >
         <div className="flex flex-col md:mx-4">
            <p className="font-bold tracking-wider">WELCOME! {name}</p>
            <p className="text-xs">How are you today? The weather seems nice today, right?</p>
        </div>
        <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex flex-col">
            <div className="col-span-5 flex flex-col gap-4">
                <PracticanGroup practicans={practicans} groups={practicanGroups}/>
                <AslabModulGroup assistants={assistants} moduls={moduls}/>
            </div>
            <div className="col-span-5">
                <AslabPracticanGroup assistants={assistants} groups={practicanGroups} schedules={schedules}/>
            </div>
        </div>
    </div>
    )
}