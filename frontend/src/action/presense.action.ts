'use server'

import { revalidatePath } from "next/cache";
import { getToken } from "./auth.action";

export const generateCode = async(scheduleId : number) => {
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/assistant/attendance/generate`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify({scheduleId})
        })
        
        
        const data = await res.json()
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}


type ChangeAttendanceType = {
    scheduleId: number,
    userId: string ,
    status: string
  }

  export const changeAttendance = async(payload : ChangeAttendanceType) => {
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/assistant/attendance/update`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "PUT",
            body : JSON.stringify(payload)
        })
        
        
        const data = await res.json()
        console.log(data);
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const submitAttendance = async(code : string, scheduleId : number) =>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/attendance/${scheduleId}`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify({code})
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error)
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const statAttendance = async() : Promise<statAttendanceType|null> =>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/attendance/summary`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "GET",
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error)
        return data
    
    } catch (error:any) {
        return null
    }
}
export const markfinished = async(scheduleId : number) =>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/assistant/schedule/mark-finished`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify({scheduleId})
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error)
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}