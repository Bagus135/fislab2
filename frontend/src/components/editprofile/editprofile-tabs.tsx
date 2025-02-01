import { ContactRound, Lock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function EditProfileTabs(){
    return (
    <Card className="max-w-[800px] w-full  mx-auto">
        <Tabs defaultValue="profile" className="w-full ">
            <TabsList className="w-full justify-around  border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                    value="profile"
                    className="w-full flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <User className="size-4"/>
                        Profile
                </TabsTrigger>
                <TabsTrigger
                    value="contact"
                    className="flex w-full items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <ContactRound className="size-4"/>
                        Contact
                </TabsTrigger>
                <TabsTrigger
                    value="password"
                    className="flex w-full items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <Lock className="size-4"/>
                        Password
                </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
                    <form>
                        <CardContent className="flex flex-col gap-6 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="nickname" className="font-bold tracking-wide text-base">Nickname</Label>
                                <Input id="nickname" placeholder="Nickname" className="w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="bio" className="font-bold tracking-wide text-base">Bio</Label>
                                <Textarea className="w-3/4" placeholder="Tell me about yourself" id="bio"/>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Button type="reset" variant={"outline"} className="w-1/5">Reset</Button>
                                <Button type="submit" className="w-1/5">Save</Button>
                            </div>
                        </CardContent>
                    </form>
            </TabsContent>
            <TabsContent value="contact">
                    <form>
                        <CardContent className="flex flex-col gap-6 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="Email" className="font-bold tracking-wide text-base">Email</Label>
                                <Input id="Email" placeholder="Email" className="w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="Whatsapp" className="font-bold tracking-wide text-base">Whatsapp</Label>
                                <Input id="Whatsapp" placeholder="+62000000000" className="w-3/4"/>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Button type="reset" variant={"outline"} className="w-1/5">Reset</Button>
                                <Button type="submit" className="w-1/5">Save</Button>
                            </div>
                        </CardContent>
                    </form>
            </TabsContent>
            <TabsContent value="password">
                    <form>
                        <CardContent className="flex flex-col gap-6 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="prevpass" className="font-bold tracking-wide text-base">Previous Password</Label>
                                <Input id="prevpass" placeholder="********" className="w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="newpass" className="font-bold tracking-wide text-base">New Password</Label>
                                <Input id="newpass" placeholder="********" className="w-3/4"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="confirmnewpass" className="font-bold tracking-wide text-base">Confirm New Password</Label>
                                <Input id="confirmnewpass" placeholder="********" className="w-3/4"/>
                            </div>
                            <div className="w-full flex flex-row gap-4 justify-end mt-8">
                                <Button type="reset" variant={"outline"} className="w-1/5">Reset</Button>
                                <Button type="submit" className="w-1/5">Save</Button>
                            </div>
                        </CardContent>
                    </form>
            </TabsContent>
        </Tabs>
    </Card>
    )
}