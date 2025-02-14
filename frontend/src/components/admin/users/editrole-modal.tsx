import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Replace, X } from "lucide-react";
import { ReactNode, useState } from "react";

export default function EditRoleModal({children}: {children : ReactNode}){
    const [input, setInput] = useState("")
    return (
        <Dialog>
            <DialogTrigger asChild disabled={true}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Aslab - Modul</DialogTitle>
                    <DialogDescription>Connect Asistant Laboratorium with the desire module</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4">
                    <div className="flex flex-col justify-center gap-6">

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="role">Role</Label>
                            <Select required onValueChange={(value)=>setInput(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Practican">Practican</SelectItem>
                                        <SelectItem value="Asistant Laboratorium">Asistant Laboratorium</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>


                        <DialogFooter className="flex flex-row justify-end gap-4">
                            <DialogClose asChild>
                                <Button type="button" variant={"outline"} className="flex flex-row gap-2">
                                    <X className="size-4"/>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="flex flex-row gap-2" disabled={!input.trim()}>
                                <Replace className="size-4"/>
                                Change
                            </Button>
                        </DialogFooter>

                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}