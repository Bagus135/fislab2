'use client'
import { getToken, refreshCache } from "@/action/auth.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Plus, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

export default function CreateUserModal({children}: {children : ReactNode}){
    const {toast} = useToast()
    const [loading,setLoading] = useState(false);
    const [input, setInput] = useState({
        nrp : "",
        name : "",
        role : "",
        password : "",

    });
    
    const handleSubmit = async(e : FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
         try {
            setLoading(true)
               const token = await getToken();
               const res = await fetch(`/api/admin/register`, {
                   method : "POST",
                   headers : {
                       "Content-Type" : "application/json",
                       "Authorization" : token,
                   },
                   body : JSON.stringify(input)
               })
               const data = await res.json();
               console.log(data);
               
               if(!res.ok) throw new Error(data.error)
               refreshCache()
               toast({
                title : "Success Creating User",
                variant : "success",
                description : data.token 
            })
        } catch (error:any) {
            toast({
                title : "Error Creating User",
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
                    <DialogTitle>Sign Up</DialogTitle>
                    <DialogDescription>Create a new physics laboratorium participant</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="nrp">NRP</Label>
                            <Input
                                id="nrp"
                                placeholder="5001221000"
                                value={input.nrp}
                                onChange={(e)=>setInput({...input, nrp:e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Hugo Walkers"
                                value={input.name}
                                onChange={(e)=>setInput({...input, name:e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Role</Label>
                            <Select required onValueChange={(value)=>setInput({...input, role: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        <SelectItem value="ASISTEN">ASISTEN</SelectItem>
                                        <SelectItem value="PRAKTIKAN">PRAKTIKAN</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="pass">Password</Label>
                            <Input
                                type="password"
                                id="pass"
                                placeholder="******"
                                value={input.password}
                                onChange={(e)=>setInput({...input, password:e.target.value})}
                            />
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-4">
                            <DialogClose asChild>
                                <Button type="button" variant={"outline"} className="flex flex-row gap-2">
                                    <X className="size-4"/>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="flex flex-row gap-2" disabled={Object.values(input).includes("")}>
                                {
                                    loading ?
                                        <Loader2Icon className="size-4 animate-spin"/> 
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