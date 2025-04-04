import { checkToken, getDecodeToken } from "@/action/auth.action";
import {  AdminSidebarDesktop } from "@/components/admin/admin-sidebar";
import React from "react";
import NotFound from "./not-found";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fislab | Admin",
    description: "Physics Laboratory Web Admin Page",
  };
  

export default async function AdminLayout ({children} : Readonly<{children : React.ReactNode}>) {
    try {
        await checkToken()
        const res = await getDecodeToken()
        if(!res.success) throw new Error("Unauthrized")
        if(!["ADMIN", "SUPER_ADMIN"].includes(res.data.role)) return NotFound({code : '401', message:"Only Admin is permitted" })
        
    } catch (error:any) {
        return NotFound({message : error.message || 'Unauthorized', code : error.code || "401"})
    } 
        
    return (
         <div  className="w-full">
            <div className="border-r h-[calc(100vh-4rem)] md:flex md:w-16 lg:w-44 fixed hidden">
                <AdminSidebarDesktop/>
            </div>
            <div className="md:ml-16 p-2 lg:ml-44 lg:px-2">
                {children}
            </div>
         </div>
    )
}