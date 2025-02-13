import PracticanGroup from "@/components/admin/grouping/practican-group";
import { TabsContent } from "@/components/ui/tabs";
import { Fragment } from "react";

export default function AdminPage (){
    return (
       <Fragment>
            <TabsContent value="grouping">
                <PracticanGroup/>
            </TabsContent>
       </Fragment>
    )
}
