import { AlarmClock, Building, CalendarDaysIcon, Mail, QrCode, UserSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Fragment } from "react";
import InputCodeModal from "./inputcode-modal";
import PermitModal from "./permit-modal";

export default function PresenceListCard(){
    return  (
        <Card>
            <CardHeader >
                <CardTitle>Presence List</CardTitle>
            </CardHeader>
            <Separator/>
            <CardContent className="flex flex-col gap-6 mt-4">
                {[1,2,3,4].map(i => (
                    <Fragment key={i}>
                        <PresenceCard/>
                        <Separator/>
                    </Fragment>
                ))
                }
            </CardContent>
        </Card>
    )
}

type PresenceProps = {
    modul : string,
    nomodul : number,
    date : string,
    time : string,
    status : string,
}

function PresenceCard(){
 return (
    <Card className="border-none shadow-none p-0">
        <CardContent className="flex flex-col gap-2 py-4 p-0">
            <div className="flex-row gap-2  flex justify-start">
                <div className="flex bg-blue-500 rounded-md items-center">
                    <p className="text-sm px-2 font-semibold text-accent uppercase text-center whitespace-nowrap">MP-2</p>
                </div>
                <div className="flex">
                    <p className="font-semibold tracking-wider text-blue-400">
                        Tetes Minyak Milikan dan Experiment Frank hertz mbuh oppo maneh
                    </p>
                </div>
            </div>
            <div className="flex flex-row gap-4 justify-between mt-2">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-2">
                        <AlarmClock className="size-4"/>
                        <p className="text-xs">08.00 - 10.00</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <CalendarDaysIcon className="size-4"/>
                        <p className="text-xs">28 Februari 2025</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Building className="size-4"/>
                        <p className="text-xs">Madya Laboratory</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <UserSquare2 className="size-4"/>
                        <p className="text-xs">Alief Hisyam Al Hasany Nur Rahmat</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <PermitModal>
                        <Button size={"sm"} variant={'outline'} className="flex gap-2 px-2 flex-row">
                            <Mail className="size-4"/>
                            <p className="text-xs">Permit Letter</p>
                        </Button>
                    </PermitModal>
                    <InputCodeModal>
                        <Button size={"sm"} variant={'default'} className="flex gap-2 px-2 flex-row">
                            <QrCode className="size-4"/>
                            <p className="text-xs">Enter Code</p>
                        </Button>
                    </InputCodeModal>
                </div>           
            </div>
        </CardContent>
    </Card>
 )
}