import { connectAslabtoGroup, getAllAssistant, getPracticanGroup } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";

type Props = {
    children : ReactNode, 
    assistants : Awaited<ReturnType<typeof getAllAssistant>>,
    groups : Awaited<ReturnType<typeof getPracticanGroup>>, 
}

export default function CreateSesionPracticum({children ,assistants, groups}: Props ){
    const [input, setInput] = useState({
        groupId : "",
        week : "",
        assistantId : "",
        practicumCode : "",
    });

    const {toast} = useToast();

    const handleSubmit = async () => {
        try {
            const res = await connectAslabtoGroup({...input, week : Number(input.week)});
            toast({
                title : "Success to connect aslab to group",
                variant : "success",
            })
        } catch (error:any) {
            toast({
                title : "Failed to connect aslab to group",
                variant : "destructive",
                description : error.message
            })
        }
    }

    return (
        groups.success && assistants.success &&
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Session Practicum</DialogTitle>
                    <DialogDescription>Connect asistant laboratorium  with the practican group</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="group">Practican Group</Label>
                            <Select required onValueChange={(value)=>setInput({...input, groupId: value})}>
                                <SelectTrigger id="group">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        { groups.data && groups.data.map(((group,idx) =>(
                                            <SelectItem  key={idx} value={group.id}>{group.kelompok}</SelectItem>
                                            )))
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Asistant Laboratorium</Label>
                            <Select required 
                                    onValueChange={(value)=>setInput({
                                                                ...input, 
                                                                assistantId: value, 
                                                                practicumCode : assistants.data.filter((assistant)=> assistant.id === value)[0].code!
                                                            })
                                    }>

                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    { assistants.data.filter(assistant => assistant.code !== null).
                                            map(((assistant,idx) =>(
                                                <SelectItem key={idx} value={assistant.id}>{assistant.code} - {assistant.name}</SelectItem>
                                            )))
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Week</Label>
                            <Select required onValueChange={(value)=>setInput({...input, week: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        { [...Array(16)].map((_,idx)=>(
                                            <SelectItem key={idx} value={`${idx+1}`}>{idx+1}</SelectItem>
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
                            <Button type="submit" className="flex flex-row gap-2" disabled={Object.values(input).includes("")}>
                                <Plus className="size-4"/>
                                Create
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}