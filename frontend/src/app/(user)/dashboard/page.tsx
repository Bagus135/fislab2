'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

 export default function DashboardPage() {
  const chartData = [
    { practicum: "January", score: 186 },
    { practicum: "February", score: 305 },
    { practicum: "March", score: 237 },
    { practicum: "April", score: 73 },
    { practicum: "May", score: 209 },
    { practicum: "June", score: 214 },
  ]
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig
  
  return (
   <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Practicum Graph</CardDescription>
      </CardHeader>
      <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={true}/>
              <XAxis
                dataKey={"practicum"}
                tickLine={true}
                tickMargin={3}
                axisLine={false}
                tickFormatter={(val)=> val.slice(0,3)}
              />
              <ChartTooltip 
                cursor={true}
                content={<ChartTooltipContent hideLabel/>}
              />
              <Bar dataKey={"score"} fill="#00000" radius={5}/>
            </BarChart>
          </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
   </Card>
  )
}


