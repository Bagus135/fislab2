import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";

export default function CreateUserModal({children}: {children : ReactNode}){
    const [input, setInput] = useState({
        nrp : "",
        name : "",
        gender : "",
        password : "",

    });

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
                <form noValidate className="mt-4">
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
                            <Label htmlFor="aslab">Gender</Label>
                            <Select required onValueChange={(value)=>setInput({...input, gender: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
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
                                <Plus className="size-4"/>
                                Create
                            </Button>
                        </DialogFooter>

                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}