'use server';

import Link from "next/link";
import ThemeButton from "./themeToogle";

const Navbar = async () =>{
    return (
        <nav className="sticky top-0 w-full bg-background/95 backdrop-blur  supports-[backdrop-filter]:bg-background/60 z-50 ">
            <div className="mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-mono font-bold text-primary tracking-wider">
                            FISLAB II
                        </Link>
                    </div>
                    <ThemeButton/>
                </div>
            </div>
        </nav>
    )
} 

export default Navbar