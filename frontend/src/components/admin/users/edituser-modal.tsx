import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

export default function EditUserModal ({children}: {children : React.ReactNode}){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Member </DialogTitle>
                    <DialogDescription>Edit Member Practican Group 6</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-4 justify-end">
                    <DialogClose asChild>
                        <Button variant={"outline"}>
                            Close
                        </Button>
                    </DialogClose>
                    <Button variant={"outline"}>
                        <Pencil className="size-4"/>
                        Edit Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}