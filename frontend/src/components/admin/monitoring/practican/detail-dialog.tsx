import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ReactNode } from "react";

export default function PracticanMonitoringModal({children}:{children : ReactNode}){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alief Hisyam Al Hasany Nur Rahmat</DialogTitle>
                    <DialogDescription>5001221060</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1">
                        <div  className="flex flex-row justify-between">
                            <p className="font-bold">Average</p>
                            <p className="font-bold">80</p>
                        </div>
                    {[...Array(10)].map((_,idx)=>(
                        <div key={idx} className="flex flex-row justify-between">
                            <p>Practicum {idx}</p>
                            <p>8{idx}</p>
                        </div>
                    ))
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}