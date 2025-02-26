import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import InputScoreModal from "./aslab/inputscore-modal";

export default function ModulPracticumCard (){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Practicum Modul</CardTitle>
                <CardDescription>Guide Book for Practicum Fislab</CardDescription>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
                    <Button variant={"outline"}>Preview</Button>
                <Button variant={"default"}>Download</Button>
            </CardContent>
        </Card>
    )
}
