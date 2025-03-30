'use server'

import { getToken } from "./auth.action";

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