'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ClientNavbar () {
    const pathname = usePathname()
    return(
        pathname === "/" &&
        <div className="hidden md:flex flex-row gap-4  lg:gap-8 items-center text-sm">
            <Link href={"#home"}>
                <p>Home</p>
            </Link>
            <Link href={"#overview"}>
                <p>Overview</p>
            </Link>
            <Link href={"#teams"}>
                <p>Teams</p>
            </Link>
        </div>
    )
}