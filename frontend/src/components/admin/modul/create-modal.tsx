import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Plus, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

export default function CreateModul({children}: {children : ReactNode}){
    const {toast} = useToast()

    const [input, setInput] = useState({
        code : "",
        title : "",
        description : "",
    });
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const token = await getToken();
            const res = await fetch(`/api/admin/practicum`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                body : JSON.stringify(input)
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)
            
            refreshCache('/');
            toast({
                title : "Success Creating Modul",
                variant : "success",
                description : data.message
            })
            
        } catch (error:any) {
            toast({
                title : "Error Creating Modul",
                variant : "destructive",
                description : error.message 
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
                    <DialogTitle>Create Modul</DialogTitle>
                    <DialogDescription>Create a new modul for laboratorium participant</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="Title">Code</Label>
                            <Input
                                id="Title"
                                placeholder="MP-2"
                                required
                                className="peer invalid:border-red-500"
                                value={input.code}
                                onChange={(e)=>setInput({...input, code:e.target.value})}
                            />
                            <p className="text-sm hidden peer-invalid:text-red-500 peer-invalid:block">required</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="Title">Title</Label>
                            <Input
                                id="Title"
                                placeholder="Milikan Oil Drop"
                                required
                                className="peer invalid:border-red-500"
                                value={input.title}
                                onChange={(e)=>setInput({...input, title:e.target.value})}
                            />
                            <p className="text-sm hidden peer-invalid:text-red-500 peer-invalid:block">required</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="Description">Description</Label>
                            <Textarea
                                id="Description"
                                className="peer invalid:border-red-500"
                                required
                                placeholder="Milikan Oil drop is practicum that meassuring ...."
                                value={input.description}
                                onChange={(e)=>setInput({...input, description:e.target.value})}
                            />
                            <p className="text-sm hidden peer-invalid:text-red-500 peer-invalid:block">required</p>
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-4">
                            <DialogClose asChild>
                                <Button type="button" variant={"outline"} className="flex flex-row gap-2">
                                    <X className="size-4"/>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="flex flex-row gap-2" disabled={Object.values(input).includes("")|| loading}>
                                { loading ?
                                    <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    <>
                                        <Plus className="size-4"/>
                                        Create
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