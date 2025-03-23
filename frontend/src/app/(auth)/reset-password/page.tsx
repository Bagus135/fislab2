import EmailVerifyForm from "@/components/auth/reset-password/email-verify";

export default function ResetPassPage (){
    return (
        <div className="w-full flex justify-center items-center  h-[calc(100vh-4.5rem)]">
            <EmailVerifyForm/>
        </div>
    )
}
