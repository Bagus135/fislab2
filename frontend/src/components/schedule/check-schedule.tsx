import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"

export  default function CheckScheduleCard () {
    return (
    <Card className="mx-2">
        <CardHeader>
            <CardTitle>Check Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Label className="min-w-8">Date</Label>
                <Input type="date" className="block h-8 w-2/3"/>
            </div>
            <div className="flex items-center space-x-2">
                <Label className="min-w-8">Time</Label>
                <Input type="date" className="block h-8 w-2/3"/>
            </div>
            <Separator/>
            <div className="flex text-center flex-col">
                <div className="flex flex-col gap-2">
                    { [1,2,3].map((_,idx)=>(
                        <CardListComponent key={idx}/>
                    )) 
                    }
                </div>
            </div>
        </CardContent>
    </Card>
    )
}

const CardListComponent = () =>{
    return (
        <Card className="border-none  shadow-none p-0 m-0">
            <CardContent className="grid grid-cols-10 p-0 m-0 border-b py-2">
                <div className="col-span-7 flex flex-col items-start text-start">
                    <p className="font-bold tracking-wider text-sm">Modern Physics - 3</p>
                    <p className="font-light tracking-wide text-xs">Alief Hisyam Al Hasany Nur Rahmat</p>
                    <p className="font-thin tracking-wide text-xs">Group 3</p>
                </div>
                <div className="col-span-3 flex flex-col items-end justify-center">
                    <p className="tracking-wide text-xs font-semibold">18 Jan 2025</p>
                    <p className="font-light tracking-wide text-xs">18.00 - 20.00</p>
                </div>
            </CardContent>
        </Card>
    )
}
