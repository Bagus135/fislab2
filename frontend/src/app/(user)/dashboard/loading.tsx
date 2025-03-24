import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage () {
    return (
          <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
                <div className="flex flex-col md:mx-4 gap-2">
                   <Skeleton className="w-1/5 h-4"/>
                   <Skeleton className="w-2/5 h-4"/>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-10">
                    <div className="md:col-span-6 md:grid order-last md:order-first" >
                        <Skeleton className="w-full h-auto flex flex-col p-6">
                            <div className="flex flex-col gap-2 mb-4">
                                <Skeleton className="h-4 w-28"/>
                                <Skeleton className="h-4 w-32"/>
                            </div>
                            {
                                [...Array(3)].map((_,idx)=>(
                                    <div className="grid grid-cols-12 my-2" key={idx}>
                                        <div className="col-span-2 lg:col-span-1 min-w-8 flex justify-center ">
                                            <Skeleton className="size-full max-w-14 min-w-8"/>
                                        </div>
                                        <div className="col-span-10 lg:col-span-11 flex flex-col ml-2 space-y-2">
                                            <Skeleton className="w-1/2 h-4"/>
                                            <Skeleton className="w-full h-4"/>
                                        </div>
                                    </div>
                                ))
                            }
                        </Skeleton>
                    </div>
                    <div className="flex flex-col md:grid items-stretch md:col-span-4  md:gap-2 gap-4">
                        <div className="">
                            <Skeleton className="w-full h-12 flex flex-row justify-between p-6">
                                {/* <div className="flex flex-col gap-2 ">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-4 w-32"/>
                                </div>
                                <div className="flex items-center">
                                    <Skeleton className="h-4 w-20"/>
                                </div> */}
                            </Skeleton>
                        </div>
                        <div className="grid">
                            <Skeleton className="w-full h-auto">
                                <div>
                                    <div className="space-y-0 rounded-t-lg flex-row justify-between items-center p-4">
                                        <Skeleton className="w-full h-6"/>
                                    </div>
                                    <div className="pt-0 p-6">
                                        <div className="flex flex-col gap-2 items-center mt-2">
                                            <Skeleton className="w-3/5 h-4"/>
                                            <Skeleton className="w-16 h-4"/>
                                            <Skeleton className="w-4/5 h-4"/>
                                            <Skeleton className="w-2/5 h-4"/>
                                        </div>
                                    </div>
                                </div>
                            </Skeleton>
                        </div>
                    </div>
                 </div>
            </div>
    )
}