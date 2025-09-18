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
import { div } from "framer-motion/client";

// Traffic Light System Types
type TrafficLightColor = 'green' | 'yellow' | 'red' | 'indeterminate';

interface TrafficLightState {
  color: TrafficLightColor;
  percentage: number;
  confidence: number;
  reason: string;
}

interface TrafficLightData {
  green: TrafficLightState;
  yellow: TrafficLightState;
  red: TrafficLightState;
  primary: TrafficLightColor;
}

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

interface TrafficLightResult {
  primaryColor: 'green' | 'yellow' | 'red';
  confidence: {
    green: number;
    yellow: number;
    red: number;
  };
  reasoning: string;
}

interface LungInfectionResultsProps {
  data: LungInfectionData;
}

// Traffic Light Evaluation Functions
function evaluateGreenCondition(pleth_status?: string, label?: string, idsa_ats_score?: number): boolean {
  return pleth_status === "Normal" &&
         label === "SANO" &&
         (idsa_ats_score !== undefined && idsa_ats_score <= 2);
}

function evaluateYellowCondition(pleth_status?: string, label?: string, idsa_ats_score?: number): boolean {
  return (pleth_status === "Normal" || pleth_status === "Bradicardia") &&
         label === "OTROS" &&
         (idsa_ats_score !== undefined && idsa_ats_score >= 3);
}

function evaluateRedCondition(pleth_status?: string, label?: string, idsa_ats_score?: number): boolean {
  return (pleth_status === "Taquicardia" || pleth_status === "Bradicardia") &&
         label === "NEUMONIA" &&
         (idsa_ats_score !== undefined && idsa_ats_score >= 8);
}

// Funciones auxiliares para determinar colores basados en valores y categorías
function getScoreBasedColor(score?: number): string {
  if (score === undefined || score === null) return "bg-gray-500/10";
  if (score <= 2) return "bg-green-500/10";
  if (score >= 3 && score < 8) return "bg-yellow-500/10";
  return "bg-red-500/10"; // score >= 8
}

function getLabelBasedColor(label?: string): string {
  if (!label) return "bg-gray-500/10";
  switch (label) {
    case "SANO":
      return "bg-green-500/10";
    case "OTROS":
      return "bg-yellow-500/10";
    case "NEUMONIA":
      return "bg-red-500/10";
    default:
      return "bg-gray-500/10";
  }
}

function getPlethStatusBasedColor(plethStatus?: string): string {
  if (!plethStatus) return "bg-gray-500/10";
  switch (plethStatus) {
    case "Normal":
      return "bg-green-500/10";
    case "Bradicardia":
      return "bg-yellow-500/10";
    case "Taquicardia":
      return "bg-red-500/10";
    default:
      return "bg-gray-500/10";
  }
}

