'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon, LockIcon, User } from "lucide-react";
import { useState } from "react";


export default function LoginCard () {
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState({
        nrp : '',
        password : '',
    })
    
    return (
        <>
            <CardHeader>
                <div className="flex flex-col justify-center mx-auto items-center">
                    <img src="/logofisika.png" className="visible dark:hidden" width="50" alt="Fisika ITS"/>
                    <img src="/whitephi.png" className="hidden dark:block"  width="50" alt="Fisika ITS"/>
                </div>
                <CardTitle className="text-center text-2xl">LOGIN</CardTitle>
                <CardDescription className="text-xs text-center">Welcome to dark system of physics laboratory</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4 mt-2">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="nrp" className="font-medium">NRP</Label>
                            <div className=" relative">
                                <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                    <User className="size-4"/>
                                </span>
                                <Input 
                                    id="nrp" 
                                    placeholder="5001231000" 
                                    className="peer pl-12 invalid:border-red-500"
                                    value={input.nrp}
                                    pattern="^[a-zA-Z0-9]{10}$"
                                    onChange={(e)=>setInput({...input, nrp : e.target.value })}
                                    />
                                    <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="password" className="font-medium">Password</Label>
                            <div className="relative ">
                                <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                                    <LockIcon className="size-4"/>
                                </span>
                                <Input
                                    id="password" 
                                    placeholder="5001231000" 
                                    className="pl-12"
                                    value={input.password}
                                    onChange={(e)=>setInput({...input, password : e.target.value})}
                                    />
                            </div>
                        </div>
                        <Button 
                            disabled={!input.nrp.match(/^[a-zA-Z0-9]{10}$/) || loading} 
                            className="w-full text-lg font-bold mt-2">
                            {loading?
                                <Loader2Icon className="size-4 animate-spin"/>
                                :
                                "Submit"    
                        }
                        </Button>
                    </div>
                </form>
            </CardContent>
    </>
    )
}