'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

export default function CreateAnnouncementModal ({children}: {children : ReactNode}) {
    const [input, setInput] = useState({
        title : "",
        content : ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogHeader>
                <DialogTitle className="hidden"/>
                <DialogDescription className="hidden"/>
            </DialogHeader>
            <DialogContent>
                <Card className="shadow-none border-none">
                    <CardHeader>
                        <CardTitle className="text-center">Create Announcement</CardTitle>
                    </CardHeader>
                    <CardContent >
                        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="title" className="font-medium">Title</Label>
                                <div className="">
                                    <Input 
                                        id="title"
                                        type="text" 
                                        placeholder="0-30" 
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
                                    <Input 
                                        id="content"
                                        type="text" 
                                        placeholder="0-30" 
                                        className="peer invalid:border-red-500"
                                        value={input.content!}
                                        required
                                        onChange={(e)=>setInput({...input, content : e.target.value })}
                                        />
                                        <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">required</span>
                                </div>
                            </div>
                            <Button 
                                disabled={loading || !input.content.trim() ||!input.title.trim()} 
                                className="w-full text-lg font-bold mt-2">
                                {loading?
                                    <Loader2Icon className="size-4 animate-spin"/>
                                    :
                                    "Create"    
                            }
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}