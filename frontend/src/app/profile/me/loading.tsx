import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage (){
    return (
        <div className="flex flex-col gap-4 md:flex-row w-full">
            <div className="md:fixed md:w-60 lg:w-80 md:border-r md:h-[calc(100vh)]">
                <div className="">
                    <div className="p-6">
                        <div className="flex flex-col gap-2">
                            <div className="w-full flex justify-center">
                                <Skeleton className="w-40 h-40 relative z-[0] rounded-full bg-slate-500" >
                                    <Skeleton className="px-2 rounded-full absolute right-0 bottom-0 transform -translate-x-1/2 -translate-y-1/2 z-[10]"/> 
                                </Skeleton>
                            </div>
                            <Skeleton className="mt-4 h-4 w-20 self-center"/>
                            <Skeleton className="h-4 w-14 self-center"/>
                            <Skeleton className="h-4 w-24 self-center"/>

                            <div className="w-full mt-8 space-y-2 text-sm">
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <Skeleton className="h-4 w-4"/>
                                    <Skeleton className="h-4 w-12"/>
                                </div>

                                <div className="flex items-center text-muted-foreground gap-2">
                                    <Skeleton className="h-4 w-4"/>
                                    <Skeleton className="h-4 w-16"/>
                                </div>
                                
                                <div className="flex items-center text-muted-foreground gap-2 text-xs">
                                    <Skeleton className="h-4 w-4"/>
                                    <Skeleton className="h-4 w-16"/>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:ml-60 lg:ml-80 w-full p-4  md:h-[calc(100vh-5rem)">
                <div className="w-full flex flex-col md:h-[calc(100vh-6.5rem)]">
                    <Skeleton className="max-w-[800px] w-full  mx-auto p-6 pt-0 bg-accent/50">
                        <div className="flex flex-row gap-1 w-full">
                            <Skeleton className="h-8 w-1/2"/>
                            <Skeleton className="h-8 w-1/2"/>
                        </div>
                        <div className="flex flex-col gap-6 pt-4">
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-12"/>
                                <Skeleton className="h-8 w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-12"/>
                                <Skeleton className="h-16 w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-12"/>
                                <div className="flex flex-row gap-2">
                                    <Skeleton className="h-8 w-3/4"/>
                                    <Skeleton className="h-8 w-24"/>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-12"/>
                                <Skeleton className="h-16 w-3/4"/>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Skeleton className=" h-8 w-1/5"/>
                                <Skeleton className=" h-8 w-1/5"/>
                            </div>
                        </div>
                    </Skeleton>
                </div>
            </div>
        </div>
    )
}