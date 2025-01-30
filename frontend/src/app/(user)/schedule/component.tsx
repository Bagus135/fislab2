import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export async function CardSchedule() {
    const data = [
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Muani Milikan", aslab : "Agung Sedayu Septiawan Al Jomok", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Muani Milikan", aslab : "Agung Sedayu Septiawan Al Jomok", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Muani Milikan", aslab : "Agung Sedayu Septiawan Al Jomok", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Muani Milikan", aslab : "Agung Sedayu Septiawan Al Jomok", schedule :"18.00 - 20.00"},
        {week : 3, modul : "Efek Reletifitas Area Ngawi", aslab : "Rusdianto", schedule :"18.00 - 20.00"},
        {week : 3, modul : "Efek Reletifitas Area Ngawi", aslab : "Rusdianto", schedule :"18.00 - 20.00"},
        {week : 3, modul : "Efek Reletifitas Area Ngawi", aslab : "Rusdianto", schedule :"18.00 - 20.00"},

    ]

    return (
        <div className="flex flex-col gap-2">
            { data.map((data,idx)=>(
                <Card key={idx} className="bg-slate-200">
                    <CardContent className="grid grid-flow-row h-auto p-3 py-4 space-y-2 ">
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex flex-col ">
                                <p className="font-semibold text-base tracking-widest">{data.modul}</p>
                                <p className="font-light text-xs">Modern Physics - 2</p>
                            </div>
                            <div className="col-span-1 flex items-center justify-end">
                                <p className="text-end text-sm">{`Week ${data.week}`}</p>
                            </div>
                        </div>
                            <Separator orientation="horizontal"/>
                        <div className=" grid grid-cols-3 space-x-2 w-full ">
                            <div className="col-span-2 flex flex-rows items-center space-x-2 ">
                                <Avatar className=" w-8 h-8" asChild>
                                    <AvatarImage src="/avatar.png"/>
                                </Avatar>
                                <p className="text-sm line-clamp-2 ">{data.aslab}</p>
                            </div>
                            <div className="col-span-1 flex flex-col justify-end">
                                <p className="text-end text-sm">18 November 2025</p>
                                <p className="text-end text-sm font-light">{data.schedule}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
            }
        </div>
    )
}

export const EventCard = async ()=>{
    const data = [{
        month : "Jan", date : "13", title : "Practicum MP-3", location : "Madya Laboratory", time : "18.00 - 20.19",
    }, {
        month : "Jan", date : "13", title : "Practicum MP-3", location : "Madya Laboratory", time : "18.00 - 20.19",
    }, {
        month : "Jan", date : "13", title : "Practicum MP-3", location : "Madya Laboratory", time : "18.00 - 20.19",
    }, ]
    return(
        <>
        { data.map((data, idx)=>(
            <Card key={idx} className="border-none shadow-none my-4">
            <CardContent className="p-0  rounded-sm bg-blue-100 pr-2">
                <div className="grid grid-cols-10">
                    <div className="col-span-7 ">
                        <div className="flex flex-row">
                            <div className="flex flex-col h-auto justify-center bg-blue-400 px-2 mr-2 items-center">
                                <p className="font-normal">Jan</p>
                                <p className="font-bold">18</p>
                            </div>
                            <div className="flex flex-col gap-1 justify-center py-2 pr-2">
                                <p className="font-bold tracking-wider text-sm">Prakticum MP-3 Milikan Tetes Minyak Elektron</p>
                                <span className="font-normal text-xs">Madya laboratory</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3 flex items-center justify-end">
                            <span className="text-xs text-end ">18.00 - 19.00</span>
                    </div>
                </div>
            </CardContent>
        </Card>
        ))            
        }
    </>
    )
}

export const CheckScheduleCard = () =>{
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
