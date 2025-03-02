import { differenceInWeeks, format } from "date-fns";
import { Card, CardContent } from "../ui/card";

export default function TimeCard(){
    return (
        <Card>
            <CardContent className="p-2 px-4 rounded-sm flex flex-row justify-between items-center bg-blue-400">
                <div className="flex flex-col text-start">
                    <p className="font-bold tracking-widest text-start">{format(new Date, 'EEEE')}</p>
                    <p className="tracking-wider text-start">{format(new Date, 'dd MMMM yyyy')}</p>
                </div>
                <div className="flex items-center justify-end">
                    <span className="text-sm text-end ">Week {differenceInWeeks(new Date(), new Date(2025, 1, 24))+1}</span>
                </div>
            </CardContent>
        </Card>
    )
}