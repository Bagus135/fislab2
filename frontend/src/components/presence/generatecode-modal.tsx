"use client"

import { Fragment, ReactNode, useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { Button } from "../ui/button";
import { Clipboard, ClipboardCheck, Loader2Icon, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/action/auth.action";

export default function GenerateCodeModal ({children, schedule}:{children : ReactNode, schedule : getAssistantSchedules}){
    const [code, setCode] = useState("------")
    const [isCopy, setIsCopy]  = useState(false)
    const [loading, setLoading] = useState(false)
    const {toast} = useToast()
    const handleCopy = async () =>{
        try {
            await navigator.clipboard.writeText(code);
            setIsCopy(true)
        } catch (error) {
            setIsCopy(false)
        }
    }

    const handleGenerate = async () =>{
        try {
            setLoading(true)
            const token = await getToken();
            const res =  await fetch(`/api/assistant/attendance/generate`,{
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                method : "POST",
                body : JSON.stringify({scheduleId : schedule.id})
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data.error)
            setCode(data.code)
        
        } catch (error:any) {
            toast({
                title : "Error in generating schedule",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Generate Presence Code {schedule.schedule.date}</DrawerTitle>
                    <DrawerDescription>Presence Code for group {schedule.group}</DrawerDescription>
                </DrawerHeader>
                
                <div className="flex flex-row justify-center gap-4 md:space-x-4 lg:space-x-8">
                    { code.split("").map((i, idx)=>(
                        <Fragment key={idx}>
                            <p className="text-5xl font-semibold font-mono">{i}</p>
                        </Fragment>
                    ))
                    
                    }
                </div>

                <DrawerFooter className="flex flex-row gap-4 justify-end"> 
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                    { code === "------"? 
                        <Button className="flex flex-row gap-2" onClick={handleGenerate}>
                            {loading ? 
                                <Loader2Icon className="size-4 animate-spin"/>
                                :
                                <>
                                    <QrCode className="size-4"/>
                                    Generate
                                </>
                            }
                        </Button>
                        :
                        <Button onClick={handleCopy}>
                            {!isCopy? <Clipboard className="size-4"/> : <ClipboardCheck className="size-4"/>}
                        </Button>
                    }
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}