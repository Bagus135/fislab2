import { getAllUsers } from "@/action/admin.action";
import UserListCard from "@/components/admin/users/userslist-card";

export default async function Page(){
    const users = await getAllUsers();
    
    return (
    <div className="w-full ">
        <UserListCard users={users}/>
    </div>
    )
}