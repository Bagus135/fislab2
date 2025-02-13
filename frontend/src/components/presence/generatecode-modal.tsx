"use client"

import { Fragment, ReactNode, useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { Button } from "../ui/button";
import { Clipboard, ClipboardCheck, QrCode } from "lucide-react";

export default function GenerateCodeModal ({children}:{children : ReactNode}){
    const [code, setCode] = useState("------")
    const [isCopy, setIsCopy]  = useState(false)

    const handleCopy = async () =>{
        try {
            await navigator.clipboard.writeText(code);
            setIsCopy(true)
        } catch (error) {
            setIsCopy(false)
        }
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Generate Presence Code</DrawerTitle>
                    <DrawerDescription>Presence Code for Group 8</DrawerDescription>
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
                    <DrawerClose>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                    { code === "------"? 
                        <Button className="flex flex-row gap-2">
                            <QrCode className="size-4"/>
                            Generate
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