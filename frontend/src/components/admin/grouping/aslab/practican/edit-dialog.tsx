'use client'
import { editAslabtoGroup } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Save, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

type Props = {
    children : ReactNode, 
    schedule : AllScheduleAdmin,
}


export default function EditSessionModal ({schedule, children}: Props){
    const {toast} = useToast()
    const [input, setInput] = useState({
        scheduleId : schedule.schedule.id,
        assistantId :schedule.assistant.id,
        week : ``,
    })
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await editAslabtoGroup({...input, week : Number(input.week)});
            toast({
                title : "Updated Success",
                variant : "success",
                description : res.message
            })
        } catch (error:any) {
            toast({
                title : "Failed to Update Practican group",
                variant : "destructive",
                description : error.message
            })
        } finally {
            setLoading(false)
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Session</DialogTitle>
                    <DialogDescription>{schedule.practicum.code} | {schedule.assistant.name || schedule.assistant.nrp} - Group {schedule.group.group}</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        {/* <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Assistant</Label>
                            <Select required onValueChange={(value)=>setInput({...input, assistantId: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectGroup>
                                      { assistants && assistants.filter((assistant)=> !!assistant.code).map((assistant, idx)=>(
                                          <SelectItem key={idx} value={assistant.id}>{`${assistant.code} | ${assistant.name}`}</SelectItem>
                                      ))
                                    }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div> */}

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Week</Label>
                            <Select required onValueChange={(value)=>setInput({...input, week: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectGroup>
                                      { [...Array(16)].map((_, idx)=>(
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
                            <Button type="submit" 
                                    className="flex flex-row gap-2" 
                                    disabled={Object.values(input).includes("")|| loading}>
                                { loading ?
                                    <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    <>
                                        <Save className="size-4"/>
                                        Save
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