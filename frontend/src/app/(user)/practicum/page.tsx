import ModulPracticumCard from "@/components/practicum/modulcard";
import ScoreCard from "@/components/practicum/scorecard";

export default function PracticumPage(){
    return (
            <div className="grid md:grid-cols-9 gap-4">
                <div className="md:col-span-3 flex-1 md:order-last">
                    <ModulPracticumCard/>
                </div>
                <div className="md:col-span-6 flex flex-col gap-4">
                        <ScoreCard/>
                </div>
            </div>
    )
}