'use server'

import { revalidatePath } from "next/cache";
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
         data: AllGradeAslab[];
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

 type InputGradeProps = {
    punctuality: number;
    preExam: number;
    oralTest: number;
    skillsAndAttitude: number;
    abstract: number;
    introduction: number;
    methodology: number;
    discussion: number;
    dataProcessing: number;
    conclusion: number;
    formatting: number;
    feedback: number;
};

type postInputGradeProps = InputGradeProps & {
    userId : string,
    scheduleId : number,
}

 export const postInputGrade = async(payload : postInputGradeProps)=> {
     try {
         const token = await getToken()
         const res =  await fetch(`${process.env.URL_BE}/assistant/grade`,{
             headers : {
                 "Content-Type" : "application/json",
                 "Authorization" : token,
             },
             method : "POST",
             body : JSON.stringify(payload)
         })
         
         const data = await res.json();
         if(!res.ok) {
             throw new Error(data.error);
         }
         
         revalidatePath('/')
         return data

     } catch (error : any) {
         throw new Error(error.message)
     }
 }
 export const updateInputGrade = async(payload : InputGradeProps, gradeId : number)=> {
     try {
         const token = await getToken()
         const res =  await fetch(`${process.env.URL_BE}/assistant/grade/update/${gradeId}`,{
             headers : {
                 "Content-Type" : "application/json",
                 "Authorization" : token,
             },
             method : "PUT",
             body : JSON.stringify(payload)
         })
         
         const data = await res.json();
         if(!res.ok) {
             throw new Error(data.error);
         }
         
         revalidatePath('/')
         return data

     } catch (error : any) {
         throw new Error(error.message)
     }
 }

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