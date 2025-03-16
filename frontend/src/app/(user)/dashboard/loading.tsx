import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage () {
    return (
          <div className="flex flex-1 flex-col md:grid md:grid-flow-row gap-4 p-2 pt-0">
                <div className="flex flex-col md:mx-4 gap-2">
                   <Skeleton className="w-1/5 h-4"/>
                   <Skeleton className="w-1/5 h-4"/>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-10">
                    <div className="md:col-span-6 md:grid order-last md:order-first" >
                        <Skeleton className="w-full h-56"/>
                    </div>
                    <div className="flex flex-col md:grid items-stretch md:col-span-4  md:gap-2 gap-4">
                        <div className="">
                            <Skeleton className="w-full h-12"/>
                        </div>
                        <div className="grid">
                        <Skeleton className="w-full h-44"/>
                        </div>
                    </div>
                 </div>
            </div>
    )
}