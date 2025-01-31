import { MoveRight } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export default function AnnouncementCard () {
    return (
        <Card>
            <CardHeader className="pb-2 flex flex-col">
                <CardTitle>Dilarang Menjomok Di Laboratorium Madya</CardTitle>
                <CardDescription className="font-normal">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repellat sit vitae enim. Ratione similique laudantium nisi, molestias explicabo suscipit asperiores excepturi error optio sunt, voluptatum animi corporis mollitia, omnis illum.</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-row justify-between items-center">
                <p className="text-xs font-light">1 minutes ago</p>
                <MoveRight className="size-4"/>
            </CardFooter>
        </Card>
    )
}