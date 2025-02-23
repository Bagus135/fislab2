import { editAslabtoModul } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2Icon, X } from "lucide-react";
import {FormEvent, useState } from "react";

type PropsType = {
    open : boolean,
    setopen : (open : boolean) => void,
    assistant : getAllAssistant|null,
    moduls : getModul[]
}

export default function EditModulAslabModal({open, setopen, assistant, moduls}: PropsType){
    const [input, setInput] = useState({
        practicumId : "",
        assistantId : "",
    });
    const [loading, setLoading] = useState(false);
    const {toast} = useToast()
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        try {
            setLoading(true)
            const res = await editAslabtoModul({
                practicumId : Number(input.practicumId),
                assistantId :input.assistantId
            })
            console.log(res);
            toast({
                title : "Success Connect Aslab to Modul",
                variant : "success",
                description : `${res.assistant.name} - ${res.practicum.title}`
            })
        } catch (error:any) {
            toast({
                title : "Failed Connect Aslab to Modul",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading (false)
        }
    }

    return (
        assistant && 
        <Dialog open={open} onOpenChange={setopen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Aslab - Modul</DialogTitle>
                    <DialogDescription>Connect {assistant.name} with the desire module</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Module Code</Label>
                            <Select required onValueChange={(value)=>setInput({...input, practicumId: value, assistantId : assistant.id})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectGroup>
                                      { moduls.map((modul, idx)=>(
                                          <SelectItem key={idx} value={ `${modul.id}`}>{`${modul.title} | ${modul.description}`}</SelectItem>
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
                            <Button type="submit" className="flex flex-row gap-2" disabled={Object.values(input).includes("")||loading}>
                                { loading ?
                                    <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    <>
                                        <Edit className="size-4"/>
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