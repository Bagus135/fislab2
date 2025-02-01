import ProfilePreview from "@/components/editprofile/profile-preview";
import ProfilePage from "./me/page";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return ( 
        <div className="flex flex-col gap-4 md:flex-row w-full">
            <div className="md:fixed md:w-60 lg:w-80 md:border-r md:h-[calc(100vh)]">
                <ProfilePreview/>
            </div>
            <div className="flex flex-col md:ml-60 lg:ml-80 w-full p-4  md:h-[calc(100vh-5rem)">
                {children}
            </div>
        </div>
    )
}