'use client'

import { FormEvent, ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "../ui/button"

export default function InputCodeModal ({children}:{children : ReactNode}) {
    const [input, setInput] = useState("")

    const handleSubmit = async(e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
    }

    return (
        <Dialog>
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
                        <CardDescription>Input 6 digit code from MP-2 Asistant</CardDescription>
                    </CardHeader>
                    <form className="p-0 m-0" noValidate onSubmit={handleSubmit}>
                        <CardContent className="flex justify-center my-2">
                            <InputOTP maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={input}
                                onChange={(val)=>setInput(val)}
                            >
                                <InputOTPGroup>
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
                                Submit
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    )
}