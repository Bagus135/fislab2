import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { ReactNode, useState } from "react";

export default function CreateSesionPracticum({children}: {children : ReactNode}){
    const [input, setInput] = useState({
        group : "",
        week : "",
        session : "",
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Session Practicum</DialogTitle>
                    <DialogDescription>Connect asistant laboratorium  with the practican group</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4">
                    <div className="flex flex-col justify-center gap-6">

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="group">Practican Group</Label>
                            <Select required onValueChange={(value)=>setInput({...input, group: value})}>
                                <SelectTrigger id="group">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Week</Label>
                            <Select required onValueChange={(value)=>setInput({...input, week: value})}>
                                <SelectTrigger id="aslab">
                                    <SelectValue placeholder="Select Here"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="aslab">Asistant Laboratorium</Label>
                            <Select required onValueChange={(value)=>setInput({...input, session: value})}>
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