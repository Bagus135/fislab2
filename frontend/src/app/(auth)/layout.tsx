import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginLayout ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    return (
        <div className="w-full flex justify-center items-center  h-[calc(100vh-4.5rem)]">
            <Card className="max-w-[400px] w-[calc(100vw-2rem)]">
               {children}
            </Card>
        </div>

    )
}