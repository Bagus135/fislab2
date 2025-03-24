import { Skeleton } from "@/components/ui/skeleton";
import { LockIcon, User } from "lucide-react";

export default function LoadingPage (){
    return (
<div className="w-full flex justify-center items-center  h-[calc(100vh-4.5rem)]">
    <Skeleton className="max-w-[400px] w-[calc(100vw-2rem)] bg-primary/5">
        <div>
            <div className="flex flex-col justify-center mx-auto items-center gap-2">
               <Skeleton className="h-[50px] w-[50px] rounded-sm my-4" />
               <Skeleton className="self-center h-6 w-24"/>
               <Skeleton className="self-center h-4 w-4/5"/>
            </div>
        </div>
        <div className="p-6">
            <div>
                <div className="grid w-full items-center gap-4 mt-2">
                    <div className="flex flex-col space-y-2">
                       <Skeleton className="w-12 h-4"/>
                        <div className=" relative">
                            <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                <User className="size-4"/>
                            </span>
                            <Skeleton className="pl-12 h-8 w-full"/>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                       <Skeleton className="w-12 h-4"/>
                        <div className=" relative">
                            <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                <LockIcon className="size-4"/>
                            </span>
                            <Skeleton className="pl-12 h-8 w-full"/>
                        </div>
                    </div>
                    <Skeleton className="h-8 w-full mx-auto my-2 "/>
                </div>
            </div>
            <Skeleton className="w-16 h-4"/>
        </div>
    </Skeleton>
</div>
    )
}