'use client'

import { editModul } from "@/action/admin.action";
import { editAnnouncement } from "@/action/announcement.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon } from "lucide-react";
import { FormEvent, useState } from "react";

type EditModulProps = { 
    modul : getModul, 
    open:boolean, 
    setOpen : (open : boolean)=> void
}

export default function EditModulModal ({modul,  open , setOpen}: EditModulProps) {
    const {toast} = useToast();
    const [input, setInput] = useState({
        code : modul.code,
        title : modul.title,
        description : modul.description,
    });
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        try {
            setLoading(true);
            const res = await editModul(input) as getModul
            toast({
                title : "Edit Modul Success",
                description: `Modul ${res.title} successfully updated`,
                variant : "success"
            })
        } catch (error:any) {
            toast({
                title : "Edit Modul Failed",
                description: error.message,
                variant : "destructive"
            })
        } finally {
            setLoading(false)
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent onClick={(e)=> e.stopPropagation()} >
                <DialogHeader>
                    <DialogTitle> Edit Modul</DialogTitle>
                    <DialogDescription>Edit your Modul here</DialogDescription>
                </DialogHeader>
                <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="title" className="font-medium">Title</Label>
                        <div className="">
                            <Input 
                                id="title"
                                type="text" 
                                placeholder="Milikan Oil Drop" 
                                className="peer invalid:border-red-500"
                                value={input.title!}
                                required
                                onChange={(e)=>setInput({...input, title : e.target.value })}
                                />
                                <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">required</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="content" className="font-medium">Content</Label>
                        <div className="">
                            <Textarea 
                                id="content"
                                placeholder="Milikan oil drop is practicum that meassuring ...." 
                                className="peer invalid:border-red-500"
                                value={input.description!}
                                required
                                onChange={(e)=>setInput({...input, description : e.target.value })}
                                />
                                <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">required</span>
                        </div>
                    </div>
                    <Button 
                        disabled={loading || !input.description.trim() ||!input.title.trim()} 
                        className="w-full text-lg font-bold mt-2">
                        {loading?
                            <Loader2Icon className="size-4 animate-spin"/>
                            :
                            "Edit"    
                    }
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}