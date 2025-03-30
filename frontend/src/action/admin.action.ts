'use server';

import { getToken } from "./auth.action";

type GetAllUsersReturn =
    | { success: true; data: AllUserTypes[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getAllUsers  = async () : Promise<GetAllUsersReturn> => {
    const token = await getToken()
    try {
        const res =  await fetch(`${process.env.URL_BE}/admin/users`,{
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
            data : data.users
        }
        
    } catch (error : any) {
        return {
            success : false,
            data : error
        }
    }

}

type getModulReturn =
    | { success: true; data: getModul[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getModul = async () : Promise<getModulReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/practicum`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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

export const getAssistant = async () =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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
};

type getPracticanReturn =
    | { success: true; data: getPractican } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getPractican = async () : Promise<getPracticanReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/users/praktikan`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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

// Practican Group
type getPracticanGroupReturn =
    | { success: true; data: getPracticanGroup[]|null } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response
    
export const getPracticanGroup = async () : Promise<getPracticanGroupReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/groups`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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
    
type getAllAssistantReturn =
    | { success: true; data: getAllAssistant[]|null } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response
    export const getAllAssistant = async () : Promise<getAllAssistantReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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

type getAllScheduleReturn =
    | { success: true; data: AllScheduleAdmin[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getAllScheduleAdmin = async () : Promise<getAllScheduleReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/schedules`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
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

export const getAssistantStatus = async () : Promise<AssistantStatus[]> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/status`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
        })
        const data = await res.json();
        if(!res.ok) throw data.error
        return data
            
        } catch (error:any) {
            console.log(error);
            
            return []
        }
    }

type AllPracticanGradeType = {
    data : AllPracticanGrade
}

export const getAllPracticanGrade = async () : Promise<AllPracticanGradeType> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/grade/all`, {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
        })
        const data = await res.json();
        if(!res.ok) throw data.error
        return data

        } catch (error:any) {
            console.log(error);
            return {
                data : []
            }
        }
    }

