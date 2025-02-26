import {  getToken } from "@/action/auth.action";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout ({children} : Readonly<{children : React.ReactNode}>) {
    const token = await getToken();
    if(!!token.trim()) redirect("/dashboard")
        
    return (
       <>
       {children}
       </>
    )
}