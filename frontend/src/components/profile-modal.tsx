import { Instagram, LinkIcon, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

export default function ProfileModal({children} : {children: React.ReactNode}) {
    return (
        <Dialog>
            <DialogTrigger className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md" asChild>
                {children}
            </DialogTrigger>
            <DialogTitle className="hidden"></DialogTitle>
            <DialogContent className="p-0 border-none shadow-none">
                <Card className="border-none shadow-none">
                    <CardContent className="p-0 border-none shadow-none">
                        <div className="bg-slate-500 relative h-[120px] py-4">
                            <div className="w-full absolute flex justify-center">
                                <Avatar className="w-40 h-40 relative z-[0] bg-slate-500" >
                                    <AvatarImage src={"/avatar.png"}/>
                                </Avatar>
                            </div>
                        </div>
                        <div className="p-6 mt-10">

                            <h1 className="mt-4 text-2xl font-bold text-center">Alief Hisyam Al Hasany Nur Rahmat</h1>
                            <p className="text-muted-foreground text-center">5001221060</p>
                            <p className="mt-2 text-sm text-center">Saya adalah seorang pemula</p>

                            <div className="w-full mt-6 space-y-2 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                    <MessageCircle className="size-4 mr-2"/>
                                    +6282336658441
                                </div>
                                
                            <div className="flex items-center text-muted-foreground">
                                <Instagram className="size-4 mr-2"/>
                                @bagustaqim_
                            </div>

                                <div className="flex items-center text-muted-foreground">
                                    <LinkIcon className="size-4 mr-2"/>
                                    <a href={`https://a.com`}
                                        className="hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                            https://a.com
                                        </a>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}