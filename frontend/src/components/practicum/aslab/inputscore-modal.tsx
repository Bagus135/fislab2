"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import { FormEvent, ReactHTMLElement, useEffect, useState } from "react";


type Score = {
    prelab : null|number,
    inlab : null|number,
    abstrak: null|number,
    pendahuluan : null|number,
    metodologi : null|number,
    pembahasan : null|number,
    kesimpulan : null|number,
    format : null|number,
    comment : string
}

type DataType = {
        prelab: number|null;
        inlab: number|null;
        abstrak: number|null;
        pendahuluan: number|null;
        metodologi: number|null;
        pembahasan: number|null;
        kesimpulan: number|null;
        format: number|null;
}

export default function InputScoreModal ({children, score}: {children: React.ReactNode, score : Score}) {

    const [input, setInput] = useState({
        prelab : score.prelab ? `${score.prelab}`: "",
        inlab : score.inlab? `${score.inlab}` : "",
        abstrak: score.abstrak? `${score.abstrak}` : "",
        pendahuluan : score.pendahuluan? `${score.pendahuluan}` : "",
        metodologi : score.metodologi? `${score.metodologi}`: "",
        pembahasan : score.pembahasan? `${score.pembahasan}` : "",
        kesimpulan : score.kesimpulan? `${score.kesimpulan}` : "",
        format : score.format? `${score.format}` : "",
    })
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true); // State to track overall validity

    // Function to validate all inputs
    const validateInputs = () => {
        const patterns = {
            prelab: /^(?:[0-2]?[0-9]|30)(\.\d{1,2})?$/,
            inlab: /^([0-4](\.\d{1,2})?|5)$/,
            pendahuluan: /^([0-9](\.\d{1,2})?|10)$/,
            metodologi: /^([0-4](\.\d{1,2})?|5)$/,
            pembahasan: /^(?:[0-2]?[0-9]|30)(\.\d{1,2})?$/,
            kesimpulan: /^([0-9](\.\d{1,2})?|10)$/,
            format: /^([0-4](\.\d{1,2})?|5)$/,
        };
        // Check each input against its pattern
        for (const key in patterns) {
            if(!!input[key as keyof typeof input].trim()){
                if (!(patterns[key as keyof typeof patterns].test(input[key as keyof typeof input]))) {
                    return false; // If any input is invalid, return false
                }
            }
        }
        return true; // All inputs are valid
    };

    // Effect to check validity whenever input changes
    useEffect(() => {
        setIsValid(validateInputs());
    }, [input]);

    const handleSubmit = (e :FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data :DataType = {
            prelab: null,
            inlab: null,
            abstrak: null,
            pendahuluan: null,
            metodologi: null,
            pembahasan: null,
            kesimpulan: null,
            format: null
        };

        for (const key in data) {
            if(!!(input[key as keyof typeof input] as string).trim()){
                data[key as keyof typeof data] = parseFloat(input[key as keyof typeof input]as string)
            } else {
                data[key as keyof typeof data] = null
            }
            console.log(data)
        }
        
    } 
    return (
        <Dialog>
        <DialogTrigger className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md" asChild>
            {children}
        </DialogTrigger>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent className="p-0 border-none shadow-none">
            <Card className="border-none shadow-none">
                <CardContent className="border-none shadow-none">
                    <ScrollArea className="h-[calc(100vh-6rem)] px-2">
                        <form noValidate onSubmit={handleSubmit}>
                            <div className="grid w-full items-center gap-4 mt-2">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="prelab" className="font-medium">Prelab</Label>
                                    <div className="">
                                        <Input 
                                            id="prelab"
                                            type="text" 
                                            placeholder="0-30" 
                                            className="peer invalid:border-red-500"
                                            value={input.prelab!}
                                            pattern="^(?:[0-2]?[0-9]|30)(\.\d{1,2})?$"
                                            onChange={(e)=>setInput({...input, prelab : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="inlab" className="font-medium">Inlab</Label>
                                    <div className="">
                                        <Input 
                                            id="inlab"
                                            type="text" 
                                            placeholder="0-5" 
                                            className="peer invalid:border-red-500"
                                            value={input.inlab!}
                                            pattern="^([0-4])(\.\d{1,2})?|5$"
                                            onChange={(e)=>setInput({...input, inlab : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="pendahuluan" className="font-medium">Pendahuluan</Label>
                                    <div className="">
                                        <Input 
                                            id="pendahuluan"
                                            type="text" 
                                            placeholder="0-10" 
                                            className="peer invalid:border-red-500"
                                            value={input.pendahuluan!}
                                            pattern="^([0-9])(\.\d{1,2})?|10"
                                            onChange={(e)=>setInput({...input, pendahuluan : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="metodologi" className="font-medium">Metodologi</Label>
                                    <div className="">
                                        <Input 
                                            id="metodologi"
                                            type="text" 
                                            placeholder="0-5" 
                                            className="peer invalid:border-red-500"
                                            value={input.metodologi!}
                                            pattern="^([0-4])(\.\d{1,2})?|5$"
                                            onChange={(e)=>setInput({...input, metodologi : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="pembahasan" className="font-medium">Pembahasan</Label>
                                    <div className="">
                                        <Input 
                                            id="pembahasan"
                                            type="text" 
                                            placeholder="0-30" 
                                            className="peer invalid:border-red-500"
                                            value={input.pembahasan!}
                                            pattern="^(?:[0-2]?[0-9]|30)(\.\d{1,2})?$"
                                            onChange={(e)=>setInput({...input, pembahasan : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="kesimpulan" className="font-medium">Kesimpulan</Label>
                                    <div className="">
                                        <Input 
                                            id="kesimpulan"
                                            type="text" 
                                            placeholder="0-10" 
                                            className="peer invalid:border-red-500"
                                            value={input.kesimpulan!}
                                            pattern="^([0-9])(\.\d{1,2})?|10$"
                                            onChange={(e)=>setInput({...input, kesimpulan : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="format" className="font-medium">Format</Label>
                                    <div className="">
                                        <Input 
                                            id="format"
                                            type="text" 
                                            placeholder="0-5" 
                                            className="peer invalid:border-red-500"
                                            value={input.format!}
                                            pattern="^([0-4])(\.\d{1,2})?|5$"
                                            onChange={(e)=>setInput({...input, format : e.target.value })}
                                            />
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Input NRP yang bener bang</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="comment" className="font-medium">Comment</Label>
                                    <div className="">
                                        <Textarea 
                                            id="comment"
                                            placeholder="Good Job Bro!" 
                                            className="peer invalid:border-red-500"
                                            value={comment}
                                            onChange={(e)=>setComment(e.target.value)}
                                            />
                                    </div>
                                </div>
                                <Button 
                                    disabled={loading || !isValid} 
                                    className="w-full text-lg font-bold mt-2">
                                    {loading?
                                        <Loader2Icon className="size-4 animate-spin"/>
                                        :
                                        "Submit"    
                                }
                                </Button>
                                </div>
                        </form>
                    </ScrollArea>
                </CardContent>
            </Card>
        </DialogContent>
    </Dialog>
    )
}