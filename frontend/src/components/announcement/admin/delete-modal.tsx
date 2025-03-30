import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Trash } from "lucide-react";
import { useState } from "react";

type DeleteModalAnnouncementProps={
    id:number , 
    open : boolean , 
    setOpen : (open : boolean)=>void
}

export default function DeleteModalAnnouncement ({id, open, setOpen }: DeleteModalAnnouncementProps){
    const {toast} = useToast()
    const [loading , setLoading] = useState(false);

    const handleDelete = async() =>{
        try {
            setLoading(true);
            const token = await getToken();
            const res =  await fetch(`/api/announcement`,{
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                method : "DELETE",
                body : JSON.stringify({id})
            })
            
            const data = await res.json()
            
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            toast({
                title : "Success Delete the Announcement",
                description : data.message,
                variant : 'success'
            })
            
        } catch (error : any) {
            toast({
                title : "Failed to Delete the Announcement",
                description : error.message,
                variant : 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Announcement</DialogTitle>
                    <DialogDescription>Are you sure delete this announcement? This action is permanent </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end">
                    <DialogClose asChild>
                        <Button className="flex flex-row gap-2 bg-red-500" onClick={handleDelete}>
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
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog> 
    )
}