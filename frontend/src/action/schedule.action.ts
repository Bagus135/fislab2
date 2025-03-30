'use server';
import { getDecodeToken, getToken } from "./auth.action";


type getScheduleUserReturn<T extends 'PRAKTIKAN' | 'ASISTEN'> =
    T extends 'PRAKTIKAN'
        ? {
            success: true;
            role: 'PRAKTIKAN';
            data: getPracticanSchedules[]|null;
        }
        : T extends 'ASISTEN'
        ? {
            success: true;
            role: 'ASISTEN';
            data: getAssistantSchedules[]|null;
        }
        : {
            success: false;
            data: RejectPromiseType;
        };;

        export const getScheduleUser  = async (): Promise<getScheduleUserReturn<'PRAKTIKAN' | 'ASISTEN'>> => {
            try {
                const [token, decodeToken] = await Promise.all([getToken(), getDecodeToken()]);
        
                if (!decodeToken.success) throw new Error("Error in decode token");
        
                const res = await fetch(`${process.env.URL_BE}/schedules/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token,
                    },
                    method: "GET"
                });
        
                const data = await res.json();
        
                if (!res.ok) throw data;
                const {role} = decodeToken.data
                // Mengembalikan tipe yang sesuai berdasarkan role
                if (role === 'PRAKTIKAN') {
                    return {
                        success: true,
                        role,
                        data: data as getPracticanSchedules[], // Pastikan data sesuai dengan tipe
                    } as getScheduleUserReturn<'PRAKTIKAN'>; // Casting ke tipe yang sesuai
                } else if (role === 'ASISTEN') {
                    return {
                        success: true,
                        role,
                        data: data as getAssistantSchedules[], // Pastikan data sesuai dengan tipe
                    } as getScheduleUserReturn<'ASISTEN'>; // Casting ke tipe yang sesuai
                } else {
                    throw new Error("Invalid role");
                }
        
            } catch (error: any) {
                return {
                    success: false,
                    data: error,
                } as getScheduleUserReturn<never>; // Mengembalikan tipe error
            }
        };

type editScheduleAslabType = {
    practicumCode: string,
    group: number,
    date: string,
    startTime: string,
    week: number
  }


type getCheckScheduleReturn =
    | { success: true; data: CheckScheduleType[] } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response

export const getCheckSchedule  = async (): Promise<getCheckScheduleReturn > => {
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/schedules/check`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) throw data;

        return {
            success: true,
            data: data, 
        };

    } catch (error: any) {
        return {
            success: false,
            data: error,
        };
    }
};

type getNearestScheduleReturn =
    | { success: true; data: getNearestSchedule } // Successful response
    | { success: false; data: RejectPromiseType }; // Error response
export const getNearestSchedule = async () : Promise<getNearestScheduleReturn> =>{
    try {
        const token = await getToken();
        const res = await fetch(`${process.env.URL_BE}/schedules/nearest`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            method: "GET"
        });

        const data = await res.json();

        if (!res.ok) throw data;

        return {
            success: true,
            data: data, 
        };

    } catch (error: any) {
        return {
            success: false,
            data: error,
        };
    }
}