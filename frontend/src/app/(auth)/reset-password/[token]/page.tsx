// app/reset-password/[token]/page.tsx

import PasswordResetForm from "@/components/auth/reset-password/password-form";

type Props = {
    params: Promise<{ token: string }>
  }

export default async function ResetPasswordPage({ params }: Props) {
  const {token} = await params;
 
  return (
    <div className="w-full flex justify-center items-center  h-[calc(100vh-4.5rem)]">
      <PasswordResetForm emailToken={token}/>
    </div>
  );
}