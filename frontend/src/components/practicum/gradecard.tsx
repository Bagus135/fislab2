'use client'

import { ChevronDown, Pencil } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { useState } from "react"
import InputScoreModal from "./aslab/inputscore-modal"
import DetailGradeModal from "./detailgrade-modal"
import ProfilePicture from "../profile-picture"
import ProfileModal from "../profile-modal"

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

export function GradeCardAsistant({ grades }: { grades: AllGradeAslab[] | null }) {
    const [openInput, setOpenInput] = useState(false);
    const [selectedMember, setSelectedMember] = useState<member | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<userGrade | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const [selectedId , setSelectedId] = useState<string>('')

    const handleOpenProfile = (id : string) => {
        setOpenProfile(true);
        setSelectedId(id)
    }
    return (
        <>
            {!grades ? (
                <div className="w-full flex justify-center">
                    <p className="text-center">No Practicum Assigned</p>
                </div>
            ) : (
                <>
                    <ProfileModal id={selectedId} open={openProfile} setOpen={setOpenProfile}/>
                    <InputScoreModal member={selectedMember} open={openInput} setOpen={setOpenInput} scheduleId={selectedScheduleId} />
                    <DetailGradeModal open={openDetail} setOpen={setOpenDetail} userGrade={selectedGrade} />
                    {grades.sort((a, b) => a.group - b.group).map((grade, idx) => (
                        <Card key={idx}>
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="grid grid-cols-10 items-start gap-4">
                                    <p className="col-span-8 lg:col-span-9 font-semibold text-base tracking-widest">{grade.practicum.title}</p>
                                    <p className="col-span-2 lg:col-span-1 font-semibold tracking-wide text-end">{grade.practicum.code}</p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-10 items-center gap-4">
                                    <div className="col-span-8 flex flex-row items-center">
                                        <div className="flex flex-row space-x-2 items-center py-2">
                                        <svg height="1792" className="size-6 dark:fill-white" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg"><path d="M529 896q-162 5-265 128h-134q-82 0-138-40.5t-56-118.5q0-353 124-353 6 0 43.5 21t97.5 42.5 119 21.5q67 0 133-23-5 37-5 66 0 139 81 256zm1071 637q0 120-73 189.5t-194 69.5h-874q-121 0-194-69.5t-73-189.5q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q10 0 43 21.5t73 48 107 48 135 21.5 135-21.5 107-48 73-48 43-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-1024-1277q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm704 384q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5zm576 225q0 78-56 118.5t-138 40.5h-134q-103-123-265-128 81-117 81-256 0-29-5-66 66 23 133 23 59 0 119-21.5t97.5-42.5 43.5-21q124 0 124 353zm-128-609q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181z"/></svg>
                                            <p className="text-sm line-clamp-2">Group {grade.group}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center">
                                        <p className="text-sm">{grade.members.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="w-full p-0 flex flex-col">
                                <input type="checkbox" id={`trigger-${idx}`} className="hidden peer" />
                                <label
                                    htmlFor={`trigger-${idx}`}
                                    className="peer-checked:rotate-180 order-last w-full p-2 flex justify-center border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:outline-none focus:ring-2"
                                >
                                    <ChevronDown className="size-4" />
                                </label>
                                <div className="p-4 pr-1 pt-0 hidden peer-checked:flex w-full flex-col transition ease-out duration-1000 border-t">
                                    {grade.members.map((member, i) => (
                                        <div key={i} className="flex flex-row justify-between gap-2 items-center w-full py-2 border-b">
                                            <div className="flex flex-rows items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md py-2" onClick={()=> handleOpenProfile(member.id)} >
                                                <ProfilePicture id={member.id} size="w-10 h-10"/>
                                                <div className="flex flex-col">
                                                    <p className="text-sm">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.nrp}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <div
                                                    className="text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        setSelectedGrade({ ...member, role: "ASISTEN" });
                                                        setOpenDetail(true);
                                                    }}
                                                >
                                                    {member.totalScore || "-"}
                                                </div>
                                                <Button
                                                    variant={"ghost"}
                                                    size={"sm"}
                                                    className="px-1"
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setOpenInput(true);
                                                        setSelectedScheduleId(grade.scheduleId);
                                                    }}
                                                >
                                                    <Pencil className="hover:bg-accent hover:text-accent-foreground size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </>
            )}
        </>
    );
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
                            <div className="  flex flex-row space-x-2 items-center py-2">
                            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="size-6 dark:text-white">
                                <rect fill="none" height="256" width="256"/>
                                <circle cx="104" cy="144" fill="none" r="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                                <path d="M53.4,208a56,56,0,0,1,101.2,0H216a8,8,0,0,0,8-8V56a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                                <polyline fill="none" points="176 176 192 176 192 80 64 80 64 96" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                            </svg>
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
};


