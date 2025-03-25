import { checkToken, getDecodeToken } from "@/action/auth.action";
import SideBar from "@/components/sidebar";
import NotFound from "./not-found";
import AdminPage from "../admin/page";

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    try {
        await checkToken()
        const res = await getDecodeToken()
        if(!res.success) throw new Error("Unauthrized")
        if(["ADMIN", "SUPER_ADMIN"].includes(res.data.role)) return <AdminPage/>
    } catch (error:any) {
      return <NotFound code="401" message="Unauthorized"/>
    }
    
    return ( 
    <>
       <div className="border-r shadow-sidebar-foreground h-[calc(100vh)] hidden md:flex md:w-16 lg:w-44 fixed">
            <SideBar/>
        </div>
        <div className="md:ml-16 p-2 lg:ml-44 w-full">
            {children}
        </div>
    </>
    )
}