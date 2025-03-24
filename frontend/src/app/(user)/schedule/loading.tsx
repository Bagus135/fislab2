import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage () {
    return (
        <div className="grid auto-rows-min  lg:grid-cols-10  xl:grid-cols-8 lg:gap-4 space-y-4 lg:space-y-0 p-2 max-h-[calc(100vh-5.5rem)] overflow-hidden">
            <div className=" lg:col-span-4 xl:col-span-3 lg:flex lg:flex-col  lg:min-h-[calc(100vh-6rem)] lg:order-last space-y-4" >
                {/* Event Card */}
                <Skeleton className="mx-2 bg-accent h-auto pb-2">
                    <div className="">
                        <Skeleton className="flex justify-between p-4 items-center h-auto w-full gap-4">
                            <Skeleton className="bg-muted h-8 w-1/4"/>
                            <Skeleton className="bg-muted h-4 w-1/2"/> 
                            <Skeleton className="bg-muted h-8 w-1/4"/> 
                        </Skeleton>
                            {[...Array(2)].map((_, idx) => (
                                <Skeleton key={idx} className=" mx-4 my-4">
                                    <div className="p-0 rounded-sm  pr-2">
                                        <div className="grid grid-cols-10">
                                            <div className="col-span-7">
                                                <div className="flex flex-row gap-2">
                                                    <Skeleton className=" h-auto w-1/5"/>
                                                    <div className="flex flex-col gap-1 justify-center py-2 pr-2 w-full">
                                                        <Skeleton className=" h-4 w-full"/>
                                                        <Skeleton className=" h-4 w-1/2"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center justify-end">
                                                <Skeleton className=" h-4 w-1/2"/>
                                            </div>
                                        </div>
                                    </div>
                                </Skeleton>
                                ))
                            }  
                    </div>
                </Skeleton>
                {/* Check Schedule Card */}
                <Skeleton className="mx-2 bgacc'">
                    <div className="p-6">
                        <Skeleton className="h-6 w-1/4"/>
                    </div>
                    <div className="space-y-4 p-6 pt-0">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="w-8 h-8"/>
                            <Skeleton className="w-2/3 h-8"/>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="w-8 h-8"/>
                            <Skeleton className="w-2/3 h-8"/>
                        </div>
                        <div className="flex text-center flex-col">
                            <div className="flex flex-col gap-2">
                                { [...Array(2)].map((_,idx)=>(
                                    <Skeleton className="p-2 m-0 h-auto" key={idx}>
                                      <div className="grid grid-cols-10 p-0 m-0">
                                          <div className="col-span-7 flex flex-col items-start text-start gap-2">
                                            <Skeleton className="h-4 w-8"/>
                                            <Skeleton className="h-4 w-full"/>
                                            <Skeleton className="h-4 w-16"/>
                                          </div>
                                          <div className="col-span-3 flex flex-col items-end justify-center gap-2">
                                            <Skeleton className="h-4 w-16"/>
                                            <Skeleton className="h-4 w-8"/>
                                          </div>
                                      </div>
                                    </Skeleton>
                                ))
                                }
                            </div>
                        </div>
                    </div>
                </Skeleton>
            </div>
            <div className="lg:col-span-6 xl:col-span-5 space-y-4 ">
                { // Schedule Card
                    [...Array(4)].map((_,idx)=>(
                        <Skeleton key={idx}>
                            <div className="grid grid-flow-row space-y-2  ">
                                <Skeleton className=" grid grid-cols-3 space-x-2 w-full h-auto p-4 gap-4">
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <Skeleton className="h-6 bg-muted w-full"/>
                                        <Skeleton className="h-4 bg-muted w-12"/>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-end">
                                        <Skeleton className="h-6 w-1/2 bg-muted "/>
                                    </div>
                                </Skeleton>
                                <div className=" grid grid-cols-3 space-x-2 w-full p-4">
                                    <div className="col-span-2 flex ">
                                            <div className="flex flex-rows items-center space-x-2 cursor-pointer rounded-md w-full" >
                                                <Skeleton className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"/>
                                                <Skeleton className="h-4 w-1/2"/>
                                            </div>
                                    </div>
                                    <div className="col-span-1 flex flex-col items-end justify-end gap-2">
                                        <Skeleton className="h-4 w-2/4"/>
                                        <Skeleton className="h-4 w-2/4"/>
                                        <Skeleton className="h-4 w-2/4"/>
                                    </div>
                                </div>
                            </div>
                        </Skeleton>
                    ))
                }
            </div>
        </div>
    )
}