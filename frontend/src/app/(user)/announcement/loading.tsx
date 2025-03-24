import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAnnouncePage (){
    return (
        <div className="md:grid md:grid-cols-10 md:gap-4 flex flex-col">
            <div className={`col-span-10`}>
                <div className="md:grid-cols-2 w-full p-2 gap-4 grid lg:grid-cols-2 xl:grid-cols-3 max-h-[calc(100vh-5.5rem)] overflow-hidden">
                    {[...Array(6)].map((_,i)=>(
                        <Skeleton key={i} className="bg-accent h-auto pb-2">
                            <div className="p-0 m-0">
                                <div className="p-6 flex flex-col">
                                    <Skeleton className="w-1/2 h-6 mb-4"/>
                                    <Skeleton className="w-full h-4 mb-1"/>
                                    <Skeleton className="w-full h-4 mb-1"/>
                                </div>
                                <div className="flex flex-row justify-between items-center pt-0 p-6">
                                    <Skeleton className="h-4 w-1/5"/>
                                    <Skeleton className="h-4 w-8"/>
                                </div>
                            </div>
                        </Skeleton>
                        )
                    )}
                </div>
            </div>
        </div>
    )    
}

