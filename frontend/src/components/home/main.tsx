import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronDownCircle } from "lucide-react";

export default function MainHome (){
    return (
    <div id="home" className="relative dark:bg-black text-white min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4">
        <Card className="mt-0 ">
            <CardContent className="  flex flex-col items-center justify-center text-center bg-accent/40 p-12 ">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                Physics Laboratory
                </h1>
                <p className="text-base md:text-lg lg:text-2xl text-gray-400 mb-8">
                    <span className=" text-gray-700 font-bold dark:text-white">Intermediate physics laboratory</span> with lots of quality practical tools
                </p>
                <div className="flex space-x-4 mb-8">
                <Button className="bg-white text-black font-semibold py-2 px-4 rounded" asChild size={"lg"}>
                        <Link href={'/login'}>
                            Get Started
                        </Link>
                    </Button>
                </div>
                <p className="text-gray-500">~Diving deeper into fislab~</p>
            </CardContent>
        </Card>
        <Button variant={"ghost"} size={"sm"} className="absolute left-1/2 bottom-1 rounded-full" asChild>
            <Link href={"#overview"}>
                <ChevronDownCircle className="size-4 text-muted-foreground"/>
            </Link>
        </Button>
        <div className="hidden">
            <p className="bg-gray-400 bg-red-500 bg-lime-500 bg-blue-500 bg-green-500 bg-yellow-500 bg-orange-500">test</p>
        </div>
      </div>
    )
}
