import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ReactNode } from "react"

type Props = {
    modul : getModul,
   children : ReactNode
}
export default function DetailModul ({modul,children}:Props){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modul.code}</DialogTitle>
                    <DialogDescription>{modul.title}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col w-full gap-2 mt-2">
                    <p className="text-justify">{modul.description}</p>
                    <p className="text-right">{format(modul.createdAt,"dd MMMM yyyy")}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
