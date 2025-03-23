import {  checkToken } from "@/action/auth.action";
import { redirect } from "next/navigation";

export default async function LoginLayout ({children} : Readonly<{children : React.ReactNode}>) {
      try {
           await checkToken()
        } catch (error:any) {
            return (
                <>
                {children}
                </>
            )
        }
        redirect('/dashboard')
    }