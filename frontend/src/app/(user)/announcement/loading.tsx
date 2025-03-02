import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAnnouncePage (){
    return (
        <div className="w-full p-2 gap-4 grid lg:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_,i)=>
                <Skeleton key={i} className="h-[150px] w-full rounded-xl border  shadow "/>
            )}
        </div>
    )    
}