import AnnouncementCard from "@/components/announcement/announcementcard";

export default function AnnouncementPage(){
    return (
        <div className="w-full p-2 gap-4 grid lg:grid-cols-2 xl:grid-cols-3">
            {[1,2,3,4].map((_,i)=>
            <AnnouncementCard key={i}/>
            )}
        </div>
    )
} 