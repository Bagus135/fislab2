import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState } from "react";

export default function EditUserModal ({children}: {children : React.ReactNode}){
    const [input, setInput] = useState('');
    return (
        <Dialog >
            <DialogTrigger onClick={(e)=>e.stopPropagation()} asChild>
                {children}
            </DialogTrigger>
            <DialogContent onClick={(e)=>e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Edit Member </DialogTitle>
                    <DialogDescription>Edit Member Practican Group 6</DialogDescription>
                </DialogHeader>
                <Input 
                    value={input}
                    onChange={(e)=> setInput(e.target.value)}
                    />
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