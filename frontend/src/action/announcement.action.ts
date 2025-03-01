'use server'

import { revalidatePath } from "next/cache";
import { getToken } from "./auth.action";

export const createAnnouncement = async(payload : {title : string , content : string}) => {
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/announcement`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify(payload)
        })
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const editAnnouncement = async(payload : {id : number , title : string , content : string}) => {
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/announcement`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "PUT",
            body : JSON.stringify(payload)
        })
        
        if(!res.ok) throw new Error('Error When Updating Announcement')
        
        revalidatePath("/")
        return {
            message : "Announcement Updated",
        }

    } catch (error:any) {
        throw new Error(error.message)
    }
}
export const deleteAnnouncement = async(id : number) => {
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/announcement`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "DELETE",
            body : JSON.stringify({id})
        })
        
        const data = await res.json()
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath("/")
        return data

    } catch (error:any) {
        throw new Error(error.message)
    }
}

type getAnnouncementType =
    | { success: true; data: AllAnnouncementType[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getAnnouncment = async() : Promise<getAnnouncementType>=>{
    try {
        console.log('RENDER');
        
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