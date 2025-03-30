import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2Icon, X } from "lucide-react";
import {FormEvent, ReactNode, useState } from "react";

type PropsType = {
    children : ReactNode,
    assistant : getAllAssistant,
    moduls : getModul[]
}

export default function ConnectModulAslabModal({children, assistant, moduls}: PropsType){
    const [input, setInput] = useState({
        practicumCode : "",
        assistantId : "",
    });
    const [loading, setLoading] = useState(false);
    const {toast} = useToast()
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        try {
            setLoading(true)
            const token = await getToken();
            const res = await fetch(`/api/admin/assistant/practicum`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                body : JSON.stringify(input)
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            toast({
                title : "Success Connect Aslab to Modul",
                variant : "success",
                description : data.message
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
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Aslab - Modul</DialogTitle>
                    <DialogDescription>Connect {assistant.name} - {assistant.nrp}with the desire module</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Module Code</Label>
                            <Select required onValueChange={(value)=>setInput({...input, practicumCode: value, assistantId : assistant.id})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectGroup>
                                      { moduls.map((modul, idx)=>(
                                          <SelectItem key={idx} value={ `${modul.code}`}>{`${modul.code} | ${modul.title}`}</SelectItem>
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