import { getModul } from "@/action/admin.action";
import ModulList from "@/components/admin/modul/modullist-card";

export default async function Page(){
    const moduls = await  getModul()

    return (
    <div  className="w-full ">
        <ModulList moduls={moduls}/>
    </div>
    )
}