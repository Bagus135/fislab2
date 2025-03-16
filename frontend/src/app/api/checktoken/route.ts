'use server'; 
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req : Request) {
    try {
        const token = req.headers.get('Authorization');
        if (!token) {
            throw new Error("No token found");
        }
        // Validate the token by making a request to the backend
        const res = await fetch(`${process.env.URL_BE}/profile/me/name`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            method: "GET",
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error);
        }

        // Token is valid
        return NextResponse.json({ message: 'Token is valid and endpoint logic executed',  }, { status: 200 });
    } catch (error: any) {
        
        if (error.message === "invalid session" || error.message === "invalid token") {
            const response = NextResponse.json({ message: 'Invalid Session' }, { status: 401 });

            // Manually set the Set-Cookie header to delete the token cookie
            response.headers.set(
                'set-cookie',
                'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=strict'
            );
    
            return response;
        }

        // Return an error response
        return NextResponse.json({ message: 'Unauthorized'}, { status: 401 });
    }
}

export async function DELETE (){
    (await cookies()).delete('token')
}