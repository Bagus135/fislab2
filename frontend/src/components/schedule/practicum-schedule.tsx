import ProfileModal from "../profile-modal"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"

export default async function CardSchedule() {
    const data = [
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 1, modul : "Konstanta Plank dan Emisi LED", aslab : "Alief Hisyam Al Hasany Nur Rahmat", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Minyak Milikan", aslab : "Agung Sedayu Septiawan", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Minyak Milikan", aslab : "Agung Sedayu Septiawan", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Minyak Milikan", aslab : "Agung Sedayu Septiawan", schedule :"18.00 - 20.00"},
        {week : 2, modul : "Tetes Minyak Milikan", aslab : "Agung Sedayu Septiawan", schedule :"18.00 - 20.00"},
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
                            <div className="col-span-2 flex">
                                <ProfileModal>
                                    <div className="flex flex-rows items-center space-x-2 ">
                                        <Avatar className=" w-8 h-8" asChild>
                                            <AvatarImage src="/avatar.png"/>
                                        </Avatar>
                                        <p className="text-sm line-clamp-2 ">{data.aslab}</p>
                                    </div>
                                </ProfileModal>
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
