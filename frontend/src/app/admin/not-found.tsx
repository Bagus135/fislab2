import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {HomeIcon } from "lucide-react";

export default function NotFound({message, code} : {code : string, message : string}){
    return (
        <div className="min-h-[80vh] flex justify-center items-center px-4 w-full">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <p className="text-3xl font-bold text-primary font-mono">{code}</p>

                        <div className="">
                            <h1 className="text-xl font-bold tracking-tight" >{message}</h1>
                            <p className="text-muted-foreground"> The page you are looking is not exist </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
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