import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { ReactNode } from "react";

export default function AslabMonitoringModal({children}:{children : ReactNode}){
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
                            <Check className="text-green-500 size-4"/>
                        </div>
                    {[...Array(10)].map((_,idx)=>(
                        <div key={idx} className="flex flex-row justify-between">
                            <p>Practicum {idx}</p>
                            <X className="text-red-500 size-4"/>
                        </div>
                    ))
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}