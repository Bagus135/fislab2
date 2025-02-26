'use client'

import { ChevronDown, Pencil, Users2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { useState } from "react"
import InputScoreModal from "./aslab/inputscore-modal"
import DetailGradeModal from "./detailgrade-modal"

type member = {
    gradedAt : string | null;
    gradeId: number | null;
    name: string;
    nrp: string;
    totalScore: null | number;
    id: string;
};

type userGrade = 
|{
    role : 'ASISTEN'
    gradedAt : string | null;
    gradeId: number | null;
    name: string;
    nrp: string;
    totalScore: null | number;
    id: string;
} | {
    role : "PRAKTIKAN",
    data : AllGradePractican
};

export  function GradeCardAsistant ({grades} : {grades : AllGradeAslab[]}) {
    const [openInput, setOpenInput] = useState(false)
    const [selectedMember, setSelectedMember] = useState<member|null>(null);
    const [selectedGrade , setSelectedGrade] = useState<userGrade|null>(null)
    const [selectedScheduleId, setSelectedScheduleId] = useState<number|null>(null)
    const [openDetail , setOpenDetail] = useState(false)
    return (
        <>
        <InputScoreModal member={selectedMember} open={openInput} setOpen={setOpenInput} scheduleId={selectedScheduleId}/>
        <DetailGradeModal open={openDetail} setOpen={setOpenDetail} userGrade={selectedGrade}/>
        { grades.map((grade, idx)=> (
            <Card key={idx}>
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="grid grid-cols-10 items-start gap-4">
                    <p className="col-span-8 lg:col-span-9 font-semibold text-base tracking-widest">{grade.practicum.title}</p>
                    <p className="col-span-2 lg:col-span-1 font-semibold tracking-wide text-end">{grade.practicum.code}</p>
                </div>
                <Separator/>
                <div className="grid grid-cols-10 items-center gap-4">
                    <div className="col-span-8  flex flex-row items-center">
                            <div className="  flex flex-row space-x-2 items-center">
                                <Users2 className="size-4"/>
                                <p className="text-sm line-clamp-2">Group {grade.group} </p>
                            </div>
                    </div>
                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                        <p className="text-sm">{grade.members.length} </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="w-full p-0 flex flex-col">

                    <input type="checkbox" id={`trigger-${idx}`}className="hidden peer" />
                    <label
                    htmlFor={`trigger-${idx}`}
                    className="peer-checked:rotate-180  order-last w-full p-2 flex justify-center border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:outline-none focus:ring-2"
                    >
                        <ChevronDown className="size-4 "/>
                    </label>

                        
                        <div className=" p-4 pr-1 pt-0 hidden peer-checked:flex w-full flex-col transition ease-out duration-1000 border-t">
                    { grade.members.map((member, i)=>(
                        <div key={i} className="flex flex-row justify-between gap-2 items-center w-full py-2 border-b">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm">{member.name}</p>
                                <p className="text-sm">{member.nrp}</p>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <div className="text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground "
                                    onClick={()=>{
                                        setSelectedGrade({...member, role : "ASISTEN"})
                                        setOpenDetail(true)
                                    }}
                                    >{member.totalScore || "-"}
                                </div>
                                <Button variant={"ghost"} 
                                        size={"sm"} 
                                        className="px-1"
                                        onClick={()=> {
                                            setSelectedMember(member);
                                            setOpenInput(true);
                                            setSelectedScheduleId(grade.scheduleId)
                                        }}>
                                    <Pencil className="hover:bg-accent hover:text-accent-foreground size-4"/>
                                </Button>
                            </div> 
                        </div>
                    ))
                    }
                    </div>
            </CardFooter>
        </Card>
        ))
            
        }
        
    </>
    )
}

export  function GradeCardPractican ({grades} : {grades : AllGradePractican[]|null}) {
    const  [openDetail, setOpenDetail] = useState(false)
    const  [selectedGrade, setSelectedGrade] = useState<userGrade|null>(null)
    return (
        <>
        <DetailGradeModal open={openDetail} setOpen={setOpenDetail} userGrade={selectedGrade}/>
        { !!grades ?  
        grades.map((grade, idx)=> (
            <Card key={idx}>
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="grid grid-cols-10 items-start gap-4">
                    <p className="col-span-8 lg:col-span-9 font-semibold text-base tracking-widest">Tetes Minyak Milikan dan Experiment Frank Hertz</p>
                    <p className="col-span-2 lg:col-span-1 font-semibold tracking-wide text-end">MP-4</p>
                </div>
                <Separator/>
                <div className="grid grid-cols-10 items-center gap-4">
                    <div className="col-span-8  flex flex-row items-center">
                            <div className="  flex flex-row space-x-2 items-center">
                                <Users2 className="size-4"/>
                                <p className="text-sm line-clamp-2">{grade.assistant.name} </p>
                            </div>
                    </div>
                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                        <div className="text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground "
                                    onClick={()=>{
                                        setSelectedGrade({data : grade, role : "PRAKTIKAN"})
                                        setOpenDetail(true)
                                    }}
                                    >
                                {grade.totalScore || "-"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        ))
            : 
            <Card>
                <CardHeader>
                    <CardTitle> No List Showed </CardTitle>
                    <CardDescription>Your score will be appear if the asinstant completely grading your practicum</CardDescription>
                </CardHeader>
            </Card>
        }
        
    </>
    )
}
