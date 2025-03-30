'use server'

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

export const getName = async() =>{
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/profile/me/name`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "GET",
        });
        const data = await res.json()
        if(!res.ok) throw new Error(data.error)
        return data 
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const getProfilePic = async (id:string) =>{
    try {
        const token = await getToken()
        const res =  await fetch(`${process.env.URL_BE}/profile/picture/${id}`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "GET",
        });
        if(!res.ok) throw new Error('error')
        return  true 
    } catch (error:any) {
        return false
    }
}