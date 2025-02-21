'use server';

import { revalidatePath } from "next/cache";
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

type AddUserType = {
    nrp: string;
    name: string;
    role: string;
    password: string;
}
export const addUser = async(input:AddUserType)=>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/register`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify(input)
        })
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath('/')
        return data
              
        } catch (error : any) {
           throw new Error(error.message)
        }
    }

// create modul practicum

export const createModul = async (payload : {title : string, description : string}) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/practicum`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify(payload)
        })
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath('/')
        return data.title
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const editModul = async (payload : { id : number, title : string, description : string}) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/practicum`, {
            method : "PUT",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify(payload)
        })
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        
        revalidatePath('/')
        return data
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const deleteModul = async (id : number) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/practicum`, {
            method : "DELETE",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify({id})
        })
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error)
        revalidatePath('/')
        return data
        
    } catch (error:any) {
        throw new Error(error.message)
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

export const getAssistant = async () : Promise<getModulReturn> =>{
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
    | { success: true; data: getPracticanGroup[] } // Successful response
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
    
    export const createGroupPractican = async (payload : {kelompok : number, member_ids : string[]}) =>{
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.URL_BE}/admin/groups`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : token,
                },
                body : JSON.stringify(payload)
            })
            const data = await res.json();
            
            if(!res.ok) throw new Error(data.error)
                
                revalidatePath('/')
                return data
                
            } catch (error:any) {
                throw new Error(error.message)
            }
        }
        
        export const editGroupPractican = async (payload : { id : string, name : number, member_ids : string[]}) =>{
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.URL_BE}/admin/groups`, {
                    method : "PUT",
                    headers : {
                        "Content-Type" : "application/json",
                        "Authorization" : token,
                    },
                    body : JSON.stringify(payload)
                })
                const data = await res.json();
                
                if(!res.ok) throw new Error(data.error)
                    
                    revalidatePath('/')
                    return data
                    
                } catch (error:any) {
                    throw new Error(error.message)
                }
            }
            
type getAllAssistantReturn =
    | { success: true; data: getAllAssistant[] } // Successful response
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
        console.log(data)
        if(!res.ok) throw new Error(data.error)
        
        return data
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}

