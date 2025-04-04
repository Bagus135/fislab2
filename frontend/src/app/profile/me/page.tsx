import { checkToken } from "@/action/auth.action";
import { getSelfProfile } from "@/action/profile.action";
import NotFound from "@/app/(user)/not-found";
import EditProfileTabs from "@/components/editprofile/editprofile-tabs";
import ProfilePreview from "@/components/editprofile/profile-preview";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fislab | Profile",
    description: "Physics Laboratory Web Users Profile Page",
  };
  
export default async function ProfilePage(){
    try {
          await checkToken()
       } catch (error:any) {
         return <NotFound code="401" message="Unauthorized"/>
       }

    const profileRes = await getSelfProfile()
    
    return (
          <div className="flex flex-col gap-4 md:flex-row w-full">
            { profileRes.success ?

                <>
                    <div className="md:fixed md:w-60 lg:w-80 md:border-r md:h-[calc(100vh)]">
                        <ProfilePreview profile={profileRes.data} />
                    </div>
                    <div className="flex flex-col md:ml-60 lg:ml-80 w-full p-4  md:h-[calc(100vh-5rem)">
                        <div className="w-full flex flex-col md:h-[calc(100vh-6.5rem)]">
                            <EditProfileTabs profile={profileRes.data}/>
                            {/* <div className="w-full mt-auto ">
                                <Button variant={"ghost"} asChild>
                                    <Link href={"/dashboard"} className="mt-4">
                                        <ArrowLeft className="size-4"/>
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div> */}
                        </div>
                    </div>
                </>
                :
                <p className="text-center">
                    {profileRes.data.error}
                </p>
                }
            </div>
    )
}

