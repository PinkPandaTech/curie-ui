import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"

interface LungInfectionData {
  total_ratio: number
  right_ratio: {
    lt: number
    rt: number
    rb: number
    lb: number
  }
  left_ratio: {
    lt: number
    rt: number
    rb: number
    lb: number
  }
  label: string
  confidence: number
}

interface LungInfectionResultsProps {
  data: LungInfectionData
}

export function LungInfectionResults({ data }: LungInfectionResultsProps) {
  const { total_ratio, right_ratio, left_ratio, label, confidence } = data

  // Determine status based on label
  const isHealthy = label === "SANO"
  const isPneumonia = label === "NEUMONIA"

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Lung Infection Analysis</CardTitle>
            <CardDescription>AI-powered X-Ray analysis results</CardDescription>
          </div>
          <Badge
            variant={isHealthy ? "outline" : "destructive"}
            className={isHealthy ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
          >
            {isHealthy ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </>
            ) : isPneumonia ? (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Pneumonia
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Other Condition
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Overall Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-muted-foreground mb-1">Total Infection Ratio</h4>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      total_ratio > 15 ? "bg-destructive" : total_ratio > 5 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(total_ratio * 3, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{total_ratio}% overall infection detected</p>
              </div>

              <div>
                <h4 className="text-xs text-muted-foreground mb-1">Confidence Score</h4>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${confidence}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{confidence.toFixed(1)}% confidence in analysis</p>
              </div>

              <div>
                <h4 className="text-xs text-muted-foreground mb-1">Diagnosis</h4>
                <div
                  className={`p-3 rounded-md text-sm ${
                    label === "SANO"
                      ? "bg-green-500/10"
                      : label === "NEUMONIA"
                        ? "bg-destructive/10"
                        : "bg-yellow-500/10"
                  }`}
                >
                  <p className="font-medium">
                    {label === "SANO" ? "Healthy" : label === "NEUMONIA" ? "Pneumonia" : "Other Condition"}
                  </p>
                </div>

                <h4 className="text-xs text-muted-foreground mb-1">ECG Diagnosis</h4>
                <div
                  className={`p-3 rounded-md text-sm ${
                    label === "SANO"
                      ? "bg-green-500/10"
                      : label === "NEUMONIA"
                        ? "bg-destructive/10"
                        : "bg-yellow-500/10"
                  }`}
                >
                  <p className="font-medium">
                    {label === "SANO" ? "Healthy" : label === "NEUMONIA" ? "Pneumonia" : "Other Condition"}
                  </p>
                </div>

                <h4 className="text-xs text-muted-foreground mb-1">NLP Diagnosis</h4>
                <div
                  className={`p-3 rounded-md text-sm ${
                    label === "SANO"
                      ? "bg-green-500/10"
                      : label === "NEUMONIA"
                        ? "bg-destructive/10"
                        : "bg-yellow-500/10"
                  }`}
                >
                  <p className="font-medium">
                    {label === "SANO" ? "Healthy" : label === "NEUMONIA" ? "Pneumonia" : "Other Condition"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Lung Infection Map</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium mb-2 text-center">Left Lung</h5>
                <div className="aspect-square relative border rounded-md overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div
                      className="border-r border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${(left_ratio.lt / 100) * 2})`,
                      }}
                    >
                      <span className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {left_ratio.lt}%
                      </span>
                    </div>
                    <div
                      className="border-l border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${(left_ratio.rt / 100) * 2})`,
                      }}
                    >
                      <span className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {left_ratio.rt}%
                      </span>
                    </div>
                    <div
                      className="border-r border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${(left_ratio.lb / 100) * 2})`,
                      }}
                    >
                      <span className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {left_ratio.lb}%
                      </span>
                    </div>
                    <div
                      className="border-l border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${(left_ratio.rb / 100) * 2})`,
                      }}
                    >
                      <span className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {left_ratio.rb}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-center">Right Lung</h5>
                <div className="aspect-square relative border rounded-md overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div
                      className="border-r border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${(right_ratio.lt / 100) * 2})`,
                      }}
                    >
                      <span className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {right_ratio.lt}%
                      </span>
                    </div>
                    <div
                      className="border-l border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${(right_ratio.rt / 100) * 2})`,
                      }}
                    >
                      <span className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {right_ratio.rt}%
                      </span>
                    </div>
                    <div
                      className="border-r border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${(right_ratio.lb / 100) * 2})`,
                      }}
                    >
                      <span className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {right_ratio.lb}%
                      </span>
                    </div>
                    <div
                      className="border-l border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${(right_ratio.rb / 100) * 2})`,
                      }}
                    >
                      <span className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {right_ratio.rb}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Infection ratio by lung quadrant (lt: top-left, rt: top-right, lb: bottom-left, rb: bottom-right)
            </div>
          </div>
        </div>

        {/* <div className="p-4 bg-muted rounded-md">
          <h3 className="text-sm font-medium mb-2">Raw Data</h3>
          <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded-md">
            {JSON.stringify(
              {
                total_ratio,
                right_ratio,
                left_ratio,
                label,
                confidence,
              },
              null,
              2,//
            )}
          </pre>
        </div> */}
      </CardContent>
    </Card>

  )
}

