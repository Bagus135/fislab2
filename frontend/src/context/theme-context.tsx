'use client'

import dynamic from "next/dynamic"
import React from "react"

const NextThemeProvider = dynamic(
    () => import('next-themes').then((e)=>e.ThemeProvider), {
        ssr : false
    }
)

export default function ThemeProvider (
    {children, ...props} : React.ComponentProps< typeof NextThemeProvider>
) {
 return (
        <NextThemeProvider {...props}>
            {children}
        </NextThemeProvider>
)
}