import { getGradeUser } from "@/action/grade.action";
import { GradeCardAsistant, GradeCardPractican } from "@/components/practicum/gradecard";
import ModulPracticumCard from "@/components/practicum/modulcard";

export default async function PracticumPage(){
    const userGrade = await getGradeUser()
    
    return (
            <div className="grid md:grid-cols-9 gap-4">
                <div className="md:col-span-3 flex-1 md:order-last">
                    <ModulPracticumCard/>
                </div>
                <div className="md:col-span-6 flex flex-col gap-4">
                {userGrade.success && 
                     userGrade.role === 'ASISTEN' &&
                        <GradeCardAsistant grades={userGrade.data}  />
                }{ userGrade.success && 
                    userGrade.role === "PRAKTIKAN" &&
                        <GradeCardPractican grades={userGrade.data}/>
                    }
                </div>
            </div>
    )
}

