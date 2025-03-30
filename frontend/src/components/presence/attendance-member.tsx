'use client'
import { getToken, refreshCache } from "@/action/auth.action"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckIcon, Loader2Icon, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useToast } from "@/hooks/use-toast"
import { getTextColorScheduleStatus } from "@/utilts/getBgStatus"

type Props = {
    open : boolean
    setOpen : (o: boolean) => void
    schedule : getAssistantSchedules|null
}

type GetPracticanAttendanceType = {
    id: number
    name : string
    nrp : string
    scheduleId : number 
    status : string
    userId : string 
}

type ChangeAttendanceType = {
    scheduleId: number,
    userId: string ,
    status: string
  }

export default function CheckAttendance({ open, setOpen, schedule} : Props){
    const [attendance, setAttendance] = useState<GetPracticanAttendanceType[]|[]>([])
    const [loading, setLoading] = useState({
        getList : false,
        markFinish : false,
    })
    const {toast} = useToast()
    useEffect(()=>{
        const GetPracticanAttendance = async () =>{
            if(!schedule) return
            try {
                setLoading({...loading, getList : true})
                const token = await getToken()
                const res = await fetch(`api/assistant/attendance/status/${schedule.id}`,{
                    headers : {
                        "Content-Type" : "application/json",
                        "Authorization" : token,
                    },
                    method : "GET",
                    }
                )
                const data = await res.json();
                if(!res.ok) throw new Error(data.error)
                setAttendance(data)
            } catch (error:any) {
               setAttendance([])
            } finally {
                setLoading({...loading, getList : false})
            }
        }
        GetPracticanAttendance()
    },[schedule])

    const handleChangeAttencance = async (payload : ChangeAttendanceType) => {
        try {
            if(!attendance) throw new Error("Error in client side")
            const token = await getToken();
            const res =  await fetch(`/api/assistant/attendance/update`,{
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                method : "PUT",
                body : JSON.stringify(payload)
            })
            
            
            const data = await res.json()
            
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            setAttendance((prevAttendance) =>
                prevAttendance.map((member) =>
                    member.userId === payload.userId ? { ...member, status: payload.status } : member
                )
            );
        } catch (error : any) {
            toast({
                title : "Cannot Change Attendance",
                description : error.message,
                variant : "destructive"
            })
        }
    }

    const handleMarkFinished = async () =>{
        try {
            setLoading({...loading, markFinish:true})
            if(!schedule) throw new Error("Error in Client Side")
            const token = await getToken();
            const res =  await fetch(`/api/assistant/schedule/mark-finished`,{
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                method : "POST",
                body : JSON.stringify({scheduleId : schedule.id})
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data.error)
            refreshCache('/')
            toast({
                title : "Practicum Finished",
                description : data.message,
                variant : "success"
            })
            setOpen(false)
        } catch (error:any) {
            toast({
                title : "Failed to finished practicum",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading({...loading, markFinish : false})
        }
    }

    return (
        schedule &&
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attendance Check</DialogTitle>
                    <DialogDescription>Group {schedule.group}</DialogDescription>
                    <DialogDescription className={getTextColorScheduleStatus(schedule.schedule.status)} >{schedule.schedule.status}</DialogDescription>
                </DialogHeader>
                    {loading.getList ?
                        <div className="flex justify-center w-full items-center">
                            <Loader2Icon className="size-4 animate-spin text-center"/>    
                        </div>
                        :
                    <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                            <TableHead className="text-center">NRP</TableHead>
                            <TableHead className="text-center">Name</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            attendance.length >0 &&
                            attendance.map((member,idx) =>(
                                <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell>{member.nrp}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell className="space-x-1">
                                    <Button 
                                        variant={'outline'} 
                                        size={"sm"} 
                                        className={`${member.status === 'HADIR' ? "bg-green-500 hover:bg-green-600" :""} rounded-full`}
                                        onClick={()=> handleChangeAttencance({
                                                scheduleId : member.scheduleId,
                                                status : "HADIR",
                                                userId : member.userId
                                            })}
                                        >
                                        H
                                    </Button>
                                    <Button 
                                        variant={'outline'} 
                                        size={"sm"} 
                                        className={`${member.status === 'SAKIT' ? "bg-yellow-500 hover:bg-yellow-600" :""} rounded-full`}
                                        onClick={()=> handleChangeAttencance({
                                                scheduleId : member.scheduleId,
                                                status : "SAKIT",
                                                userId : member.userId
                                            })}
                                        >
                                        S
                                    </Button>
                                    <Button 
                                        variant={'outline'} 
                                        size={"sm"} 
                                        className={`${member.status === 'IZIN' ? "bg-orange-500 hover:bg-orange-600" :""} rounded-full`}
                                        onClick={()=> handleChangeAttencance({
                                                scheduleId : member.scheduleId,
                                                status : "IZIN",
                                                userId : member.userId
                                            })}
                                        >
                                        I
                                    </Button>
                                    <Button 
                                        variant={'outline'} 
                                        size={"sm"} 
                                        className={`${member.status === 'TIDAK_HADIR' ? "bg-red-500 hover:bg-red-600" :""} rounded-full`}
                                        onClick={()=> handleChangeAttencance({
                                                scheduleId : member.scheduleId,
                                                status : "TIDAK_HADIR",
                                                userId : member.userId
                                            })}
                                        >
                                        A
                                    </Button>
                                </TableCell>
                            </TableRow>
                            )
                        )
                      }
                    </TableBody>
                </Table>
            }
            <div className="flex flex-row justify-end items-center gap-4 px-2 mt-2">
               <Button variant={"outline"} className="flex flex-row gap-2" onClick={()=>setOpen(false)}>
                    <X className="size-4"/>
                    Close 
               </Button>
                {   ['UNSCHEDULED', 'SCHEDULED'].includes(schedule.schedule.status) &&
                   <Button variant={"default"} className="flex hover:bg-green-600 bg-green-500 flex-row gap-2" onClick={handleMarkFinished}>
                    { loading.markFinish?
                        <Loader2Icon className="animate-spin size-4"/>
                        :
                        <>
                        <CheckIcon className="size-4"/>
                        Finish
                        </>
                    }
               </Button> 
                    } 
            </div>
            </DialogContent>
        </Dialog>
    )
}