import { Card, CardContent } from "../ui/card";

export default function TimeCard(){
    return (
        <Card>
            <CardContent className="p-2 px-4 rounded-sm flex flex-row justify-between items-center bg-blue-400">
                <div className="flex flex-col text-start">
                    <p className="font-bold tracking-widest text-start">Saturday</p>
                    <p className="tracking-wider text-start">18 December 2025</p>
                </div>
                <div className="flex items-center justify-end">
                    <span className="text-sm text-end ">Week 12</span>
                </div>
            </CardContent>
        </Card>
    )
}