'use client'

import { getTokenResetPass } from "@/action/auth.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2Icon, MailIcon } from "lucide-react" // Import MailIcon for email input
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function EmailVerifyForm() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState({
        email: '', 
    })

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true)
            const res = await getTokenResetPass(input)
            router.push("/reset-password/asasas")
            toast({
                title: "Token send to your email",
                description: res.message,
                variant: "success"
            })

        } catch (error: any) {
            toast({
                title: 'Failed to send token to your email',
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
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>Enter the verified email</CardDescription>
            </CardHeader>
            <CardContent>
                <form noValidate onSubmit={handleLogin}>
                    <div className="grid w-full items-center gap-4 mt-2">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="email" className="font-medium">Email</Label>
                            <div className="relative">
                                <span className="absolute p-1 pl-3 mt-1 left-0 flex items-center">
                                    <MailIcon className="size-4" />
                                </span>
                                <Input
                                    id="email"
                                    type="email" 
                                    placeholder="verifiedemail@gmail.com"
                                    className="peer invalid:border-red-500 pl-12"
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    value={input.email}
                                    onChange={(e) => setInput({ ...input, email: e.target.value })}
                                    required
                                    
                                />
                                <p className="peer-invalid:text-red-500 text-xs invisible peer-invalid:visible">email not valid</p>
                            </div>
                        </div>
                        <Button
                            disabled={!input.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) || loading} // Validate email format
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