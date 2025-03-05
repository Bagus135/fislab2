import { checkToken, getToken } from "@/action/auth.action";
import SideBar from "@/components/sidebar";
import NotFound from "./not-found";

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const token = await getToken()
    
    if(!token.trim()) return NotFound({code : '401', message : "Not Authorized"})
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