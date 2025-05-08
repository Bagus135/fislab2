'use client'

import { FormEvent, ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "../ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon } from "lucide-react"
import { getToken, refreshCache } from "@/action/auth.action"

export default function InputCodeModal ({children , schedule}:{children : ReactNode, schedule : getPracticanSchedules}) {
    const [input, setInput] = useState("")
    const {toast}= useToast()
    const [loading, setLoading] = useState(false)
    const [open , setOpen] = useState(false)

    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        try {
            setLoading(true)
            const token = await getToken();
            const res =  await fetch(`/api/attendance/${schedule.id}`,{
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                method : "POST",
                body : JSON.stringify({code  : input})
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            toast({
                title : "Code Submitted",
                variant : "success",
                description : data.message
            })
            setOpen(false)
        } catch (error:any) {
            toast({
                title : "Failed to submit code",
                variant : "destructive",
                description : error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogHeader className="hidden">
                <DialogTitle/>
                <DialogDescription/>
            </DialogHeader>
            <DialogContent>
                <Card className="shadow-none border-none">
                    <CardHeader>
                        <CardTitle>Presence Code</CardTitle>
                        <CardDescription>Input 6 digit code from {schedule.practicum.code} Assistant {schedule.assistant.name}</CardDescription>
                    </CardHeader>
                    <form className="p-0 m-0" noValidate onSubmit={handleSubmit}>
                        <CardContent className="flex justify-center my-2">
                            <InputOTP maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={input}
                                onChange={(val)=>setInput(val)}
                            >
                                <InputOTPGroup className="space-x-2">
                                    <InputOTPSlot index={0}/>
                                    <InputOTPSlot index={1}/>
                                    <InputOTPSlot index={2}/>
                                    <InputOTPSlot index={3}/>
                                    <InputOTPSlot index={4}/>
                                    <InputOTPSlot index={5}/>
                                </InputOTPGroup>
                            </InputOTP>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant={"default"} type="submit">
                                {   
                                    loading? 
                                        <Loader2Icon className="animate-spin size-4"/>
                                    :
                                    'Submit'
                                }
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    )
}