'use server'

import { revalidatePath } from "next/cache";
import { getToken } from "./auth.action";


type getSelfProfileReturn =
    | { success: true; data: GetSelfProfileType } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getSelfProfile = async() : Promise<getSelfProfileReturn> => {
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/profile/me`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "GET"
        })
        const data = await res.json();
       
        if(!res.ok) throw data
        
        return {
            success : true,
            data : data
        }
        
    } catch (error : any) {
        return {
            success : false,
            data : error
        }
    }
}

type UpdateSelfProfileType = {
    name : string, 
    phone : string, 
    email : string, 
    about : string
}

export const UpdateSelfProfile = async(payload : UpdateSelfProfileType)=> {
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/profile`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "PUT",
            body : JSON.stringify(payload)
        })
        
        if(!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
        
        revalidatePath('/')
        return {
            message : "Profile Updated"
        }
        
    } catch (error : any) {
        throw new Error(error.message)
    }
}

export const verifyEmail = async (email : string)=>{
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/send-verification-code`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify({email})
        })
        
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath('/')
        return data
        
    } catch (error : any) {
        throw new Error(error.message)
    }
}

export const verifyEmailCode = async (payload : {email : string, code : string})=>{
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/verify-email`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
            body : JSON.stringify(payload)
        })
        
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath('/')
        return data
        
    } catch (error : any) {
        throw new Error(error.message)
    }
}