import { ContactRound, FileUser, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function EditProfileTabs(){
    return (
        <Tabs defaultValue="biodata" className="w-full">
            <TabsList className="w-full justify-around  border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                    value="biodata"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <FileUser className="size-4"/>
                        Biodata
                </TabsTrigger>
                <TabsTrigger
                    value="contact"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <ContactRound className="size-4"/>
                        Contact
                </TabsTrigger>
                <TabsTrigger
                    value="password"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-transparent px-6 font-semibold">
                        <Lock className="size-4"/>
                        Password
                </TabsTrigger>
            </TabsList>
            <TabsContent value="biodata">

            </TabsContent>
        </Tabs>
    )
}