'use client'
import { editGroupPractican } from "@/action/admin.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon, Save, Search, X } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

type Props = {
    group : getPracticanGroup,
    practicans : getPractican,
    children : ReactNode
}

type InputType = {
    member_ids : string[],
    nrp : string[],
}

export default function EditMemberPracticanModal ({group, children,practicans}: Props){
    const {toast} = useToast()
    
    const [search , setSearch] = useState("")
    const [input, setInput] = useState<InputType>({
        member_ids :  group.members.map(member => member.id),
        nrp : group.members.map(member => member.nrp),
    })
    const [loading, setLoading] = useState(false);

    const handleCheckboxChange = (checked : boolean|string , id : string, nrp : string)=> {
        checked? 
            setInput({...input, 
                    member_ids : [...input.member_ids, id],
                    nrp : [...input.nrp, nrp]
                })
            : 
            setInput({...input, 
                member_ids : input.member_ids.filter((item)=> item !== id), 
                nrp : input.nrp.filter((item)=> item !== nrp), 
            })
    };

    const handleSubmit = async(e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            if(!group) throw new Error('Group is not defined') 
            const res = await editGroupPractican({ 
                    group : group.kelompok,
                    member_ids : input.member_ids, 
                    id :group.id 
                });
            toast({
                title : "Updated Success",
                variant : "success",
                description : res.message
            })
        } catch (error:any) {
            toast({
                title : "Failed to Update Practican group",
                variant : "destructive",
                description : error.message
            })
        } finally {
            setLoading(false)
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                    <DialogDescription>Group {group?.kelompok}</DialogDescription>
                </DialogHeader>
                <form noValidate className="mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex flex-col gap-1">
                             <div className="flex flex-wrap gap-2 rounded-md border p-2">
                                { input.nrp.length === 0 ? 
                                        <p className="text-center w-full text-xs"> No Practican Selected</p>
                                        :
                                        input.nrp.map((nrp) =>(
                                            <Badge key={nrp} variant={"secondary"}>{nrp}</Badge>
                                        ))
                                }
                             </div>
                        </div>
                        <div className="flex flex-col gap-1">        
                            <div className="relative ">
                                <span className="absolute p-1 pl-3 inset-y-0 top-0 left-0 flex items-center">
                                    <Search className="size-4"/>
                                </span>
                                <Input
                                    placeholder="Search practican name or NRP..." 
                                    className="pl-12"
                                    value={search}
                                    onChange={(e)=>setSearch(e.target.value)}
                                    />
                            </div>
                       
                            <ScrollArea className="max-h-[calc(35vh)] overflow-y-auto [&::-webkit-scrollbar]:w-2
                                        [&::-webkit-scrollbar-track]:bg-gray-100
                                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" >
                                <ScrollBar orientation="vertical"/>
                                <Table className="text-center">
                                    <TableHeader>
                                        <TableRow >
                                            <TableHead></TableHead>
                                            <TableHead className="text-center">NRP</TableHead>
                                            <TableHead className="text-center">Name</TableHead>
                                            <TableHead className="text-center">Group</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{
                                        practicans && practicans.users &&
                                        practicans.users.filter(practican => 
                                            practican.nrp.toLowerCase().includes(search.toLowerCase()) || 
                                            practican.name.toLowerCase().includes(search.toLowerCase())
                                        ).map((practican,idx) =>(
                                            <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                                <TableCell>
                                                    <Checkbox checked={input.member_ids.includes(practican.id)} onCheckedChange={(checked)=> handleCheckboxChange(checked, practican.id, practican.nrp) }/>
                                                </TableCell>
                                                <TableCell className="font-medium">{practican.nrp}</TableCell>
                                                <TableCell>{practican.name}</TableCell>
                                                <TableCell>7</TableCell>
                                            </TableRow>
                                        ))
                                        }
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>


                        <DialogFooter className="flex flex-row justify-end gap-4">
                            <DialogClose asChild>
                                <Button type="button" variant={"outline"} className="flex flex-row gap-2">
                                    <X className="size-4"/>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" 
                                    className="flex flex-row gap-2" 
                                    disabled={input.member_ids.length ===0 || loading}>
                                { loading ?
                                    <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    <>
                                        <Save className="size-4"/>
                                        Save
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