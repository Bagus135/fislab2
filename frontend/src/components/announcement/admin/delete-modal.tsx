import { deleteAnnouncement } from "@/action/announcement.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";
import { useState } from "react";

type DeleteModalAnnouncementProps={
    id:number , 
    open : boolean , 
    setOpen : (open : boolean)=>void
}

export default function DeleteModalAnnouncement ({id, open, setOpen }: DeleteModalAnnouncementProps){
    const {toast} = useToast()

    const handleDelete = async() =>{
        try {
            const res = await deleteAnnouncement(id);
            toast({
                title : "Success Delete the Announcement",
                description : res.message,
                variant : 'success'
            })
            
        } catch (error : any) {
            toast({
                title : "Failed to Delete the Announcement",
                description : error.message,
                variant : 'destructive'
            })
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
                            <Trash className="size-4"/>
                            Delete
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