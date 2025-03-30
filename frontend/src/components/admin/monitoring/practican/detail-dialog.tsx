import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { getAverageScore } from "./monitoring-practican";

type Props = {
    children : ReactNode,
    data : AllPracticanGrade[number]
}
export default function PracticanMonitoringModal({children, data}: Props){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{data.nama}</DialogTitle>
                    <DialogDescription>{data.nrp}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1">
                        <div  className="flex flex-row justify-between">
                            <p className="font-bold">Average</p>
                            <p className="font-bold">{getAverageScore(data.nilai)}</p>
                        </div>
                    {Object.entries(data.nilai).map(([key, val],idx)=>(
                        <div key={idx} className="flex flex-row justify-between">
                            <p>{key}</p>
                            <p>{val}</p>
                        </div>
                    ))
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}