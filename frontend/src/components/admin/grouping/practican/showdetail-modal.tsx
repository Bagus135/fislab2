import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { ReactNode } from "react"

type Props = {
    group : getPracticanGroup,
    children : ReactNode
}

export default function DetailPracticanGroupsModal ({ children, group} : Props){
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Group {group?.kelompok}</DialogTitle>
                    <DialogDescription>Show list member of practican group {group?.kelompok}</DialogDescription>
                </DialogHeader>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow >
                            <TableHead className="text-center">No</TableHead>
                            <TableHead className="text-center">NRP</TableHead>
                            <TableHead className="text-center">Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{
                        group &&
                        group.members.map((member,idx) =>(
                            <TableRow key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                <TableCell className="font-medium">{idx +1}</TableCell>
                                <TableCell>{member.nrp}</TableCell>
                                <TableCell>{member.name}</TableCell>
                            </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}