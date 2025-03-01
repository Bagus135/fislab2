'use server'

import { revalidatePath } from "next/cache";
import { getToken } from "./auth.action";

export const generateCode = async(scheduleId : number) => {
    try {
        console.log(scheduleId);
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
        console.log(data);
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}