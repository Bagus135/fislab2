import { AdminTabsListDesktop, AdminTabsListMobile } from "@/components/admin/admin-tabslist";
import { Tabs } from "@/components/ui/tabs";
import React from "react";

export default function AdminLayout ({children} : Readonly<{children : React.ReactNode}>) {
    return (
         <Tabs defaultValue="grouping" className="w-full">
            <AdminTabsListMobile/>
            <div className="border-r h-[calc(100vh-4rem)] md:flex md:w-16 lg:w-44 fixed hidden">
                <AdminTabsListDesktop/>
            </div>
            <div className="md:ml-16 p-2 lg:ml-44">
                {children}
            </div>
         </Tabs>
    )
}