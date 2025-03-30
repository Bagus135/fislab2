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

export const getTokenResetPass = async(payload: {email : string}) =>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/forgot-password`,{
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
        return {
            message : data.token
        }
    } catch (error : any) {
        throw new Error(error.message)
    }
}

type ResetPassProps = {
    token : string,
    new_password : string,
    confirm_password : string
}
export const resetPass = async(payload: ResetPassProps) =>{
    try {
        const token = await getToken();
        const res =  await fetch(`${process.env.URL_BE}/reset-password`,{
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
        return {
            message : data.token
        }
    } catch (error : any) {
        throw new Error(error.message)
    }
}


export const checkToken = async () => {
    try {
        const token = await getToken()
        const res = await fetch(`${process.env.URL_FE}/checktoken`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization' : token
            },
            method: "GET",
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error);
        }
        return true;
    } catch (error: any) {
        throw new Error ('error')
    }
};

export const  refreshCache = async () =>{
    revalidatePath("/")
}