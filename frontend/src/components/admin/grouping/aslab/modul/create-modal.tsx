import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";

export default function CreateModulAslabModal({children}: {children : ReactNode}){
    const [input, setInput] = useState({
        aslab : "",
        modul : "",
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
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
                            <Label htmlFor="aslab">Asistant Laboratorium</Label>
                            <Select required onValueChange={(value)=>setInput({...input, aslab: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Alief Hisyam Al Hasany Nur Rahmat">Alief Hisyam Al Hasany Nur Rahmat</SelectItem>
                                        <SelectItem value="Bagus Mustaqim">Bagus Mustaqim</SelectItem>
                                        <SelectItem value="Hugo">Hugo Pramaditya</SelectItem>
                                        <SelectItem value="Baha">M. Bahaullah Kholidi</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Module Code</Label>
                            <Select required onValueChange={(value)=>setInput({...input, modul: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Alief Hisyam Al Hasany Nur Rahmat">Alief Hisyam Al Hasany Nur Rahmat</SelectItem>
                                        <SelectItem value="Bagus Mustaqim">Bagus Mustaqim</SelectItem>
                                        <SelectItem value="Hugo">Hugo Pramaditya</SelectItem>
                                        <SelectItem value="Baha">M. Bahaullah Kholidi</SelectItem>
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
                            <Button type="submit" className="flex flex-row gap-2" disabled={!input.aslab.trim()||!input.modul.trim()}>
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