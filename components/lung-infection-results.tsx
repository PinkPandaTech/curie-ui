import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ImageOff } from "lucide-react";
import Image from "next/image";

interface LungInfectionData {
  total_ratio?: number;
  right_ratio?: {
    lt: number;
    rt: number;
    rb: number;
    lb: number;
  };
  left_ratio?: {
    lt: number;
    rt: number;
    rb: number;
    lb: number;
  };
  label?: string;
  confidence?: number;
  pleth_status?: string;
  idsa_ats_patterns?: { [key: string]: string };
  idsa_ats_score?: number;
  patient_age?: number;
  processedImageUrl?: string; // URL de la imagen procesada
}

interface LungInfectionResultsProps {
  data: LungInfectionData;
}

export function LungInfectionResults({ data }: LungInfectionResultsProps) {
  const {
    total_ratio,
    right_ratio,
    left_ratio,
    label,
    confidence,
    pleth_status,
    idsa_ats_patterns,
    idsa_ats_score,
    patient_age,
  } = data;

  // Determine status based on label
  const isHealthy = label === "SANO";
  const isPneumonia = label === "NEUMONIA";

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
            className={
              isHealthy
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : ""
            }
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
                <h4 className="text-xs text-muted-foreground mb-1">
                  Total Infection Ratio
                </h4>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      total_ratio || 0 > 15
                        ? "bg-destructive"
                        : total_ratio || 0 > 5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(total_ratio || 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {total_ratio}% overall infection detected
                </p>
              </div>

              <div>
                <h4 className="text-xs text-muted-foreground mb-1">
                  Confidence Score
                </h4>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(confidence || 0).toFixed(1)}% confidence in analysis
                </p>
              </div>

              <div>
                <h4 className="text-xs text-muted-foreground mb-1">
                  Diagnosis
                </h4>
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
                    {label === "SANO"
                      ? "Healthy"
                      : label === "NEUMONIA"
                      ? "Pneumonia"
                      : "Other Condition"}
                  </p>
                </div>

                {pleth_status !== undefined && pleth_status !== null && (
                  <>
                    <h4 className="text-xs text-muted-foreground mb-1">
                      ECG Diagnosis
                    </h4>
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
                        {pleth_status ||
                          (label === "SANO"
                            ? "Healthy"
                            : label === "NEUMONIA"
                            ? "Pneumonia"
                            : "Other Condition")}
                      </p>
                    </div>
                  </>
                )}

                {patient_age !== undefined && patient_age > 0 && (
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">
                      Patient Information
                    </h4>

                    <div className="p-3 rounded-md text-sm bg-blue-500/10">
                      <p className="font-medium">Age: {patient_age} years</p>
                    </div>

                    <div className="p-3 rounded-md text-sm bg-purple-500/10 mt-2">
                      <p className="font-medium">
                        IDSA ATS Score: {idsa_ats_score}
                      </p>
                    </div>

                    {idsa_ats_patterns &&
                      Object.keys(idsa_ats_patterns).length > 0 && (
                        <div className="p-3 rounded-md text-sm bg-orange-500/10 mt-2">
                          <p className="font-medium">IDSA ATS Patterns:</p>
                          <ul className="list-disc pl-4">
                            {Object.entries(idsa_ats_patterns || {}).map(
                              ([key, value]) => (
                                <li key={key} className="text-sm">
                                  {key.toUpperCase()}: {value}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Lung Infection Map</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium mb-2 text-center">
                  Left Lung
                </h5>
                <div className="aspect-square relative border rounded-md overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div
                      className="border-r border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (left_ratio?.lt ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {left_ratio?.lt ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-l border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (left_ratio?.rt ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {left_ratio?.rt ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-r border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (left_ratio?.lb ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {left_ratio?.lb ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-l border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (left_ratio?.rb ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {left_ratio?.rb ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-center">
                  Right Lung
                </h5>
                <div className="aspect-square relative border rounded-md overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div
                      className="border-r border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (right_ratio?.lt ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {right_ratio?.lt ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-l border-b"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (right_ratio?.rt ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                        {right_ratio?.rt ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-r border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (right_ratio?.lb ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {right_ratio?.lb ?? 0}%
                      </span>
                    </div>
                    <div
                      className="border-l border-t"
                      style={{
                        background: `rgba(220, 38, 38, ${
                          (right_ratio?.rb ?? 0 / 100) * 2
                        })`,
                      }}
                    >
                      <span className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-xs font-bold">
                        {right_ratio?.rb ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Infection ratio by lung quadrant (lt: top-left, rt: top-right, lb:
              bottom-left, rb: bottom-right)
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Processed X-Ray Image</h3>
          <div className="border rounded-lg overflow-hidden">
            {data.processedImageUrl ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={data.processedImageUrl}
                  alt="Processed X-Ray"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={(e) => {
                    console.error("Error loading processed image");
                    // Mostrar mensaje de error en la UI
                    const target = e.target as HTMLImageElement;
                    if (target.parentElement) {
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'p-4 text-center text-muted-foreground flex items-center justify-center gap-2';
                      errorDiv.innerHTML = `
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span>Error al cargar la imagen procesada</span>
                      `;
                      target.parentElement.appendChild(errorDiv);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
                <ImageOff className="h-4 w-4" />
                <span>Processing image...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
