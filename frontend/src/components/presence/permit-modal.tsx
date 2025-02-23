'use client'

import { FormEvent, ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function PermitModal ({children}:{children : ReactNode}) {
    const [input, setInput] = useState({
        type : "",
        reason : "",
    })

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
                        <CardTitle>Absence Permit</CardTitle>
                        <CardDescription>Tell your absence to MP-2 Asistant</CardDescription>
                    </CardHeader>
                    <form className="p-0 m-0" noValidate onSubmit={handleSubmit}>
                        <CardContent className="flex flex-col gap-6 justify-start my-2">
                            <div className="flex flex-col w-full">
                                <Label htmlFor="type">Type</Label>
                                <Select onValueChange={(value)=> setInput({...input, type : value})}>
                                    <SelectTrigger className="mt-1 invalid:border-red-300">
                                        <SelectValue placeholder="Select the type of permission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">Sick</SelectItem>
                                        <SelectItem value="permission">Permission</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col w-full">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea   id="reason" 
                                            className="peer mt-1 w-full h-20 invalid:border-red-300" 
                                            required
                                            value={input.reason}
                                            onChange={(e)=>setInput({...input, reason : e.target.value})}/>
                                <p className="peer-invalid:text-red-300 peer-invalid:visible invisible text-xs"> This field is required</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant={"default"} type="submit" disabled={!input.reason.trim() || !input.type.trim()} >
                                Submit
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    )
}