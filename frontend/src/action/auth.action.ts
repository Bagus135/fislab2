"use server"

import { cookies } from "next/headers";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { revalidatePath } from "next/cache";


export const setCookies= async (token : string) =>{
    try {
        (await cookies()).set('token', token , {
            maxAge :  12* 60 * 60,
            httpOnly : true,
            sameSite : "strict",
            secure : true,
        } )
    } catch (error : any) {
        throw new Error(error.message)
    }
};

type loginActiontype = {
     nrp :string,
    password :string
}

export const loginAction = async (payload : loginActiontype) => {
    try{ 
        const res = await fetch(`${process.env.URL_BE}/login`,{
        method : 'POST',
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(payload),
    })
    const data = await res.json();
    
    if(!res.ok) throw new Error(data.error)
        
        await setCookies(data.token);
        revalidatePath('/')
    } catch (error : any) {
        console.log(error.message);
        throw new Error(error.message)
    }
}


export declare interface decodedJWT extends JwtPayload {
    id : string,
    nrp : string,
    role : string,
}

export const getToken = async () =>{
   const token = (await cookies()).get('token')?.value
   if(!token) return ""
   return token
}

type decodedErrorToken = {
    code : "Unauthorized",
    message : string
}
type getDecodeTokenType =
    | { success: true; data: decodedJWT } // Successful response
    | { success: false; data: decodedErrorToken }; // Error response
export const getDecodeToken = async () : Promise<getDecodeTokenType> =>{
    try {
        const token = (await cookies()).get('token')?.value;
        if(!token) throw new Error('Token not found');
        await checkToken();
        const decodedJWT =  jwt.verify(token, process.env.JWT_SECRET!) as decodedJWT
        return {
            success : true,
            data : decodedJWT,
        }
    } catch (error: any) {

        return {
            success : false,
            data : {
                code : "Unauthorized",
                message : error.message
            }
        };
    }
};

export const removeCookies = async () =>{
    try {
        const token = await getToken();
        if(!token.trim()) throw new Error('Token is not found');

        (await cookies()).delete('token');
        const res = await fetch(`${process.env.URL_BE}/logout`,{
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            method : "POST",
        });
        if(!res.ok) throw new Error('Failed to logout')
        revalidatePath('/');
        
    } catch (error:any) {
        throw new Error(error.message);
    }
}


export const checkToken = async () => {
    try {
        const token = await getToken()
        const res = await fetch(`${process.env.URL_BE}/profile/me/name`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            method: "GET",
        });
        
        if (!res.ok) throw new Error('error');
        
        return true;
    } catch (error: any) {
        throw new Error ('error')
    }
};

export const  refreshCache = async (path : string) =>{
    revalidatePath(path)
}