'use server'

import { cookies } from "next/headers";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export const setCookies= async (token : string) =>{
    try {
        (await cookies()).set('token', token , {
            maxAge :  1 * 24* 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : true,
        } )
    } catch (error : any) {
        throw new Error(error.message)
    }
};

declare interface decodedJWT extends JwtPayload {
    id : string,
    nrp : string,
    role : string,
}

export const getToken = async () =>{
   const token = (await cookies()).get('token')?.value
   if(!token) return ""
   return token
}

export const getDecodeToken = async () =>{
    try {
        const token = (await cookies()).get('token')?.value;
        if(!token) throw new Error('Token not found');

        const decodedJWT =  jwt.verify(token, process.env.JWT_SECRET!) as decodedJWT
        return decodedJWT
    } catch (error: any) {
        throw {
            code : "Unauthorized",
            message : error.message
        };
    }
};

export const removeCookies = async () =>{
    (await cookies()).delete('token');
    revalidatePath('/')
    redirect("/login")
}

type UpdatePassType = {
    old_password : string, 
    new_password : string
    confirm_new_password : string,
}

export const updatePass = async(payload : UpdatePassType)=>{
     try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/change-password`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "PUT",
            body : JSON.stringify(payload)
        })
        const data = await res.json();
       
        if(!res.ok) throw new Error(data.error)
        revalidatePath('/')
        return {
            message : data.message
        }
    } catch (error : any) {
        throw new Error(error.message)
    }

}