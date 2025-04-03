'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, PlusSquare, Search } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import CreateSesionPracticum from "./createsession-modal";
import { getAllAssistant, getAllScheduleAdmin, getPracticanGroup } from "@/action/admin.action";
import DropDownMenu from "./dropdown-menu";
import DeleteModal from "./delete-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type PropsType = {
    assistants: Awaited<ReturnType<typeof getAllAssistant>>,
    groups: Awaited<ReturnType<typeof getPracticanGroup>>,
    schedules: Awaited<ReturnType<typeof getAllScheduleAdmin>>,
}

export default function AslabPracticanGroup({ assistants, groups, schedules }: PropsType) {
    const [search, setSearch] = useState("");
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<AllScheduleAdmin | null>(null);
    const [filter, setFilter] = useState({
        sort: "code",
        order: "asc",
    });

    // Filter dan sort schedules
    const filteredSchedules = schedules.success ? filterAndSortSchedules(schedules.data, filter, search) : [];

    return (
        assistants.success && groups.success && schedules.success && (
            <Card>
                <DeleteModal open={openDelete} schedule={selectedSchedule} setOpen={setOpenDelete} />
                <CardHeader>
                    <CardTitle>Aslab-Practican Grouping</CardTitle>
                    <CardDescription>Connect Assistant Laboratorium to Practican Group</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-4 justify-between mb-4">
                        <div className="relative">
                            <span className="absolute p-1 pl-3 inset-y-0 left-0 flex items-center">
                                <Search className="size-4" />
                            </span>
                            <Input
                                placeholder="Search group number or aslab name..."
                                className="pl-12 lg:w-80"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-row gap-4">
                            <FilterBtn filter={filter} setFilter={setFilter}>
                                <Button>
                                    <Filter className="size-4" />
                                </Button>
                            </FilterBtn>

                            <CreateSesionPracticum assistants={assistants.data} groups={groups.data}>
                                <Button>
                                    <PlusSquare className="size-4" />
                                </Button>
                            </CreateSesionPracticum>
                        </div>
                    </div>
                    <Table className="text-center">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Group</TableHead>
                                <TableHead className="text-center">Week</TableHead>
                                <TableHead className="text-center">Code</TableHead>
                                <TableHead className="text-center">Aslab</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSchedules.length > 0 ? (
                                filteredSchedules.map((schedule, i) => (
                                    <TableRow key={i} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                                        <TableCell className="font-medium">{schedule.group.group}</TableCell>
                                        <TableCell>{schedule.group.week}</TableCell>
                                        <TableCell>{schedule.practicum.code}</TableCell>
                                        <TableCell>{schedule.assistant.name || schedule.assistant.nrp}</TableCell>
                                        <TableCell onClick={() => setSelectedSchedule(schedule)}>
                                            <DropDownMenu schedule={schedule} setOpenDelete={setOpenDelete} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No schedules found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    );
}

type FilterBtnProps = {
    children: React.ReactNode,
    setFilter: Dispatch<SetStateAction<{
        sort: string;
        order: string;
    }>>,
    filter: {
        sort: string;
        order: string;
    }
}

function FilterBtn({ children, filter, setFilter }: FilterBtnProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sort</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup  value={filter.sort} onValueChange={(val) => setFilter({ ...filter, sort: val })}>
                    <DropdownMenuRadioItem value="group">Group</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="code">Code</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">Week</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter.order} onValueChange={(val) => setFilter({ ...filter, order: val })}>
                    <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const filterAndSortSchedules = (
    schedules: AllScheduleAdmin[],
    filter: { sort: string; order: string },
    search: string
) => {
    // Filter berdasarkan search (group number atau aslab name)
    const filteredSchedules = schedules.filter((schedule) => {
        const groupMatch = schedule.group.group.toString().includes(search);
        const aslabMatch = schedule.assistant.name?.toLowerCase().includes(search.toLowerCase())
        return groupMatch || aslabMatch;
    });

    // Sorting berdasarkan filter.sort dan filter.order
    filteredSchedules.sort((a, b) => {
        let valueA, valueB;

        switch (filter.sort) {
            case "group":
                valueA = a.group.group;
                valueB = b.group.group;
                break;
            case "code":
                valueA = a.practicum.code;
                valueB = b.practicum.code;
                break;
            case "week":
                valueA = a.group.week;
                valueB = b.group.week;
                break;
            default:
                valueA = a.group.group;
                valueB = b.group.group;
        }

        if (filter.order === "asc") {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    return filteredSchedules;
};