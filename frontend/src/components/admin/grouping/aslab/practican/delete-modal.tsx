import { deleteAslabtoGroup } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Unplug } from "lucide-react";
import { useState } from "react";

type Props = {
    schedule : AllScheduleAdmin|null,
    open : boolean,
    setOpen : (open : boolean) => void
}

export default function DeleteModal ({schedule,open, setOpen}: Props){
    const {toast} = useToast()
    const [loading, setLoading] = useState(false)
    
    const handleDelete = async() =>{
        try {
            setLoading(true)
            if(!schedule) throw new Error(" variable is not defined")
            const res = await deleteAslabtoGroup({
                    assistantId : schedule.assistant.id,
                    groupId : schedule.group.id
                });
            setOpen(false);
            toast({
                title : "Success Delete the Practican Group",
                description : res.message,
                variant : 'success'
            })
            
        } catch (error : any) {
            toast({
                title : "Failed to Delete the Practican Group",
                description : error.message,
                variant : 'destructive'
            })
        } finally{
            setLoading(false)
        }
    }
    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Group</DialogTitle>
                    <DialogDescription>Are you sure delete this practicum sessiion at group {schedule?.group.group} and Asistant {schedule?.assistant.name} ? This action is permanent </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end">
                    <Button className="flex flex-row gap-2 bg-red-500" disabled={loading} onClick={handleDelete}>
                        {
                            loading ?
                            <Loader2Icon className="size-4 animate-spin"/>
                            :
                            <>
                                <Unplug className="size-4"/>
                                Remove
                            </>
                        }
                    </Button>
                    <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog> 
    )
}