import { CheckCircle, Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { CardContent, CardFooter } from "../ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FormEvent, ReactNode, useState } from "react";
import { verifyEmailCode } from "@/action/profile.action";
import { useToast } from "@/hooks/use-toast";

type PropsType = {
    email:string,
    children : ReactNode
}

export default function EmailVerifyDialog ({email, children}: PropsType) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const {toast} = useToast()
    const handleSubmit = async (e : FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        e.stopPropagation();
        try {
            setLoading(true)
            const res = await verifyEmailCode({email , code : input});
             toast({
                title : `The Email is successfully verified`,
                description : res.message,
                variant : "success"
             })
            } catch (error:any) {
                toast({
                   title : `The email is failed to verify`,
                   description : error.message,
                   variant : "destructive"
                })
            } finally {
                setLoading(false)
            }
        };

 return (
    <Dialog>
        <DialogTrigger asChild>
           {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify Email</DialogTitle>
                <DialogDescription>{email}</DialogDescription>
            </DialogHeader>
            <form className="p-0 m-0" noValidate onSubmit={handleSubmit}>
                        <CardContent className="flex justify-center my-2">
                            <InputOTP maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={input}
                                onChange={(val)=>setInput(val)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0}/>
                                    <InputOTPSlot index={1}/>
                                    <InputOTPSlot index={2}/>
                                    <InputOTPSlot index={3}/>
                                    <InputOTPSlot index={4}/>
                                    <InputOTPSlot index={5}/>
                                </InputOTPGroup>
                            </InputOTP>
                        </CardContent>
                        <CardFooter  className="flex justify-end">
                            <Button  variant={"default"} type="submit">
                                { loading ? 
                                <Loader2Icon className="animate-spin size-4"/>
                                :
                                "Submit"
                                }
                            </Button>
                        </CardFooter>
                    </form>
        </DialogContent>
    </Dialog>
 )
}