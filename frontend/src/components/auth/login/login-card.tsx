'use client'

import { loginAction } from "@/action/auth.action"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon, LockIcon, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function LoginCard (){
    const {toast} = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState({
        nrp : '',
        password : '',
    })
    
    const handleLogin = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        try {
            setLoading(true)
            const res = await fetch('/api/login',{
                method : 'POST',
                body : JSON.stringify(input),
                headers : {
                    "Content-Type" : "application/json"
                }
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)
            
            loginAction(data.token)
            router.push("/dashboard")
            toast({
                title : "Login Successfully" ,
                description : "Welcome to The Dark System Fislab",
                variant : "success"
            })
            

        } catch (error : any) {
            toast({
                title : error.message ,
                description : "NRP or Password Wrong",
                variant : "destructive"
            })
        } finally {
            setLoading(false)
        }
    } 

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
                <form noValidate onSubmit={handleLogin}>
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
                                    type="password" 
                                    placeholder="********" 
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