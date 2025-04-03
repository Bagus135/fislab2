import { getToken } from "@/action/auth.action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Check, Loader2Icon, X } from "lucide-react";
import { RefObject, useEffect, useState } from "react";

type Props = {
    assistant : AssistantStatus|null,
    btnRef: RefObject<HTMLButtonElement | null>
}

export default function AslabMonitoringModal({assistant, btnRef}: Props){
    const [status, setStatus] = useState<AssistantStatusDetail | null>(null);
    const [loading , setLoading] = useState(false)
    const [error, setError] = useState("")
    useEffect(()=>{
        const getStatusAslab = async () => {
            try{
                if(!assistant) throw new Error("Error in client side")
                setLoading(true)
                const token = await getToken()  
                const res = await fetch(`/api/admin/grade/progress/${assistant.id}`, {
                    method : 'GET',
                    headers : {
                        "Authorization" : token
                    }
                });
                const data =  await res.json()
                if(!res.ok) throw new Error('Failed to fetching data');
                setStatus(data)
            } catch (err : any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        getStatusAslab();
    }, [assistant])

    return (
        <Dialog>
            <DialogTrigger  className="hidden" ref={btnRef}/>
            <DialogContent>
                <DialogHeader className="hidden">
                    <DialogTitle/>
                    <DialogDescription/>
                </DialogHeader>
            {
                loading ?
                    <div className="flex justify-center w-full ">
                        <Loader2Icon className="size-6 animate-spin"/>
                    </div>
                    :
                    !status ?
                    
                    <div className="flex justify-center w-full ">
                        <p className="text-center">{error}</p>
                    </div>
                    :
                    <>
                        <DialogHeader className="space-y-1">
                            <DialogTitle>{status.assistant.name}</DialogTitle>
                            <DialogDescription>{assistant?.code}</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-1">
                                <div  className="flex flex-row justify-between">
                                    <p className="font-bold">Total</p>
                                    <p className="font-bold">{status.progress}</p>
                                </div>
                            {Object.entries(status.groups).map(([key, val], idx)=>(
                                <div key={idx} className="flex flex-row justify-between">
                                    <p>Groups {key}</p>
                                    {
                                        val ?
                                        <Check className="text-green-500 size-4"/>
                                            :
                                        <X className="text-red-500 size-4"/>
                                    }
                                </div>
                            ))
                        }
                        </div>
                    </>
            }
            </DialogContent>
        </Dialog>
    )
}