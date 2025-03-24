import Image from "next/image"

export default function LoadingPage(){
    return (
      <div className='flex flex-col w-full'>
          <div  className="relative min-h-[calc(100vh-5.5rem)] flex flex-col items-center justify-center text-center p-4 w-full">
          <div className="animate-pulse mt-0 bg-transparent w-3/4 ">
            <div className="flex flex-col justify-center mx-auto items-center">
                <Image
                    width={100}
                    height={100}
                    src="/logofisika.png"
                    alt="logo"
                    className="visible dark:hidden"
                    />
                <Image
                    width={100}
                    height={100}
                    src="/whitephi.png"
                    alt="logo"
                    className="hidden dark:block"
                    />
                 <h1 className="text-2xl font-mono font-bold text-transparent tracking-widest  bg-clip-text bg-gradient-to-r from-black via-gray-400 to-white-400 animate-sheen">
                  FISLAB
                </h1>
            </div>
          </div>
        </div>
      </div>
    )
}


// export default function LoadingPage(){
//     return (
//       <div className='flex flex-col w-full'>
//           <div  className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4 w-full">
//           <Skeleton className="mt-0 bg-accent/40 w-3/4 ">
//               <div className="  flex flex-col items-center justify-center text-center  p-12  space-y-4">
//                   <Skeleton className="w-1/2 self-center h-8"/>
//                   <Skeleton className="w-full h-6 self-center"/>
//                   <Skeleton className=" rounded-sm h-12 w-24 "/>
//                   <Skeleton className="w-36 h-4 self-center"/>
//               </div>
//           </Skeleton>
//         </div>
//       </div>
//     )
// }