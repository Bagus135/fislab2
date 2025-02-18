'use server'

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export const loginAction= async (token : string) =>{
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

export const getToken = async () =>{
    try {
        console.log('hi');
        
        const token = (await cookies()).get('token')?.value;
        if(!token) throw new Error('Token not found');

        const decodedJWT =  jwt.verify(token, process.env.JWT_SECRET!) 
        console.log(decodedJWT)
        return decodedJWT
    } catch (error: any) {
        throw new Error(error.message);
    }
};
