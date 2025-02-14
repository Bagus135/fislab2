import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Pencil } from "lucide-react";

export default function EditMemberPracticanModal ({children}: {children : React.ReactNode}){
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Member </DrawerTitle>
                    <DrawerDescription>Edit Member Practican Group 6</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="flex flex-row gap-4 justify-end">
                    <DrawerClose asChild>
                        <Button variant={"outline"}>
                            Close
                        </Button>
                    </DrawerClose>
                    <Button variant={"outline"}>
                        <Pencil className="size-4"/>
                        Edit Member
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}