'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage (){
    return (
        <div className="h-[calc(100vh-4.5rem)] w-full flex justify-center items-center">
            <div className="flex flex-col gap-4 xl:flex-row-reverse p-6">
               <div className='text-7xl text-center'>‼️</div>
               <div className="flex flex-col justify-center text-justify">
                  <p className='text-2xl font-bold tracking-wider'>Something wrong here !!!</p>
                  <p className='text-xl text-muted-foreground'>There is an error in our system. Try refreshing the page or contact admin if necessary.</p>
                  <div className="flex flex-row gap-4 mt-4">
                    <Button variant={'outline'}  asChild>
                        <Link href='/'>
                            Home
                        </Link>
                    </Button>
                    <Button variant={'default'} >
                        Refresh
                    </Button>
                  </div>
               </div>
            </div>
        </div>
    )
  }