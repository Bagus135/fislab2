import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function MainHome (){
    return (
    <div className="bg-black text-white min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4">
        <Card className="mt-0 ">
            <CardContent className="  flex flex-col items-center justify-center text-center bg-accent/40 p-12 ">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                Physics Laboratory
                </h1>
                <p className="text-base md:text-lg lg:text-2xl text-gray-400 mb-8">
                <span className="font-bold text-white">high-quality web applications</span> with the power of React components.
                </p>
                <div className="flex space-x-4 mb-8">
                <Button className="bg-white text-black font-semibold py-2 px-4 rounded" asChild size={"lg"}>
                        <Link href={'/login'}>
                            Get Started
                        </Link>
                    </Button>
                </div>
                <p className="text-gray-500">~ npx create-next-app@latest</p>
            </CardContent>
        </Card>
      </div>
    )
}
