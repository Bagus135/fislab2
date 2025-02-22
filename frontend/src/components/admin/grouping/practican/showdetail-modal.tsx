import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Props = {
    group : getPracticanGroup|null,
    open : boolean,
    setOpen : (open : boolean) => void
}

export default function DetailPracticanGroupsModal ({group, open, setOpen } : Props){
    return (
        <Dialog open={open} onOpenChange={setOpen}>
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