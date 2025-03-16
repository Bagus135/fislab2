'use server'

import { checkToken, getDecodeToken } from "@/action/auth.action";
import { AdminTabsListDesktop, AdminTabsListMobile } from "@/components/admin/admin-tabslist";
import { Tabs } from "@/components/ui/tabs";
import React from "react";
import NotFound from "./not-found";

export default async function AdminLayout ({children} : Readonly<{children : React.ReactNode}>) {
    try {
        const token = await checkToken()
        const res = await getDecodeToken()
        if(!res.success) return NotFound({code : res.data.code, message:res.data.message })
        if(!["ADMIN", "SUPER_ADMIN"].includes(res.data.role)) return NotFound({code : '401', message:"Only Admin is permitted" })
        
    } catch (error:any) {
        return NotFound({message : error.message || 'Unauthorized', code : error.code || "401"})
    } 
        
    return (
         <Tabs defaultValue="grouping" className="w-full">
            <AdminTabsListMobile/>
            <div className="border-r h-[calc(100vh-4rem)] md:flex md:w-16 lg:w-44 fixed hidden">
                <AdminTabsListDesktop/>
            </div>
            <div className="md:ml-16 p-2 lg:ml-44 lg:px-2">
                {children}
            </div>
         </Tabs>
    )
}