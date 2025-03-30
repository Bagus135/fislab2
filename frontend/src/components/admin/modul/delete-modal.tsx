import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

type DeleteModulProps={
    modul: getModul|null , 
    open : boolean , 
    setOpen : (open : boolean)=>void
}

export default function DeleteModulModal ({modul, open, setOpen }: DeleteModulProps){
    const {toast} = useToast()

    const handleDelete = async() =>{
        try {
            if(!modul) throw new Error("Modul not defined")
            const token = await getToken();
            const res = await fetch(`/api/admin/practicum`, {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                body : JSON.stringify({code : modul.code})
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)

            refreshCache('/')
            toast({
                title : "Success Delete the Modul",
                description : data.message,
                variant : 'success'
            })
            
        } catch (error : any) {
            toast({
                title : "Failed to Delete the Modul",
                description : error.message,
                variant : 'destructive'
            })
        } 
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Modul</DialogTitle>
                    <DialogDescription>Are you sure delete this Modul {modul && modul.title}? This action is permanent </DialogDescription>
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