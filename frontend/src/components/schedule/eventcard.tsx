import { Card, CardContent } from "../ui/card"

export default function EventCard(){
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

