import { ChevronDown, Pencil } from "lucide-react"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Separator } from "../ui/separator"

export default function ScoreCard () {
    const data = [
        {aslab: "Alief", nilaitot : 90, pendahuluan : 8, metodologi : 5, abstrak : 7, pembahasan : 20},
        {aslab: "Hugo", nilaitot : 78, pendahuluan : 3, metodologi : 6, abstrak : 71, pembahasan : 10},
        {aslab: "Baha", nilaitot : 87, pendahuluan : 10, metodologi : 8, abstrak : 71, pembahasan : 21},
    ]
    return (
        <>
        { data.map((item, idx)=> (
            <Card key={idx}>
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
                        <p className="text-sm line-clamp-2">{item.aslab}</p>
                    </div>
                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                        <p className="text-sm">{item.nilaitot}</p>
                        <Button size={"icon"} variant={"outline"} className="h-6 w-6 p-2">
                            <Pencil className="size-4"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="w-full p-0 flex flex-col">

                    <input type="checkbox" id={`trigger-${idx}`}className="hidden peer" />
                    <label
                    htmlFor={`trigger-${idx}`}
                    className="peer-checked:rotate-180  order-last w-full p-2 flex justify-center border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:outline-none focus:ring-2"
                    >
                        <ChevronDown className="size-4 "/>
                    </label>
                    
                    <div className="mt-2 p-4 hidden peer-checked:flex w-full  flex-col ">
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pendahuluan</p>
                            <p>{item.pendahuluan}</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Metodologi</p>
                            <p>{item.metodologi}</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Abstrak</p>
                            <p>{item.abstrak}</p>
                        </div>
                        <div className="flex flex-row justify-between gap-2 items-center w-full">
                            <p>Pembahasan</p>
                            <p>{item.pembahasan}</p>
                        </div>
                    </div>
            </CardFooter>
        </Card>
        ))
            
        }
        
    </>
    )
}


  