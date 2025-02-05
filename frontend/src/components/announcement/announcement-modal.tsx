import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";

type AnnouncementProps = {
    id : number ,
    title : string,
    content : string,
    createdAt : Date,
    updatedAt : Date,
    author : string
}

export default function AnnouncementModal ({children, props} :{children : ReactNode, props : AnnouncementProps}){
    return (
        <Dialog>
            <DialogTrigger asChild>
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
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis optio officiis ab quasi corporis ipsam, aliquid neque, minima suscipit saepe unde fugiat distinctio itaque, at earum obcaecati delectus nulla nisi! Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, tempora, inventore quia incidunt, eum veritatis recusandae quidem nesciunt deleniti id ab. Odio aut nesciunt quo explicabo reprehenderit doloremque, laudantium dicta. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa cumque quibusdam at ex eveniet molestias molestiae voluptate, velit maiores eaque obcaecati rem quo quae fugiat cupiditate, esse ducimus. Numquam, architecto.Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, natus iste at dolores commodi voluptates. Quas quibusdam veniam, sit necessitatibus quo doloremque tenetur eveniet odio libero eius, nihil, exercitationem rem? {props.content}
                        </CardContent>
                        <CardFooter className=" flex flex-col items-end pt-6">
                            <p className="text-end ">{format(props.createdAt,"dd MMMM yyyy")}</p>
                            <p className="text-end">{props.author}</p>
                        </CardFooter>
                    </Card>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}