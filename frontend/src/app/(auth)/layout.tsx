import {  checkToken } from "@/action/auth.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Fislab | Login",
    description: "Physics Laboratory Web Login Page",
  };
  

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