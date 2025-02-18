import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {HomeIcon } from "lucide-react";

export default function NotFound({message} : {message : string}){
    return (
        <div className="min-h-[80vh] grid place-items-center px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                        <p className="text-8xl font-bold text-primary font-mono"> OOPSS!!</p>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight" > {message}</h1>
                            <p className="text-muted-foreground"> The user you're looking is not exist </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant={'default'} asChild>
                                <a href={'/'}>
                                    <HomeIcon className="size-4 mr-2"/>
                                    Back To Home
                                </a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}