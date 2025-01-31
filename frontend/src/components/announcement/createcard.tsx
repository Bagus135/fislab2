import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function CreateAnnouncementCard(){
    return (
        <Card className="md:border-none md:shadow-none">
            <CardHeader>
                <CardTitle>Create Announcement</CardTitle>
                <CardDescription>Make an announcement for your practican</CardDescription>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
                <Button variant={"default"}>Create</Button>
            </CardContent>
        </Card>
    )
}