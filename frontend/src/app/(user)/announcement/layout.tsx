import CreateAnnouncementCard from "@/components/announcement/createcard";

export default function LayoutAnnouncement({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return ( 
        <div className="md:grid md:grid-cols-10 md:gap-4 flex flex-col">
            <div className="md:col-span-3 lg:col-span-2 md:border-l p-2 md:p-0 md:order-last">
                <CreateAnnouncementCard/>
            </div>
            <div className="md:col-span-7 lg:col-span-8">
                {children}
            </div>
        </div>
    )
}