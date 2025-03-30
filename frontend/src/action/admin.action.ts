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

export const deleteUser = async(id :string)=>{
    try {
        const token = await getToken();
        
        const res = await fetch(`${process.env.URL_BE}/admin/users/delete`, {
            method : "DELETE",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify({id})
        })
        const data = await res.json();
        if(!res.ok) throw new Error(data.token)
        
        revalidatePath('/')
        return data
              
        } catch (error : any) {
           throw new Error(error.message)
        }
    }

// create modul practicum
type CreateModulType = {
    code : string,
    title : string,
    description : string,
}

export const createModul = async (payload : CreateModulType) =>{
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
        return data
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const editModul = async (payload : CreateModulType) =>{
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

export const deleteModul = async (code : string) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/practicum`, {
            method : "DELETE",
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : token,
            },
            body : JSON.stringify({code})
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
    
    export const createGroupPractican = async (payload : {group : number, member_ids : string[]}) =>{
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
        
export const editGroupPractican = async (payload : { id : string, group : number, member_ids : string[]}) =>{
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
export const deleteGroupPractican = async (payload : { groupId : string}) =>{
    try {
        const token = await getToken();
        
        const res = await fetch(`${process.env.URL_BE}/admin/groups/delete`, {
            method : "DELETE",
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


export const connectAslabtoModul = async (payload : { practicumCode : string, assistantId : string, }) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/practicum`, {
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

type editAslabtoModulType = {
    oldPracticumCode:string,
    newPracticumCode:string,
    assistantId:string,
}

export const editAslabtoModul = async (payload : editAslabtoModulType) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/practicum/update`, {
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

export const removeAslabtoModul = async (payload : { practicumCode : string, assistantId : string, } ) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/practicum/remove`, {
            method : "DELETE",
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
    
    type cretaeAslabtoGroup = {
        practicumCode: string,
        groupId : string,
        assistantId : string,
        week : number
    }
    

export const connectAslabtoGroup = async (payload : cretaeAslabtoGroup) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/group`, {
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

type  editAslabtoGroupType = {
	scheduleId : number,
	assistantId :string,
	week : number
}
export const editAslabtoGroup = async (payload : editAslabtoGroupType) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/group`, {
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

type  deleteAslabtoGroupType = {
	groupId : string,
	assistantId :string,
}
export const deleteAslabtoGroup = async (payload : deleteAslabtoGroupType) =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/admin/assistant/group/remove`, {
            method : "DELETE",
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

