'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage (){
    return (
        <div className="h-screen w-full flex justify-center items-center">
            <div className="flex flex-col gap-4 p-6">
               <div className='text-7xl text-center mb-6'>404</div>
               <div className="flex flex-col justify-center text-justify">
                  <p className='text-2xl font-bold tracking-wider'> Page Not Found !!!</p>
                  <p className='text-xl text-muted-foreground'>The page are you looking is not found. There is a typo at url endpoint or contact admin if necessary.</p>
                  <div className="flex flex-row gap-4 mt-4">
                    <Button variant={'outline'}  asChild>
                        <Link href='/'>
                            Home
                        </Link>
                    </Button>
                    <Button variant={'default'} onClick={()=> history.back()}>
                        Back
                    </Button>
                  </div>
               </div>
            </div>
        </div>
    )
  }