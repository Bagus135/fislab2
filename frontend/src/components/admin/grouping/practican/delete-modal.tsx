import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Trash } from "lucide-react";
import { useState } from "react";

type Props = {
    group : getPracticanGroup|null,
    open : boolean,
    setOpen : (open : boolean) => void
}

export default function DeleteModal ({group,open, setOpen}: Props){
    const {toast} = useToast()
    const [loading, setLoading] = useState(false)
    
    const handleDelete = async() =>{
        try {
            setLoading(true)
            if(!group) throw new Error("Group Id is not defined")
            const token = await getToken();
                    
            const res = await fetch(`/api/admin/groups/delete`, {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                body : JSON.stringify({groupId : group.id})
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            toast({
                title : "Success Delete the Practican Group",
                description : data.token,
                variant : 'success'
            })
            setOpen(false);
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
                    <DialogDescription>Are you sure delete this practican group {group && group.kelompok} ? This action is permanent </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end">
                    <Button className="flex flex-row gap-2 bg-red-500" disabled={loading} onClick={handleDelete}>
                        {
                            loading ?
                            <Loader2Icon className="size-4 animate-spin"/>
                            :
                            <>
                                <Trash className="size-4"/>
                                Delete
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