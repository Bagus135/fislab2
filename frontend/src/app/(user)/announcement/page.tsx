import { getAnnouncment } from "@/action/announcement.action";
import { getDecodeToken, getToken } from "@/action/auth.action";
import AnnouncementCard from "@/components/announcement/announcementcard";
import CreateAnnouncementCard from "@/components/announcement/createcard";

export default async function AnnouncementPage(){
    const [res, {role}] = await  Promise.all([getAnnouncment(),getDecodeToken()])
 
    return (
        <div className="md:grid md:grid-cols-10 md:gap-4 flex flex-col">
            <div className="md:col-span-3 lg:col-span-2 md:border-l p-2 md:p-0 md:order-last">
                <CreateAnnouncementCard/>
            </div>
            <div className="md:col-span-7 lg:col-span-8">
                { res.success ? 
                    !!res.data ?
                        <div className="w-full p-2 gap-4 grid lg:grid-cols-2 xl:grid-cols-3">
                            {res.data.map((val,i)=>
                                <AnnouncementCard key={i} announcement={val} role={role}/>
                             )}
                         </div>
                            :
                            <div className="text-center w-full"> No Announcement Added yet</div>
                        :
                        <p className="text-center w-full">{res.data.error}</p>
                    }
            </div>
        </div>
    )
} 