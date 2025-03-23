import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPage(){
    return (
      <div className='flex flex-col w-full'>
          <div  className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4 w-full">
          <Skeleton className="mt-0 bg-accent/40 w-3/4 ">
              <div className="  flex flex-col items-center justify-center text-center  p-12  space-y-4">
                  <Skeleton className="w-1/2 self-center h-8"/>
                  <Skeleton className="w-full h-6 self-center"/>
                  <Skeleton className=" rounded-sm h-12 w-24 "/>
                  <Skeleton className="w-36 h-4 self-center"/>
              </div>
          </Skeleton>
        </div>
      </div>
    )
}