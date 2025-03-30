'use server'

import { getToken } from "./auth.action";

type getAnnouncementType =
    | { success: true; data: AllAnnouncementType[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getAnnouncment = async() : Promise<getAnnouncementType>=>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/announcement`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "GET",
        })
        const data = await res.json();
        if(!res.ok) throw data
        return {
            success : true,
            data 
        }

    } catch (error:any) {
       return {
        success : false,
        data : error
       }
    }
}