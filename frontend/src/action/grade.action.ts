'use server'

import { getDecodeToken, getToken } from "./auth.action";

 type getGradeUserReturn  =
     | {
         success: true;
         role: 'PRAKTIKAN';
         data: AllGradePractican[]|null;
     }
     | {
         success: true;
         role: 'ASISTEN';
         data: AllGradeAslab[]|null;
     }
     | {
         success: false;
         data: RejectPromiseType;
     };
 
 export const getGradeUser  = async (): Promise<getGradeUserReturn> => {
     try {
         const [token, decodeToken] = await Promise.all([getToken(), getDecodeToken()]);
         
         if (!decodeToken.success) throw new Error("Error in decode token");
 
         const res = await fetch(`${process.env.URL_BE}/grade`, {
             headers: {
                 "Content-Type": "application/json",
                 "Authorization": token,
             },
             method: "GET"
         });
 
         const data = await res.json();
 
         if (!res.ok) throw data;
 
         const role = decodeToken.data.role as 'ASISTEN' | 'PRAKTIKAN';
         
         return {
             success: true,
             role,
             data: data, 
         };
 
     } catch (error: any) {
         return {
             success: false,
             data: error,
         };
     }
 };

 export const getDetailScore = async(gradeId : number)=>{
    try {
        
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/grade/${gradeId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            method: "GET"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data
    } catch (error:any) {
        throw new Error (error.message)
    }
 } 