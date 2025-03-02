import { removeAslabtoModul } from "@/action/admin.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Unplug } from "lucide-react";
import { ReactNode, useState } from "react";

type PropsType = {
    assistant : getAllAssistant,
    children : ReactNode,
}

export default function DeleteModal ({ children, assistant}:PropsType){
    const [loading, setLoading] = useState(false);
    const [open , setOpen] = useState(false);
    const {id, code} = assistant;
    const {toast} = useToast();

    const handleDelete = async() => {
        try {
            setLoading(false);
            const res = await removeAslabtoModul({assistantId : id, practicumCode:code! })
            toast({
                variant :"success",
                title : "Success to remove",
                description : res.message
            })
            setOpen(false)       
        } catch (error:any) {
            toast({
                variant :"destructive",
                title : "Failed to remove",
                description : error.message
            })        
            
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>Are you sure disconnecting {assistant.name} from {assistant.code}? This action is permanent </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end">
                    <Button className="flex flex-row gap-2 bg-red-500"
                            onClick={handleDelete}
                            disabled={!assistant.code || loading}
                            >
                                {
                                    loading? 
                                    <Loader2Icon className="animate-spin size-4"/>
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