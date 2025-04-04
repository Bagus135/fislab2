import EmailVerifyForm from "@/components/auth/reset-password/email-verify";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fislab | Forgot Password",
    description: "Web Fisika Laboratory Forgot Password Page",
  };
  

export default function ResetPassPage (){
    return (
        <div className="w-full flex justify-center items-center  h-[calc(100vh-4.5rem)]">
            <EmailVerifyForm/>
        </div>
    )
}
