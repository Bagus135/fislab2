
import { redirect } from "next/navigation";
import { JSX } from "react";

export default function AdminPage () : JSX.Element{
  redirect('/admin/dashboard')
}
