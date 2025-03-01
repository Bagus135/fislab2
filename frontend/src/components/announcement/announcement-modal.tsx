import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";

export default function AnnouncementModal ({children, props} :{children : ReactNode, props : AllAnnouncementType}){
    return (
        <Dialog>
            <DialogTrigger asChild className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                {children}
            </DialogTrigger>
            <DialogHeader className="hidden">
                <DialogTitle/>
                <DialogDescription/>
            </DialogHeader>
            <DialogContent>
                <ScrollArea className="max-h-[calc(100vh-6rem)]">
                    <Card className="shadow-none border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl tracking-wider">{props.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-justify ">
                         {props.content}
                        </CardContent>
                        <CardFooter className=" flex flex-col items-end pt-6">
                            <p className="text-end ">{format(props.created_at,"dd MMMM yyyy")}</p>
                            <p className="text-end">{props.author}</p>
                        </CardFooter>
                    </Card>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}