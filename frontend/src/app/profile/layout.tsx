import ProfilePreview from "@/components/editprofile/profile-preview";
import ProfilePage from "./me/page";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return ( 
        <div className="flex flex-col gap-4 md:flex-row">
            <div className="lg:fixed md:w-80  md:border-r h-[calc(100vh)]s">
                <ProfilePreview/>
            </div>
            <div className="flex ml-80">
                {children}
            </div>
        </div>
    )
}