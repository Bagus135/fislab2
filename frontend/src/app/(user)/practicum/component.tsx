import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarImage } from "@radix-ui/react-avatar";
import { ChevronDown, Pencil } from "lucide-react";

export function ModulPracticumCard (){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Practicum Modul</CardTitle>
                <CardDescription>Guide Book for Practicum Fislab</CardDescription>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
                <Button variant={"outline"}>Preview</Button>
                <Button variant={"default"}>Download</Button>
            </CardContent>
        </Card>
    )
}

export function ScoreCard () {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="grid grid-cols-10 items-start gap-4">
                    <p className="col-span-8 lg:col-span-9 font-semibold text-base tracking-widest">Tetes Minyak Milikan dan Experiment Frank Hertz</p>
                    <p className="col-span-2 lg:col-span-1 font-semibold tracking-wide text-end">MP-4</p>
                </div>
                <Separator/>
                <div className="grid grid-cols-10 items-center gap-4">
                    <div className="col-span-8  flex flex-row space-x-2 items-center">
                        <Avatar className="w-8 h-8" asChild>
                            <AvatarImage src="/avatar.png"/>
                        </Avatar>
                        <p className="text-sm line-clamp-2">Alief Hisyam Al Hasany Nur Rahmat</p>
                    </div>
                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                        <p className="text-sm">98</p>
                        <Button size={"icon"} variant={"outline"} className="h-6 w-6 p-2">
                            <Pencil className="size-4"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="w-full p-0 flex flex-col">

                    <input type="checkbox" id="trigger" className="hidden peer" />
                    <label
                    htmlFor="trigger"
                    className="order-last w-full p-2 flex justify-center border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:outline-none focus:ring-2"
                    >
                        <ChevronDown className="size-4 chevrondown-score"/>
                    </label>
                    
                    <div className="mt-2 p-4 hidden peer-checked:flex w-full  flex-col ">
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>90</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>90</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>90</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>90</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>90</p>
                        </div>
                    </div>
            </CardFooter>
        </Card>
    )
}


  