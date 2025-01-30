'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis } from "recharts"

 export function BarChartComponent() {
  const chartData = [
    { practicum: "January", score: 186 },
    { practicum: "February", score: 305 },
    { practicum: "March", score: 237 },
    { practicum: "April", score: 73 },
    { practicum: "May", score: 209 },
    { practicum: "June", score: 214 },
    { practicum: "June", score: 214 },
    { practicum: "June", score: 214 },
    { practicum: "June", score: 214 },
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
          <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] w-full">
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
   </Card>
  )
}


  const chartData = [
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  ]
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

export function RadialChart() {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Radial Chart - Text</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={350}
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="visitors" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {chartData[0].visitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    )
  }