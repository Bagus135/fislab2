import AslabModulGroup from "@/components/admin/grouping/aslab/modul/aslab-modul";
import AslabPracticanGroup from "@/components/admin/grouping/aslab/practican/aslab-practican";
import PracticanGroup from "@/components/admin/grouping/practican/practican-group";
import UserListCard from "@/components/admin/users/userslist-card";
import { TabsContent } from "@/components/ui/tabs";
import { Fragment } from "react";

export default function AdminPage (){
    return (
       <Fragment>
            <TabsContent value="grouping" className="flex flex-col gap-4 " >
                <AslabPracticanGroup/>
                <div className="lg:grid lg:grid-cols-10 gap-4  w-full flex">
                    <div className="col-span-5">
                        <PracticanGroup/>
                    </div>
                    <div className="col-span-5">
                        <AslabModulGroup/>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="users" className="w-full ">
                <UserListCard/>
            </TabsContent>
       </Fragment>
    )
}
