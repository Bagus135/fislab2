import { deleteModul } from "@/action/admin.action";
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
            if(!modul) throw new Error("Modul nod defined")
            const res = await deleteModul(modul.code);
            toast({
                title : "Success Delete the Modul",
                description : res.message,
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