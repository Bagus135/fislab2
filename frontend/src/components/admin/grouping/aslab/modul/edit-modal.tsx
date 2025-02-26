import { editAslabtoModul } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ArrowLeftRight, Loader2Icon, X } from "lucide-react";
import {FormEvent, ReactNode, useState } from "react";

type PropsType = {
    children : ReactNode,
    assistant : getAllAssistant,
    moduls : getModul[],
}

export default function EditModulAslab({children, assistant, moduls}: PropsType){
    
    const [newPracticumCode, setNewPracticumCode] = useState("");

    const [loading, setLoading] = useState(false);
    const {toast} = useToast()
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        try {
            if(!assistant.code) throw new Error("Assistant has been not assign modul")
            setLoading(true);
           await editAslabtoModul({
                                newPracticumCode , 
                                assistantId : assistant.id,
                                oldPracticumCode : assistant.code
                            });
            toast({
                title : "Success change assistant modul",
                variant : "success",
                description : `${assistant.name} - ${newPracticumCode}`
            });

        } catch (error:any) {
            toast({
                title : "Failed to change assistant modul",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading (false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Aslab - Modul</DialogTitle>
                    <DialogDescription>Change {assistant.name} with the desire module</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">New Modul Code</Label>
                            <Select required onValueChange={(value)=>setNewPracticumCode(value)}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectGroup>
                                      { moduls.map((modul, idx)=>(
                                          <SelectItem key={idx} value={modul.code}>{`${modul.code} | ${modul.title}`}</SelectItem>
                                      ))
                                    }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-4">
                            <DialogClose asChild>
                                <Button type="button" variant={"outline"} className="flex flex-row gap-2">
                                    <X className="size-4"/>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="flex flex-row gap-2" disabled={!newPracticumCode.trim()||loading}>
                                { loading ?
                                    <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    <>
                                        <ArrowLeftRight className="size-4"/>
                                        Edit
                                    </>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}