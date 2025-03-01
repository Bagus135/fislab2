import { deleteUser } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Trash } from "lucide-react";
import { useState } from "react";

type Props = {
    user : AllUserTypes|null,
    open : boolean,
    setOpen : (open : boolean) => void
}

export default function DeleteModal ({user,open, setOpen}: Props){
    const {toast} = useToast()
    const [loading, setLoading] = useState(false)
    
    const handleDelete = async() =>{
        try {
            setLoading(true)
            if(!user) throw new Error("User Id is not defined")
            const res = await deleteUser(user.id);
            setOpen(false);
            toast({
                title : "Success Delete the user",
                description : res.message,
                variant : 'success'
            })
            
        } catch (error : any) {
            toast({
                title : "Failed to Delete the user",
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
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>Are you sure delete this practican user {user && user.name} ? This action is permanent </DialogDescription>
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