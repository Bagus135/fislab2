import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPage(){
    return (
         <div className="grid md:grid-cols-9 gap-4 max-h-[calc(100vh-5.5rem)] overflow-hidden">
            <div className="md:col-span-3 flex-1 md:order-last">
                <Skeleton className="bg-accent">
                    <div className="p-6 w-full space-y-2">
                       <Skeleton className="w-1/4 h-6"/>
                       <Skeleton className="w-3/4 h-6"/>
                    </div>
                    <div className="gap-2 flex flex-col p-6 pt-0">
                        <Skeleton className="h-8 w-full"/>
                        <Skeleton className="h-8 w-full"/>
                    </div>
                </Skeleton>
            </div>
            <div className="md:col-span-6 flex flex-col gap-4">
                {[...Array(4)].map((_, idx)=>(
                    <Skeleton className="bg-accent" key={idx}>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="grid grid-cols-10 items-center px-4 gap-4 h-12">
                                <Skeleton className="col-span-8 lg:col-span-9  h-6 bg-muted"/>
                                <Skeleton className="col-span-2 lg:col-span-1 self-center h-6 bg-muted"/>
                            </Skeleton>
                            <div className="grid grid-cols-10 items-center gap-4 p-4 ">
                                <div className="col-span-8  flex flex-row items-center">
                                        <div className="  flex flex-row space-x-2 items-center py-2">
                                            <Skeleton className="size-6"/>
                                            <Skeleton className="h-4 w-36"/>
                                        </div>
                                </div>
                                <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                                    <Skeleton className="h-4 w-8"/>
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