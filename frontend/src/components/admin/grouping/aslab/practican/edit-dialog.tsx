import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plug } from "lucide-react";

export default function EditDialog({i}:{i: number}){
    console.log(i);
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"ghost"} 
                        className="font-semibold gap-2"
                        >
                    <Plug className="size-4 mr-1"/>
                    <span className="inline text-sm ">
                        Connect to Modul
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <p> pppppppppp</p>
            </DialogContent>
        </Dialog>
    )
}