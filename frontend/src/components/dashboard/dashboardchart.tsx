'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowUpFromLine, TrendingUp } from "lucide-react"
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
    views: {
      label: "Page Views",
    },
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig
  
  return (
   <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Practicum Graph</CardDescription>
      </CardHeader>
      <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto  h-[250px] w-full">
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
      <Card className="flex flex-col md:max-h-[350px]">
        <CardHeader className="items-center pb-4">
          <CardTitle>Radial Chart - Text</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex md:p-4 lg:p-6 md:pt-0 lg:pt-0 flex-col md:grid md:grid-cols-2 gap-4 ">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto max-h-[300px]"
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
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-col w-full xl:gap-4 justify-center  ">
                <div className=" w-full flex flex-row p-2 rounded-lg shadow border justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">A+</p>
                        <p className="text-xs font-light">Grade</p>
                    </div>
                    <ArrowUpFromLine className="size-6 fill-gray-700"/>
                </div>
                <div className=" flex shadow p-2 rounded-lg border flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">90</p>
                        <p className="text-xs font-light">Max Score</p>
                    </div>
                    <ArrowUpFromLine className="size-6 fill-gray-700"/>
                </div>
                <div className=" shadow border p-2 rounded-lg flex flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">81</p>
                        <p className="text-xs font-light">Min score</p>
                    </div>
                    <ArrowUpFromLine className="size-6 fill-gray-700"/>
                </div>
                <div className=" shadow border p-2 rounded-lg flex flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">1/10</p>
                        <p className="text-xs font-light">Progress</p>
                    </div>
                    <ArrowUpFromLine className="size-6 fill-gray-700"/>
                </div>
          </div>
        </CardContent>
      </Card>
    )
  }