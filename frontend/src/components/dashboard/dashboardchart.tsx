'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { GraduationCap, Spline, TrendingDown, TrendingUp} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis, } from "recharts"

interface ChartData {
  code: string;
  totalScore: number;
}

 export function BarChartComponent({data}: {data : AllGradePractican[] | null}) {
  
  const chartData: ChartData[] = data || [];
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
   <Card  className="w-full md:max-h-[350px]">
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Practicum Graph</CardDescription>
      </CardHeader>
      <CardContent className="w-full flex">
          <ChartContainer config={chartConfig} className=" aspect-auto h-[250px] w-full overflow-x-auto">
            <BarChart accessibilityLayer data={chartData}  layout="horizontal"   >
              <CartesianGrid vertical={true}/>
              <XAxis
                dataKey={"code"}
                tickLine={true}
                tickMargin={3}
                axisLine={false}
                tickFormatter={(val)=> val.slice(0,val.length)}
              />
              <ChartTooltip 
                cursor={true}
                content={<ChartTooltipContent hideLabel/>}
              />
              <Bar 
                dataKey={"totalScore"} 
                fill="#6EB4F1" 
                radius={5} 
                barSize={50}  
                label={{ position: 'insideTop', fill: 'black' }}
                   />
            </BarChart>
          </ChartContainer>
      </CardContent>
   </Card>
  )
}



  interface GradeResult {
    grade: string;
    textColor: string;
    barColor : string
}

export function RadialChart({data} : {data : AllGradePractican[] | null }) {

  const findMaxMinScores = (data: AllGradePractican[] | null): { max: number | null, min: number | null } => {
    if (!data || data.length === 0) return { max: null, min: null }

    const scores = data.map(item => item.totalScore);

    const maxScore = Math.max(...scores); 
    const minScore = Math.min(...scores); 

    return { max: maxScore, min: minScore };
  };

  const gradeRes = (data: AllGradePractican[] | null): { average: number, gradeResult: GradeResult } => {
    let gradeResult: GradeResult ={ grade : "-" , textColor : "", barColor : "#00000"};

    if (!data || data.length === 0) return { average: 0, gradeResult }; // Return null if data is null or empty

    const totalScore = data.reduce((acc, curr) => acc + curr.totalScore, 0);
    const averageScore = totalScore / data.length;


    // Determine grade and color based on average score
    switch (true) {
      case (averageScore >= 86 && averageScore <= 100):
        gradeResult = { 
          grade: 'A',
          textColor: 'text-green-600', 
          barColor: '#16a34a'
        };
        break;
        
      case (averageScore >= 76 && averageScore <= 85):
        gradeResult = { 
          grade: 'AB',
          textColor: 'text-green-500', 
          barColor: '#22c55e'
        };
        break;
        
      case (averageScore >= 66 && averageScore <= 75):
        gradeResult = { 
          grade: 'B',
          textColor: 'text-lime-500', 
          barColor: '#84cc16'
        };
        break;
        
      case (averageScore >= 61 && averageScore <= 65):
        gradeResult = { 
          grade: 'BC',
          textColor: 'text-yellow-500', 
          barColor: '#eab308'
        };
        break;
        
      case (averageScore >= 56 && averageScore <= 60):
        gradeResult = { 
          grade: 'C',
          textColor: 'text-amber-500', 
          barColor: '#f59e0b'
        };
        break;
        
      case (averageScore >= 41 && averageScore <= 55):
        gradeResult = { 
          grade: 'D',
          textColor: 'text-orange-500', 
          barColor: '#f97316'
        };
        break;
        
      case (averageScore >= 0 && averageScore <= 40):
        gradeResult = { 
          grade: 'E',
          textColor: 'text-red-500', 
          barColor: '#ef4444'
        };
        break;
        
      default:
        gradeResult = { 
          grade: 'N/A',
          textColor: 'text-gray-500', 
          barColor: '#6b7280'
        };
    }

    return { average: averageScore, gradeResult };
};

// Get average score and grade result
const { average, gradeResult } = gradeRes(data);

// Get max and min scores
const { max, min } = findMaxMinScores(data);

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

    const chartData = [{ 
      browser: "safari", 
      average: average, 
      fill: gradeResult.barColor },
    ]

    const fillColor = gradeResult.textColor.replace("text-", "fill-")

    return (
      <Card className="flex flex-col md:max-h-[350px] items-stretch w-full">
        <CardHeader className=" pb-4">
          <CardTitle> Statistics</CardTitle>
          <CardDescription>Average Score</CardDescription>
        </CardHeader>
        <CardContent className="flex md:p-4 lg:p-6 md:pt-0 lg:pt-0 flex-col md:grid md:grid-cols-2 gap-4 items-center justify-center ">
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-[200px] place-self-center"

          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={average*360/100}
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
              <RadialBar dataKey="average" background cornerRadius={10} />
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
                          <p className="hidden fill-gray-500 fill-green-600  fill-green-500 fill-lime-500 fill-yellow-500 fill-red-500 fill-amber-500 fill-orange-500 "/>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className={`text-4xl font-bold ${fillColor}`}
                          >
                            {chartData[0].average.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
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
                        <p className={`text-lg md:text-base font-bold xl:w-10 text-center ${gradeResult.textColor}`}>{gradeResult.grade}</p>
                        <p className="text-xs font-light">Grade</p>
                    </div>
                    <GraduationCap className="size-6"/>
                </div>
                <div className=" flex shadow p-2 rounded-lg border flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">{!max? "-" : max}</p>
                        <p className="text-xs font-light">Max Score</p>
                    </div>
                    <TrendingUp className="size-6"/>
                </div>
                <div className=" shadow border p-2 rounded-lg flex flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">{!min ? "-" : min}</p>
                        <p className="text-xs font-light">Min score</p>
                    </div>
                    <TrendingDown className="size-6"/>
                </div>
                <div className=" shadow border p-2 rounded-lg flex flex-row justify-between items-center">
                    <div className="flex flex-col justify-center items-start xl:flex-row xl:items-center xl:justify-start xl:gap-2">
                        <p className="text-lg md:text-base font-bold xl:w-10 text-center">{!data ? 0 :  data.length }/10</p>
                        <p className="text-xs font-light">Progress</p>
                    </div>
                    <Spline className="size-6"/>
                </div>
          </div>
        </CardContent>
      </Card>
    )
  }

