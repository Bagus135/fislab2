'use client'

import { CheckCircle, ContactRound, Loader2Icon, Lock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UpdateSelfProfile, verifyEmail } from "@/action/profile.action";
import { FormEvent, useRef, useState } from "react";
import { updatePass } from "@/action/auth.action";
import EmailVerifyDialog from "./emailverify-dialog";
import { formatPhoneNumber } from "@/utilts/formatphone";

export default function EditProfileTabs({profile} : {profile : GetSelfProfileType}){
    const [profileInput, setProfileInput] = useState({
        name : profile.name, 
        phone : profile.phone, 
        email : profile.email, 
        about : profile.about,
    })
    const [passInput, setPassInput] = useState({
            old_password : '', 
            new_password : '',
            confirm_new_password : '',
    })
    const [loading, setLoading] = useState({
        profile : false,
        pass : false,
        verifyemail : false
    })
    
    const btnRef = useRef<HTMLButtonElement | null>(null);

    const {toast} = useToast()

    const handleUpdateProfile = async(e : FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setLoading({...loading, profile : true}) 
            const res = await UpdateSelfProfile({...profileInput, phone : formatPhoneNumber(profileInput.phone) })
            toast({
                title : "Success Update Profile",
                description : res.message,
                variant : "success"
            })
        } catch (error:any) {
            toast({
                title : "Failed to Update Profile",
                description : error.message,
                variant : "destructive"
            })
        } finally{
            setLoading({...loading, profile : false}) 
            
        }
    }
    
    const handleUpdatePass = async(e : FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setLoading({...loading, pass : true}) 
            const res = await updatePass(passInput)
            toast({
                title : "Success Update Password",
                description : res.message,
                variant : "success"
            })
        } catch (error:any) {
            toast({
                title : "Failed to Update Password",
                description : error.message,
                variant : "destructive"
            })
        } finally {
            setLoading({...loading, pass : false}) 
        }
    }

    const handleVerifyEmail = async () =>{
        try {
            setLoading({...loading, verifyemail : true})
            const res = await verifyEmail(profileInput.email)
            toast({
                title : ` Verify code is send to ${profileInput.email} `,
                description : res.message,
                variant : "success"
            })
            if(btnRef.current){
                btnRef.current.click()
            }
        } catch (error:any) {
            toast({
                title : `Failed to send code to ${profileInput.email}`,
                description : profileInput.email,
                variant : "destructive"
            })
        } finally{
            setLoading({...loading, verifyemail : false})
        }
    }

    return (
    <Card className="max-w-[800px] w-full  mx-auto">
        <Tabs defaultValue="profile" className="w-full ">
            <TabsList className="w-full justify-around  border-b rounded-none h-auto p-0 bg-transparent ">
                <TabsTrigger
                    value="profile"
                    className=" p-2 text-xs md:text-sm w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <User className="size-4"/>
                        Profile
                </TabsTrigger>
                <TabsTrigger
                    value="password"
                    className="p-2 text-xs md:text-sm flex w-full items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <Lock className="size-4"/>
                        Password
                </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
                    <form noValidate onSubmit={handleUpdateProfile}>
                        <CardContent className="flex flex-col gap-6 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="nickname" className="font-bold tracking-wide text-sm ">Fullname</Label>
                                <Input 
                                    id="nickname" 
                                    placeholder="Nickname" 
                                    className="w-3/4"
                                    value={profileInput.name}
                                    onChange={(e)=>setProfileInput({...profileInput, name : e.target.value})}
                                    />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="about" className="font-bold tracking-wide text-sm ">About</Label>
                                <Textarea className="w-3/4" 
                                            placeholder="Tell me about yourself" 
                                            id="about"
                                            value={profileInput.about}
                                            onChange={(e)=>setProfileInput({...profileInput, about : e.target.value}) }
                                            />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="Email" className="font-bold tracking-wide text-sm ">Email</Label>
                                <div className="flex flex-row gap-2">
                                    <Input  id="Email"
                                            placeholder="Email" 
                                            className="w-3/4"
                                            value={profileInput.email}
                                            onChange={(e)=> setProfileInput({...profileInput, email : e.target.value})}
                                    />
                                        <Button 
                                            type="button"
                                            disabled={loading.verifyemail || profileInput.email !== profile.email || !profile.email.trim()}
                                            className="flex flex-row gap-2" 
                                            onClick={handleVerifyEmail}>
                                            {loading.verifyemail ?
                                                <Loader2Icon className="size-4 animate-spin"/>
                                                :
                                                <>
                                                    <CheckCircle className="size-4"/>
                                                    Verify
                                                </>
                                            }
                                        </Button>
                                    <EmailVerifyDialog email={profileInput.email}>
                                        <Button className="hidden" ref={btnRef}/>
                                    </EmailVerifyDialog>
                                </div>
                                    <span className={profile.email_verified ? `hidden`: `text-xs text-red-500 block`}>Email not verified</span>
                                    <span className={profile.email === profileInput.email ? `hidden`: `text-xs text-red-500 block`}>Email does not match the profile.</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="Whatsapp" className="font-bold tracking-wide text-sm ">Whatsapp</Label>
                                <Input id="Whatsapp" 
                                        placeholder="+62000000000" 
                                        className="w-3/4"
                                        value={profileInput.phone}
                                        onChange={(e)=> setProfileInput({...profileInput, phone : e.target.value})}/>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Button type="reset" variant={"outline"} className="w-1/5" onClick={()=> setProfileInput({ email : "", name : "", about : "", phone : ""})}>
                                    Reset
                                </Button>
                                <Button type="submit" className="w-1/5" disabled={loading.profile || Object.values(profileInput).includes("")} >
                                    {
                                        loading.profile ?
                                        <Loader2Icon className="animate-spin size-4"/>
                                            :
                                        "Save"
                                    }
                                </Button>
                            </div>
                        </CardContent>
                    </form>
            </TabsContent>
            <TabsContent value="password">
                    <form noValidate onSubmit={handleUpdatePass}>
                        <CardContent className="flex flex-col gap-6 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="prevpass" className="font-bold tracking-wide text-sm ">Previous Password</Label>
                                <Input id="prevpass" 
                                        placeholder="********" 
                                        type="password"
                                        className="w-3/4"
                                        value={passInput.old_password}
                                        onChange={(e)=>setPassInput({...passInput, old_password : e.target.value})}
                                        />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="newpass" className="font-bold tracking-wide text-sm ">New Password</Label>
                                <Input 
                                    id="newpass" 
                                    placeholder="********" 
                                    className="w-3/4"
                                    type="password"
                                    value={passInput.new_password}
                                    onChange={(e)=>setPassInput({...passInput, new_password : e.target.value})}/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="confirmnewpass" className="font-bold tracking-wide text-sm ">Confirm New Password</Label>
                                <Input 
                                    id="confirmnewpass" 
                                    placeholder="********" 
                                    className={`${passInput.confirm_new_password === passInput.new_password ? "" : "border-red-500"} w-3/4`}
                                    type="password"
                                    value={passInput.confirm_new_password}
                                    onChange={(e)=>setPassInput({...passInput, confirm_new_password : e.target.value})}/>
                                    <p className={passInput.confirm_new_password === passInput.new_password ? "hidden" : "text-red-500"}>Password not match</p>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Button 
                                    type="reset" 
                                    variant={"outline"} 
                                    className="w-1/5"
                                    onClick={()=> setPassInput({
                                        old_password : '', 
                                        new_password : '',
                                        confirm_new_password : '',
                                    })}>
                                    Reset
                                </Button>
                                <Button type="submit" className="w-1/5" disabled={loading.pass || passInput.confirm_new_password !== passInput.new_password|| Object.values(passInput).includes("")}>
                                {
                                        loading.pass ?
                                        <Loader2Icon className="animate-spin size-4"/>
                                            :
                                        "Save"
                                    }
                                </Button>
                            </div>
                        </CardContent>
                    </form>
            </TabsContent>
        </Tabs>
    </Card>
    )
}