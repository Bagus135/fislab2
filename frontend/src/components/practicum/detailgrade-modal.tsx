import { getDetailScore } from "@/action/grade.action";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2Icon } from "lucide-react";

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void,
    userGrade: {
        role: 'ASISTEN' | 'PRAKTIKAN',
        gradedAt?: string | null;
        gradeId?: number | null;
        name?: string;
        nrp?: string;
        totalScore?: null | number;
        id?: string;
        data?: AllGradePractican;
    } | null;
}

export default function DetailGradeModal({ userGrade, open, setOpen }: Props) {
    const [score, setScore] = useState<GetDetailedScoreType | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const detailScore = async () => {
            try {
                setLoading(true);
                setError('');
                if (!userGrade) return
                const gradeId = userGrade.role === "ASISTEN" ? userGrade.gradeId : userGrade.data?.gradeId;
                if (!gradeId) throw new Error('User  has not been graded yet');
                const scoreData = await getDetailScore(gradeId) as GetDetailedScoreType;
                setScore(scoreData);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        detailScore();
    }, [userGrade]);

    const renderScoreRow = (label: string, value: number | null) => (
        <div className="flex flex-row justify-between">
            <p>{label}</p>
            <p>{value !== null ? value : 'N/A'}</p>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                {loading ? (
                    <div className="h-[calc(30vh)] flex justify-center items-center w-full">
                        <DialogHeader className="hidden">
                            <DialogTitle/>
                            <DialogDescription/>
                        </DialogHeader>
                        <Loader2Icon className="animate-spin size-4" />
                    </div>
                    )
                    :
                    !!error.trim() ? (
                        <>
                        <DialogHeader className="hidden">
                            <DialogTitle/>
                            <DialogDescription/>
                        </DialogHeader>
                        <p>{error}</p>
                        </>
                    ) : (
                    <> 
                        <DialogHeader>
                            <DialogTitle>
                                { userGrade && (userGrade.role === "ASISTEN" ? userGrade.name : userGrade.data?.title)}
                            </DialogTitle>
                            <DialogDescription>
                                {userGrade && (userGrade.role === "ASISTEN" ? userGrade.nrp : userGrade.data?.code)}
                            </DialogDescription>
                        </DialogHeader>
                        {score && (
                            <ScrollArea className="w-full max-h-[calc(60vh)] pr-2">
                                <div className="flex flex-col py-2">
                                      <div className="flex flex-row justify-between font-bold">
                                            <p>Total Score</p>
                                            <p>{score.scores.totalScore !== null ? score.scores.totalScore : 'N/A'}</p>
                                        </div>
                                    {/* {renderScoreRow("Prelab", score.scores.prelab.total)} */}
                                    {renderScoreRow("Punctuality", score.scores.prelab.punctuality)}
                                    {renderScoreRow("Pre-Exam", score.scores.prelab.preExam)}
                                    {renderScoreRow("Oral Test", score.scores.prelab.oralTest)}
                                    {/* {renderScoreRow("Inlab", score.scores.inlab.total)} */}
                                    {renderScoreRow("Skills and Attitude", score.scores.inlab.skillsAndAttitude)}
                                    {/* {renderScoreRow("Postlab", score.scores.postlab.total)} */}
                                    {renderScoreRow("Abstract", score.scores.postlab.abstract)}
                                    {renderScoreRow("Introduction", score.scores.postlab.introduction)}
                                    {renderScoreRow("Methodology", score.scores.postlab.methodology)}
                                    {renderScoreRow("Discussion", score.scores.postlab.discussion)}
                                    {renderScoreRow("Data Processing", score.scores.postlab.dataProcessing)}
                                    {renderScoreRow("Format", score.scores.postlab.formatting)}
                                    <div className=" flex flex-col gap-2 mt-4">
                                        <p className="text-center font-semibold">Feedback</p>
                                        <p className="border p-2 text-justify text-sm whitespace-pre-line">
                                            {score.feedback || '~ No Feedback Given ~'}
                                        </p>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </>
                )}
                </DialogContent>
                </Dialog>
            );
        }