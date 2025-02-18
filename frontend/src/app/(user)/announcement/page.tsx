import { getToken } from "@/action/auth.action";
import AnnouncementCard from "@/components/announcement/announcementcard";
import CreateAnnouncementCard from "@/components/announcement/createcard";

export default async function AnnouncementPage(){
    await getToken()
    return (
        <div className="md:grid md:grid-cols-10 md:gap-4 flex flex-col">
            <div className="md:col-span-3 lg:col-span-2 md:border-l p-2 md:p-0 md:order-last">
                <CreateAnnouncementCard/>
            </div>
            <div className="md:col-span-7 lg:col-span-8">
                <div className="w-full p-2 gap-4 grid lg:grid-cols-2 xl:grid-cols-3">
                    {[1,2,3,4].map((_,i)=>
                    <AnnouncementCard key={i}/>
                    )}
                </div>
            </div>
        </div>
    )
} 