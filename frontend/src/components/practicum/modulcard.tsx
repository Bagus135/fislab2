'use client'

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ReactNode } from "react";

export default function ModulPracticumCard (){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Practicum Modul</CardTitle>
                <CardDescription>Guide Book for Practicum Fislab</CardDescription>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
                <Button variant={"outline"} asChild>
                    <Link  href={'https://drive.google.com/drive/folders/1WTeXyuCh0BZfIg--H16Sb6MevvhTytRk'}>
                        Preview
                    </Link>
                </Button>
                <DialogDownload>
                    <Button variant={"default"}>Download</Button>
                </DialogDownload>
            </CardContent>
        </Card>
    )
}
function DialogDownload ({children} : {children : ReactNode}){
    const MPDownload = () => {
        const link = document.createElement("a")
        link.href = '/modul/MP_Guides.pdf'
        link.download = 'MP-Guides.pdf'
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
    };

    const WDownload = () => {
        const link = document.createElement("a")
        link.href = '/modul/W_Guides.pdf'
        link.download = 'W-Guides.pdf'
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Modul</DialogTitle>
                    <DialogDescription>Waves Guides and Modern Physics Guides</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2 justify-center">
                    <Button onClick={WDownload}>
                        W-Guides
                    </Button>
                    <Button onClick={MPDownload}>
                        MP-Guides
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
