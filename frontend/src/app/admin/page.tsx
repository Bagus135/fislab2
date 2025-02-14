import AslabModulGroup from "@/components/admin/grouping/aslab/modul/aslab-modul";
import AslabPracticanGroup from "@/components/admin/grouping/aslab/practican/aslab-practican";
import PracticanGroup from "@/components/admin/grouping/practican/practican-group";
import { TabsContent } from "@/components/ui/tabs";
import { Fragment } from "react";

export default function AdminPage (){
    return (
       <Fragment>
            <TabsContent value="grouping" className="flex flex-col gap-4" >
                <div className="lg:grid lg:grid-cols-10 gap-4 lg:px-2 w-full flex">
                    <div className="col-span-5">
                        <PracticanGroup/>
                    </div>
                    <div className="col-span-5">
                        <AslabModulGroup/>
                    </div>
                </div>
                <AslabPracticanGroup/>
            </TabsContent>
       </Fragment>
    )
}
