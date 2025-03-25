import AslabMonitoring from "@/components/admin/monitoring/aslab/monitoring-aslab";
import PracticanScoreMonitor from "@/components/admin/monitoring/practican/monitoring-practican";

export default function Page (){
    return (
         <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex flex-col">
            <div className="col-span-5">
                <PracticanScoreMonitor/>
            </div>
            <div className="col-span-5">
                <AslabMonitoring/>
            </div>
        </div>
    )
}