"use client"

import { getToken, refreshCache } from "@/action/auth.action";
import { getDetailScore } from "@/action/grade.action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type ScoreType = {
    punctuality: string|number;
    preExam: string|number;
    oralTest: string|number;
    skillsAndAttitude: string|number;
    abstract: string|number;
    introduction: string|number;
    methodology: string|number;
    discussion: string|number;
    dataProcessing: string|number;
    conclusion: string|number;
    formatting: string|number;
    feedback: string|number;
};

type PayloadType = {
    [K in keyof ScoreType]: K extends 'feedback' ? number : number;
};

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void,
    member: {
        gradedAt: string | null;
        gradeId: number | null;
        name: string;
        nrp: string;
        totalScore: null | number;
        id: string;
    } | null,
    scheduleId : number|null
}

export default function InputScoreModal({ open, setOpen, member, scheduleId}: Props) {
    const initScoreInput = {
        punctuality: '',
        preExam: '',
        oralTest: '',
        skillsAndAttitude:'',
        abstract: '',
        introduction: '',
        methodology: '',
        discussion: '',
        dataProcessing: '',
        conclusion:'',
        formatting: '',
        feedback: '',
    };

    const {toast} = useToast();
    const [loading, setLoading] = useState({
        score : false,
        submit : false,
    });
    const [isValid, setIsValid] = useState(true);
    const [input, setInput] = useState<ScoreType>(initScoreInput);
    useEffect(() => {
        const detailProfile = async () => {
            try {
                setInput(initScoreInput);
                setLoading({...loading, score : true})
                if(!member)throw new Error ('Error in client side')
                if(!member.gradeId) throw new Error ('user have beent grading yet')
                const  score = await getDetailScore(member.gradeId) as GetDetailedScoreType
                setInput({
                        punctuality: String(score.scores.prelab.punctuality),
                        preExam: String(score.scores.prelab.preExam),
                        oralTest: String(score.scores.prelab.oralTest),
                        skillsAndAttitude: String(score.scores.inlab.skillsAndAttitude),
                        abstract: String(score.scores.postlab.abstract),
                        introduction: String(score.scores.postlab.introduction),
                        methodology: String(score.scores.postlab.methodology),
                        discussion: String(score.scores.postlab.discussion),
                        dataProcessing: String(score.scores.postlab.dataProcessing),
                        conclusion: String(score.scores.postlab.conclusion),
                        formatting: String(score.scores.postlab.formatting),
                        feedback: String(score.feedback),
                })
            } catch (error: any) {
                return null
            } finally {
                setLoading({...loading, score : false})
            }
        }
        detailProfile();
    }, [member]);

    const patterns = {
        // (?:\.\d{1,2})? | (?:\.0{1,2})? kasih ini kalau mau 2 angka di belakang koma
        punctuality: /^(?:[0-4]|5)$/, // 0-5 
        preExam: /^(?:[0-9]|10)$/, // 0-10 
        oralTest: /^(?:[0-9]|10)$/, // 0-10 
        skillsAndAttitude: /^(?:[0-4]|5)$/, // 0-5 
        abstract: /^(?:[0-4]|5)$/, // 0-5 
        introduction: /^(?:[0-9]|10)$/, // 0-10 
        methodology: /^(?:[0-4]|5)$/, // 0-5 
        discussion: /^(?:[0-2]?[0-9]|30)$/, // 0-30 
        dataProcessing: /^(?:[0-9]|10)$/, // 0-10 
        conclusion: /^(?:[0-4]|5)$/, // 0-5 
        formatting: /^(?:[0-4]|5)$/, // 0-5 
    };

    const placeholder = {
        // (?:\.0{1,2})? kasih ini kalau mau 2 angka di belakang koma
        punctuality: '0-5',
        preExam: '0-10',
        oralTest:'0-10',
        skillsAndAttitude: '0-5', 
        abstract: '0-5' , 
        introduction: '0-10',  
        methodology: '0-5', 
        discussion:  '0-30', 
        dataProcessing: '0-10', 
        conclusion: '0-5', 
        formatting: '0-5',
    };

    const validateInputs = () => {
        for (const key in patterns) {
            const value = input[key as keyof typeof input];
            if (key !== "feedback" && (value as string).trim() !== '') {
                if (!patterns[key as keyof typeof patterns].test(value as string)) {
                    return false; // Return false if any input is invalid
                }
            }
        }
        return true; // All inputs are valid
    };

    useEffect(() => {
        setIsValid(validateInputs());
    }, [input]);
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if(!member || !scheduleId) throw new Error('Error in Client side')
                setLoading({...loading, submit : true});
            const data: ScoreType = { ...input };
            
            for (const key in data) {
                if (key !== "feedback" ) {
                    if(!!(input[key as keyof typeof input] as string).trim()){
                        data[key as keyof typeof data] = parseFloat(input[key as keyof typeof input] as string);
                    } else {
                        data[key as keyof typeof data] = 0;
                    }
                } else if (key === "feedback") {
                    data[key as keyof typeof data] = input[key as keyof typeof data];
                }
            }
            
            const datainput = data as PayloadType

            if (!member.gradeId) {
                // generate gradeId /POST
                const token = await getToken()
                const res =  await fetch(`/api/assistant/grade`,{
                    headers : {
                        "Content-Type" : "application/json",
                        "Authorization" : token,
                    },
                    method : "POST",
                    body : JSON.stringify({...datainput, userId : member.id, scheduleId : scheduleId})
                })
                const data = await res.json();

                if(!res.ok) throw new Error(data.error);

                refreshCache('/')
                toast({
                    title : "Grade practican has been input",
                    description : data.message,
                    variant : "success" 
                })
            } else {
                const token = await getToken()
                const res =  await fetch(`/api/assistant/grade/update/${member.gradeId}`,{
                    headers : {
                        "Content-Type" : "application/json",
                        "Authorization" : token,
                    },
                    method : "PUT",
                    body : JSON.stringify(datainput)
                })
                const data = await res.json();

                if(!res.ok) throw new Error(data.error);
                
                refreshCache('/')
                toast({
                    title : "Grade practican has been updated",
                    description : data.message,
                    variant : "success" 
                })
            }
            
        } catch (error : any) {
            toast({
                title : "Failed to input practican grade",
                description : error.message,
                variant : "destructive" 
            })
        } finally {
            setLoading({...loading, submit : false});

        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
            <ScrollArea className="h-[calc(100vh-8rem)] px-2">
                <DialogHeader>
                    <DialogTitle>Input Score</DialogTitle>
                    <DialogDescription>{member?.name} - {member?.nrp}</DialogDescription>
                </DialogHeader>
                    <form noValidate onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4 mt-8 px-1">
                            {Object.keys(input).map((key) => (
                                key !== "feedback" ? (
                                    <div className="flex flex-col space-y-2" key={key}>
                                        <Label htmlFor={key} className="font-medium capitalize">{key}</Label>
                                        <div>
                                            { loading.score ?
                                                <Skeleton className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors"/>
                                                :
                                                <Input
                                                id={key}
                                                type="text"
                                                placeholder={placeholder[key as keyof typeof placeholder]}
                                                className="peer invalid:border-red-500"
                                                pattern={patterns[key as keyof typeof patterns].source}
                                                value={input[key as keyof ScoreType]}
                                                onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                                                />
                                            }
                                            <span className="text-xs invisible peer-invalid:visible peer-invalid:text-red-400">Invalid input</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-2" key={key}>
                                        <Label htmlFor={key} className="font-medium capitalize">Feedback</Label>
                                        {loading.score ?
                                                <Skeleton className="flex h-16 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors"/>
                                                :
                                                <Textarea
                                                    id={key}
                                                    placeholder="Enter feedback"
                                                    className="peer invalid:border-red-500"
                                                    value={input[key as keyof ScoreType]}
                                                    onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                                                />
                                        }
                                    </div>
                                )
                            ))}
                            <Button
                                disabled={loading.submit || !isValid}
                                className="w-full text-lg font-bold mt-2">
                                {loading.submit ?
                                    <Loader2Icon className="size-4 animate-spin" />
                                    :
                                    "Submit"
                                }
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}