function calculateProximityState(data: LungInfectionData): TrafficLightData {
  // Lógica de proximidad cuando no hay coincidencia exacta
  const { pleth_status, label, idsa_ats_score } = data;
  let green = 20, yellow = 20, red = 20; // Base mínima
  let reasoning = "";

  // Evaluación por etiqueta de imagen (peso: 40%)
  // if (label === "NEUMONIA") {
  //   red += 40;
  //   reasoning += "Imagen indica NEUMONIA (+40% rojo), ";
  // } else if (label === "OTROS") {
  //   yellow += 35;
  //   reasoning += "Imagen indica OTROS (+35% amarillo), ";
  // } else if (label === "SANO") {
  //   green += 35;
  //   reasoning += "Imagen indica SANO (+35% verde), ";
  // }

  // Evaluación por IDSA ATS Score (peso: 30%)
  // const score = idsa_ats_score || 0;
  // if (score >= 8) {
  //   red += 30;
  //   reasoning += `IDSA=${score} (crítico, +30% rojo), `;
  // } else if (score >= 3) {
  //   yellow += 25;
  //   reasoning += `IDSA=${score} (moderado, +25% amarillo), `;
  // } else {
  //   green += 25;
  //   reasoning += `IDSA=${score} (bajo, +25% verde), `;
  // }

  // Evaluación por PLETH Status (peso: 30%)
  // if (pleth_status === "Taquicardia") {
  //   red += 25;
  //   reasoning += "PLETH=Taquicardia (+25% rojo)";
  // } else if (pleth_status === "Bradicardia") {
  //   red += 15;
  //   yellow += 15;
  //   reasoning += "PLETH=Bradicardia (+15% rojo, +15% amarillo)";
  // } else if (pleth_status === "Normal") {
  //   green += 20;
  //   reasoning += "PLETH=Normal (+20% verde)";
  // }

  // Normalizar para que sumen 100%
  const total = green + yellow + red;
  const greenPercentage = Math.round((green / total) * 100);
  const yellowPercentage = Math.round((yellow / total) * 100);
  const redPercentage = 100 - greenPercentage - yellowPercentage; // Asegurar que sume 100%

  // Determinar color primario
  const primaryColor =
    redPercentage >= yellowPercentage && redPercentage >= greenPercentage ? 'red' :
    yellowPercentage >= greenPercentage ? 'yellow' : 'green';

  return {
    green: {
      color: 'green',
      percentage: greenPercentage,
      confidence: Math.max(20, greenPercentage),
      reason: reasoning
    },
    yellow: {
      color: 'yellow',
      percentage: yellowPercentage,
      confidence: Math.max(20, yellowPercentage),
      reason: reasoning
    },
    red: {
      color: 'red',
      percentage: redPercentage,
      confidence: Math.max(20, redPercentage),
      reason: reasoning
    },
    primary: primaryColor
  };
}

