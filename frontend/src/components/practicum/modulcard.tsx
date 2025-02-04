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
                <InputScoreModal score={{prelab : null, inlab : 80, abstrak: 70, pendahuluan : 80, metodologi : 90, pembahasan : 80, kesimpulan : 90, format : 80, comment : "Good Job"}}>
                    <Button variant={"outline"}>Preview</Button>
                </InputScoreModal>
                <Button variant={"default"}>Download</Button>
            </CardContent>
        </Card>
    )
}
