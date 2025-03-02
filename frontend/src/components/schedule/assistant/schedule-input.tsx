import { editScheduleAslab } from "@/action/schedule.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Save, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

type Props = {
    schedule : getAssistantSchedules
    children : ReactNode
}

export default function InputScheduleAslab ({ children, schedule}:Props){
    const {toast} = useToast()
    const [input , setInput] = useState({
        startTime: "",
        date : "",
    })
    
    const [loading, setLoading] = useState(false)
    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        try {
            setLoading(true)
           const res = await editScheduleAslab({
                ...input,
                group : schedule.group,
                week : schedule.schedule.week,
                practicumCode : schedule.practicum.code,
            })
            toast({
                title : "Schedule Updated",
                description : res.message,
                variant : "success"
            })
        } catch (error:any) {
            toast({
                title : "Failed to update schedule",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Schedule</DialogTitle>
                <DialogDescription>{schedule.practicum.code} | Group {schedule.group}</DialogDescription>
            </DialogHeader>
            <form noValidate className="mt-4" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center gap-6">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="aslab">Date</Label>
                        <Input
                            className="block" 
                            type="date"
                            onChange={(e)=>setInput({...input, date : e.target.value})}
                            value={input.date}
                            />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="aslab">Time</Label>
                        <Select required onValueChange={(value)=>setInput({...input, startTime: value})}>
                            <SelectTrigger id="aslab">
                                <SelectValue placeholder="Select Here"/>
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectGroup>
                                      <SelectItem value="07:00">07:00 - 09:00</SelectItem>
                                      <SelectItem value="09:00">09:00 - 11:00</SelectItem>
                                      <SelectItem value="11:00">11:00 - 13:00</SelectItem>
                                      <SelectItem value="13:30">13:30 - 15:30</SelectItem>
                                      <SelectItem value="15:30">15:30 - 17:30</SelectItem>
                                      <SelectItem value="19:00">19:00 - 21:00</SelectItem>
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