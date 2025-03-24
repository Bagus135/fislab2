import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage(){
    return(
         <div className="grid md:grid-cols-9 gap-4  max-h-[calc(100vh-5.9rem)] overflow-hidden">
            <div className="md:col-span-3 flex-1 md:order-last">
                <Skeleton className="bg-accent h-auto pb-2">
                    <div className="p-6 flex flex-col gap-2">
                        <Skeleton className="h-6 w-1/5"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </div >
                    <div className="grid grid-cols-2 gap-8 pt-0 p-6">
                        {
                            [...Array(4)].map((_,idx)=>(
                                <div className="flex-col flex items-center space-y-2" key={idx}>
                                    <Skeleton className="h-16 w-24"/>
                                    <Skeleton className="h-4 w-24"/>
                                </div>
                            ))
                        }
                    </div>
                </Skeleton>
            </div>
            <div className="md:col-span-6 flex flex-col gap-4">
                <Skeleton className="bg-accent h-auto pb-2">
                    <div className="p-6">
                        <Skeleton className="h-6 w-1/5"/>
                    </div>
                    <div className="flex flex-col gap-6 p-6 pt-0">
                        {
                            [...Array(4)].map((_,idx)=>(
                                <div key={idx} className="bg-accent">
                                    <div className="flex flex-col gap-2 py-4 p-0">
                                        <div className="flex flex-row gap-2 justify-star items-center">
                                            <Skeleton className="w-24 h-8"/>
                                            <Skeleton className="w-3/5 h-4"/>
                                        </div>
                                        <div className="flex flex-row gap-4 justify-between mt-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-row gap-2">
                                                    <Skeleton className="w-6 h-4"/>
                                                    <Skeleton className="w-32 h-4"/>
                                                </div>
                                                <div className="flex flex-row gap-2">
                                                    <Skeleton className="w-6 h-4"/>
                                                    <Skeleton className="w-28 h-4"/>
                                                </div>
                                                <div className="flex flex-row gap-2">
                                                    <Skeleton className="w-6 h-4"/>
                                                    <Skeleton className="w-36 h-4"/>
                                                </div>
                                                <div className="flex flex-row gap-2">
                                                    <Skeleton className="w-6 h-4"/>
                                                    <Skeleton className="w-24 h-4"/>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="w-32 h-8"/> 
                                                <Skeleton className="w-32 h-8"/> 
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </Skeleton>
            </div>
        </div>
)
}

