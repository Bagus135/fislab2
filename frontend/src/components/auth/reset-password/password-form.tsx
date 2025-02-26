'use client'

import { resetPass, setCookies } from "@/action/auth.action" // Assuming you still need this for setting cookies
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon, LockIcon } from "lucide-react" // Import LockIcon for password input
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function PasswordResetForm({token} : {token :string}) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState({
        new_password: '',
        confirm_password: '',
    })

    const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true)
            const res = await resetPass({...input, token})
            toast({
                title: "Password Reset Successful",
                description: "Your password has been reset successfully.",
                variant: "success"
            })
            router.push("/login") 

        } catch (error: any) {
            toast({
                title: 'Failed to reset password',
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-[400px] w-[calc(100vw-2rem)]">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>Enter your new password</CardDescription>
            </CardHeader>
            <CardContent>
                <form noValidate onSubmit={handlePasswordReset}>
                    <div className="grid w-full items-center gap-4 mt-2">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="new_password" className="font-medium">New Password</Label>
                            <div className="relative">
                                <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                    <LockIcon className="size-4" />
                                </span>
                                <Input
                                    id="new_password"
                                    type="password"
                                    placeholder="Enter new password"
                                    className="peer invalid:border-red-500 pl-12"
                                    pattern="^.{8,}$"
                                    value={input.new_password}
                                    onChange={(e) => setInput({ ...input, new_password: e.target.value })}
                                    required
                                />
                                <p className="peer-invalid:text-red-500 hidden peer-invalid:block text-xs">minimum 8 character</p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="confirm_password" className="font-medium">Confirm Password</Label>
                            <div className="relative">
                                <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                    <LockIcon className="size-4" />
                                </span>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="peer pl-12"
                                    value={input.confirm_password}
                                    onChange={(e) => setInput({ ...input, confirm_password: e.target.value })}
                                    required
                                />
                                {input.new_password !== input.confirm_password && (
                                    <p className="text-red-500 text-xs">Passwords do not match</p>
                                )}
                            </div>
                        </div>
                        <Button
                            disabled={ input.new_password !== input.confirm_password || input.new_password.length < 8 || loading} // Disable if passwords do not match
                            className="w-full text-lg font-bold mt-2">
                            {loading ?
                                <Loader2Icon className="size-4 animate-spin" />
                                :
                                "Submit"
                            }
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}