function evaluateTrafficLight(data: LungInfectionData): TrafficLightData {
  const { pleth_status, label, idsa_ats_score, confidence } = data;
  
  // Si faltan datos, usar lógica de proximidad con los datos disponibles
  if (!pleth_status || !label || idsa_ats_score === undefined) {
    return calculateProximityState(data);
  }
  
  const isGreen = evaluateGreenCondition(pleth_status, label, idsa_ats_score);
  const isYellow = evaluateYellowCondition(pleth_status, label, idsa_ats_score);
  const isRed = evaluateRedCondition(pleth_status, label, idsa_ats_score);
  
  const baseConfidence = confidence || 70;
  
  // Si coincide exactamente con una regla
  if (isRed) {
    return {
      green: {
        color: 'green',
        percentage: 5,
        confidence: Math.max(5, baseConfidence - 50),
        reason: 'Coincidencia exacta con criterios ROJOS'
      },
      yellow: {
        color: 'yellow',
        percentage: 15,
        confidence: Math.max(10, baseConfidence - 40),
        reason: 'Coincidencia exacta con criterios ROJOS'
      },
      red: {
        color: 'red',
        percentage: 80,
        confidence: Math.min(95, baseConfidence + 15),
        reason: 'Condiciones críticas: PLETH anormal + NEUMONIA + IDSA≥8'
      },
      primary: 'red'
    };
  }
  
  if (isYellow) {
    return {
      green: {
        color: 'green',
        percentage: 15,
        confidence: Math.max(10, baseConfidence - 40),
        reason: 'Coincidencia exacta con criterios AMARILLOS'
      },
      yellow: {
        color: 'yellow',
        percentage: 75,
        confidence: Math.min(90, baseConfidence + 10),
        reason: 'Condiciones intermedias: PLETH normal/bradicardia + OTROS + IDSA≥3'
      },
      red: {
        color: 'red',
        percentage: 10,
        confidence: Math.max(15, baseConfidence - 30),
        reason: 'Coincidencia exacta con criterios AMARILLOS'
      },
      primary: 'yellow'
    };
  }
  
  if (isGreen) {
    return {
      green: {
        color: 'green',
        percentage: 85,
        confidence: Math.min(95, baseConfidence + 15),
        reason: 'Condiciones óptimas: PLETH normal + SANO + IDSA≤2'
      },
      yellow: {
        color: 'yellow',
        percentage: 10,
        confidence: Math.max(10, baseConfidence - 40),
        reason: 'Coincidencia exacta con criterios VERDES'
      },
      red: {
        color: 'red',
        percentage: 5,
        confidence: Math.max(5, baseConfidence - 50),
        reason: 'Coincidencia exacta con criterios VERDES'
      },
      primary: 'green'
    };
  }
  
  // Si no coincide con ninguna regla exacta, usar lógica de proximidad
  return calculateProximityState(data);
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
  
  // Evaluate traffic light system
  const trafficLightData = evaluateTrafficLight(data);

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Lung Infection Analysis</CardTitle>
            <CardDescription>AI-powered X-Ray analysis results</CardDescription>
          </div>
          <Badge
            variant={isHealthy ? "outline" : "destructive"}
            className={`text-base ${
              label === "SANO"
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : label === "NEUMONIA"
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            }`}
          >
            {isHealthy ? (
              <>
                <CheckCircle className="h-5 w-5 mr-1" />
                Healthy
              </>
            ) : isPneumonia ? (
              <>
                <AlertCircle className="h-5 w-5 mr-1" />
                Pneumonia
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 mr-1" />
                Other Condition
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parte de izquierda de las "barritas" */}
          <div>
            <h3 className="text-lg text-center font-medium mb-2">
              Overall Analysis
            </h3>
            <div className="space-y-4">
              {/* "barritas de porcentaje" */}
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">
                  Total Infection Ratio
                </h4>
                {/* Barra roja */}
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
              {/*  */}
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">
                  Confidence Score
                </h4>
                {/* barra Azul */}
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(confidence || 0).toFixed(1)}% confidence in analysis
                </p>
              </div>
              {/* Diagnostico */}
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">
                  Clasification
                </h4>
                <div
                  className={`p-3 rounded-md text-sm ${getLabelBasedColor(label)}`}
                >
                  <p className="font-medium">
                    {label === "SANO"
                      ? "Healthy"
                      : label === "NEUMONIA"
                      ? "Pneumonia"
                      : "Other Condition"}
                  </p>
                </div>
                {/* Diagnostico ECG */}
                {pleth_status !== undefined && pleth_status !== null && (
                  <>
                    <h4 className="text-sm text-muted-foreground mb-1">
                      ECG Diagnosis
                    </h4>
                    <div
                      className={`p-3 rounded-md text-sm ${getPlethStatusBasedColor(pleth_status)}`}
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

                {/* Información del paciente */}
                {patient_age !== undefined && patient_age > 0 && (
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">
                      Patient Information
                    </h4>

                    <div className="p-3 rounded-md text-sm bg-green-500/10">
                      <p className="font-medium">Age: {patient_age} years</p>
                    </div>

                    <div className={`p-3 rounded-md text-sm mt-2 ${getScoreBasedColor(idsa_ats_score)}`}>
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
            {/* Nueva sección: Imagen + 3 tarjetas semáforo */}
            <div className="flex flex-row gap-8 mt-8 items-center justify-center">
              {/* Imagen de ejemplo */}
              <div className=" flex items-center justify-center border rounded-md bg-muted">
                <Image
                  src="/MarieCurie.png"
                  alt="Marie Curie Image"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              {/* Tarjetas semáforo */}
              <div className="flex items-center flex-col gap-4">
                <h3 className="text-center text-xl ">Confidence percentage</h3>
                
                {/* Mostrar estado de datos */}
                {(!pleth_status || !label || idsa_ats_score === undefined) && (
                  <div className="text-sm text-orange-600 text-center mb-2 font-medium">
                    Evaluación parcial:
                    <div className="text-xs text-muted-foreground">
                      {!pleth_status && "• ECG data missing "}
                      {!label && "• Image analysis missing "}
                      {idsa_ats_score === undefined && "• Medical history missing"}
                    </div>
                  </div>
                )}

                {/* Tarjeta Verde */}
                <div
                  className={`w-32 h-12 flex items-center justify-center rounded-md text-white font-bold text-lg shadow transition-all ${
                    trafficLightData.primary === 'green'
                      ? 'bg-green-500 ring-2 ring-green-300'
                      : 'bg-green-400'
                  }`}
                  title={trafficLightData.green.reason}
                >
                  {trafficLightData.green.percentage}%
                </div>
                
                {/* Tarjeta Amarilla */}
                <div
                  className={`w-32 h-12 flex items-center justify-center rounded-md text-black font-bold text-lg shadow transition-all ${
                    trafficLightData.primary === 'yellow'
                      ? 'bg-yellow-400 ring-2 ring-yellow-300'
                      : 'bg-yellow-300'
                  }`}
                  title={trafficLightData.yellow.reason}
                >
                  {trafficLightData.yellow.percentage}%
                </div>
                
                {/* Tarjeta Roja */}
                <div
                  className={`w-32 h-12 flex items-center justify-center rounded-md text-white font-bold text-lg shadow transition-all ${
                    trafficLightData.primary === 'red'
                      ? 'bg-red-500 ring-2 ring-red-300'
                      : 'bg-red-400'
                  }`}
                  title={trafficLightData.red.reason}
                >
                  {trafficLightData.red.percentage}%
                </div>
                
                {/* Indicador de estado primario */}
                {/* <div className="text-xs text-center text-muted-foreground mt-2">
                  Primary Status: {trafficLightData.primary.toUpperCase()}
                </div> */}
                
                {/* Mostrar razón del resultado */}
                <div className="text-xs text-center text-muted-foreground mt-1 max-w-48">
                  {trafficLightData.primary === 'green' ? trafficLightData.green.reason :
                   trafficLightData.primary === 'yellow' ? trafficLightData.yellow.reason :
                   trafficLightData.red.reason}
                </div>
              </div>
            </div>
          </div>
          {/* Parte de los cuadrantes "rojos" */}
          <div>
            <h3 className="text-lg text-center font-medium mb-2">
              Lung Infection Map
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* cuadritos del lado izquierdo */}
              <div>
                <h5 className="text-sm font-medium mb-2 text-center">
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
              {/* Cuadritos del lado derecho */}
              <div>
                <h5 className="text-sm font-medium mb-2 text-center">
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
            {/*++ AQUÍ ++ la imagen procesada, //* cuando sean ya la X-Ray y el ECG se debería remover */}
            <div className="mt-6 ">
              <h3 className="text-base text-center font-medium mb-2">
                Processed X-Ray Image
              </h3>
              <div className="border rounded-lg overflow-hidden">
                {/* imagen rx procesada */}
                {data.processedImageUrl ? (
                  <div className="relative w-full h-64 md:h-80">
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
                          target.style.display = "none";
                          const errorDiv = document.createElement("div");
                          errorDiv.className =
                            "p-4 text-center text-muted-foreground flex items-center justify-center gap-2";
                          errorDiv.innerHTML = `
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span>Error loading processed image</span>
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
          </div>
        </div>

        {/* Parte donde muestra el ECG y la imagen ya procesados */}
        {/* <div className="mt-6 ">
          <h3 className="text-base text-center font-medium mb-2">
            Processed X-Ray Image
          </h3>
          <div className="border rounded-lg overflow-hidden flex justify-evenly">
            aquí irá el ECG ya procesado
            {
              <div className="relative w-[600px] aspect-video text-center hidden justify-center items-center">
                Here will be the ECG Processed
              </div>
            }

            imagen rx procesada
            {data.processedImageUrl ? (
              <div className="relative w-[50%] aspect-video ml-auto">
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
                      target.style.display = "none";
                      const errorDiv = document.createElement("div");
                      errorDiv.className =
                        "p-4 text-center text-muted-foreground flex items-center justify-center gap-2";
                      errorDiv.innerHTML = `
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span>Error loading processed image</span>
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
        </div> */}
      </CardContent>
    </Card>
  );
}
