import SideBar from "@/components/sidebar";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return ( 
    <>
       <div className="border-r shadow-sidebar-foreground h-[calc(100vh)] hidden md:flex md:w-16 lg:w-40 fixed">
            <SideBar/>
        </div>
        <div className="md:ml-16 p-2 lg:ml-40 w-full">
            {children}
        </div>
    </>
    )
}