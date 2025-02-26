'use client'

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeButton () {
    const {setTheme, theme} = useTheme()
    return(
        <Button
         variant={"ghost"}
         size={"icon"}
         onClick={()=> setTheme(theme ==="dark" ? "light" : "dark")}
         >
            <SunIcon className="size-[1.2rem] rotate-0 scale-100 dark:rotate-90 dark:scale-0 transition-all"/>
            <MoonIcon className=" absolute size-[1.2rem] rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all"/>
         </Button>

    )
}