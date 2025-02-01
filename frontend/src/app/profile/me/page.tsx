import EditProfileTabs from "@/components/editprofile/editprofile-tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage(){
    return (
        <div className="w-full flex flex-col md:h-[calc(100vh-6.5rem)]">
            <EditProfileTabs/>
            <div className="w-full mt-auto ">
                <Button variant={"ghost"} asChild>
                    <Link href={"/dashboard"} className="mt-4">
                        <ArrowLeft className="size-4"/>
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}