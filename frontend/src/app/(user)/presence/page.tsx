import { AttendanceStat } from "@/components/presence/attendance-stat";
import PresenceListCard from "@/components/presence/presencelist-card";

export default function PresencePage() {
  return (
    <div className="grid md:grid-cols-9 gap-4">
        <div className="md:col-span-3 flex-1 md:order-last">
            <AttendanceStat/>
        </div>
        <div className="md:col-span-6 flex flex-col gap-4">
          <PresenceListCard/>
        </div>
    </div>
  )
}

