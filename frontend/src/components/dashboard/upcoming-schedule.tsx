import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export default function UpcomingCard(){
    return (
        <Card>
            <CardHeader className="space-y-0 rounded-t-lg flex-row justify-between items-center p-4">
                <CardTitle>Upcoming Practicum</CardTitle>
                <CardTitle className="text-sm">Week - 2 </CardTitle>
            </CardHeader>
            <Separator orientation="horizontal"/>
            <CardContent>
                <div className="flex flex-col gap-1 text-center mt-2">
                    <p className="font-bold tracking-wider">Tetes Minyak Milikan dan Frank Hertz</p>
                    <p>Modern Physics - 1</p>
                    <p>Alief Hisyam Al Hasany Nur Rahmat</p>
                    <p>18 January 2025</p>
                    <p>18.00 - 19.00</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant={"outline"}>
                    Schedule
                    <ArrowRight className="size-4"/>         
                </Button>
            </CardFooter>
        </Card>
    )
}