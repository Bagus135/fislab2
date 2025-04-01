'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  Download, Filter, Loader2Icon, Search} from "lucide-react";
import { useState } from "react";
import { FilterMonitoringPractican } from "./dropdownmenu-filter";
import PracticanMonitoringModal from "./detail-dialog";
import ExcelJS  from 'exceljs';
import { useToast } from "@/hooks/use-toast";

export default function PracticanScoreMonitor ({data}: {data : AllPracticanGrade}){
    const [search , setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const {toast} = useToast();

    const handleGenerateFileExcel = async() => {
        try{
            setLoading(true)
            const workbook = new ExcelJS.Workbook();
            const sheetNilai = workbook.addWorksheet("Nilai")
            sheetNilai.columns = [
                {header : "No", key : "no", width : 5},
                {header : "NRP", key : "nrp", width : 15},
                {header : "Nama", key : "nama", width : 30},
                {header : "MP1", key : "MP1", width : 5},
                {header : "MP2", key : "MP2", width : 5},
                {header : "MP3", key : "MP3", width : 5},
                {header : "MP4", key : "MP4", width : 5},
                {header : "MP5", key : "MP5", width : 5},
                {header : "W1", key : "W1", width : 5},
                {header : "W2", key : "W2", width : 5},
                {header : "W3", key : "W3", width : 5},
                {header : "W4", key : "W4", width : 5},
                {header : "W5", key : "MP5", width : 5},
                {header : "Average", key : "average", width : 10},
            ]

            const headerRow = sheetNilai.getRow(1); // Mendapatkan baris header
            headerRow.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF00FF00' }
                };
                cell.font = {
                    bold : true,
                    color : {
                        argb : "00000000"
                    }
                }
            });

            data.forEach((item, idx) => {
                const rowData = {
                    no: idx +1 ,
                    nama: item.nama,
                    nrp: item.nrp,
                    average : getAverageScore(item.nilai),
                    ...item.nilai 
                };
                
                const row = sheetNilai.addRow(rowData);
                row.getCell('average').font = { bold: true };
            })

            sheetNilai.eachRow({ includeEmpty: true }, (row) => {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        right: { style: "thin"} 
                    };
                });
            });
            
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'datanilai_praktikan.xlsx';
            link.click();
            
         } catch (e : any){
            toast({
                variant : "destructive",
                title : "Failed to Download file",
                description : e.message
            })
        } finally {
            setLoading(false)
        }
     }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Practican Score Monitor</CardTitle>
                <CardDescription>See all practican score</CardDescription>
            </CardHeader>
            <CardContent>
                 {
                    data.length === 0 ?
                    <div className="text-center">
                        ~ no data to show ~
                    </div>
                    :
                <>
                <div className="flex flex-row gap-4 justify-between mb-4">
                    <div className="relative ">
                        <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                            <Search className="size-4"/>
                        </span>
                        <Input
                            placeholder="Search NRP or Name..." 
                            className="pl-12"
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            />
                    </div>
                    <div className="space-x-2">
                        <FilterMonitoringPractican>
                            <Button>
                                <Filter className="size-4"/>
                            </Button>
                        </FilterMonitoringPractican>

                        <Button onClick={handleGenerateFileExcel}>
                            { loading ? 
                                <Loader2Icon className="size-4 animate-spin"/>
                                :
                                <Download className="size-4"/>
                            }
                        </Button>
                    </div>
                </div>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                        <TableHead className="text-center">NRP</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                    data.filter((a)=>  a.nama.toLowerCase().includes(search.toLowerCase())||a.nrp.includes(search))
                    .sort((a,b) => a.nrp > b.nrp ? 1 : -1)
                    .map((a,i) =>(
                            <PracticanMonitoringModal data={a} key={i}>
                                <TableRow className="odd:bg-white cursor-pointer even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                    <TableCell className="font-medium">{a.nrp}</TableCell>
                                    <TableCell>{a.nama}</TableCell>
                                    <TableCell>{Object.keys(a.nilai).length}</TableCell>
                                    <TableCell>{getAverageScore(a.nilai)}</TableCell>
                                </TableRow>
                            </PracticanMonitoringModal>
                        ))
                        }
                    </TableBody>
                </Table>
            </>
            }
            </CardContent>
        </Card>
    )
}

export const getAverageScore = (scores : AllPracticanGrade[number]['nilai']) => {
    const values = Object.values(scores)
    const totalScore =  values.reduce((acc , curr) => acc + curr , 0)
    return totalScore /  values.length
}