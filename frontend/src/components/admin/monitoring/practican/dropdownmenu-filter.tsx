"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function  FilterMonitoringPractican({children}:{children: React.ReactNode}) {
  const [filter, setFilter] = React.useState({
    sort : "code",
    order : "asc"
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={filter.sort} onValueChange={(val)=>setFilter({...filter, sort : val})}>
          <DropdownMenuRadioItem value="nrp">NRP</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="progress">Progress</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="score">Score</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Order</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={filter.order} onValueChange={(val)=>setFilter({...filter, order : val})}>
          <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
