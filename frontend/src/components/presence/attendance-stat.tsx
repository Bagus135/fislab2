import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export function AttendanceStat() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Showing your attendance practicum</CardDescription>
            <Separator/>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8">
            <div className="flex-col text-center">
                <p className="text-green-500 text-2xl font-bold">2</p>
                <p>Present</p>
            </div>
            <div className="flex-col text-center">
                <p className="text-yellow-500 text-2xl font-bold">2</p>
                <p>Sick</p>
            </div>
            <div className="flex-col text-center">
                <p className="text-orange-500 text-2xl font-bold">2</p>
                <p>Permission</p>
            </div>
            <div className="flex-col text-center">
                <p className="text-red-500 text-2xl font-bold">2</p>
                <p>Alpha</p>
            </div>
        </CardContent>
    </Card>
)
}
