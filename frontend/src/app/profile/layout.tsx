import ProfilePage from "./me/page";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return ( 
        <div className="flex flex-col gap-4 md:flex-row">
            <div className="lg:fixed w-44">
                <ProfilePage/>
            </div>
        </div>
    )
}