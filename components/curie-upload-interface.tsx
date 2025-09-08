"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUploadStatus } from "@/components/file-upload-status"
import { LungInfectionResults } from "@/components/lung-infection-results"
import { Upload, AlertCircle } from "lucide-react"

// API endpoints configuration
const API_ENDPOINTS = {
    IMAGES: "https://capp-imagescurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io",
    NLP: "https://capp-nlpcurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io",
    BIOSIGNALS: "https://capp-biosignalscurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io"
};
const FETCH_TIMEOUT = 30000 // 30 seconds timeout

// Define file types and their accepted MIME types
const FILE_TYPES = {
  xray: {
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    label: "X-Ray Images",
    description: "Upload X-Ray image for AI-powered image analysis",
    icon: "image",
  },
  pdf: {
    accept: { "application/pdf": [".docx"] },
    maxFiles: 1,
    label: "Medical History (PDF)",
    description: "Upload PDF document containing patient medical history",
    icon: "file-text",
  },
  ecg: {
    accept: { "application/*": [".pdf"] },
    maxFiles: 1,
    label: "ECG Signals",
    description: "Upload ECG signal data for cardiac analysis",
    icon: "activity",
  },
}

// Define the types for our files
type FileType = "xray" | "pdf" | "ecg"
type FileStatus = "idle" | "uploading" | "processing" | "complete" | "error"

interface UploadedFile {
  id: string
  file: File
  type: FileType
  status: FileStatus
  progress: number
  error?: string
}

interface LungInfectionData {
  total_ratio?: number
  right_ratio?: {
    lt: number
    rt: number
    rb: number
    lb: number
  }
  left_ratio?: {
    lt: number
    rt: number
    rb: number
    lb: number
  }
  label?: string
  confidence?: number
  pleth_status?: string
  idsa_ats_patterns?: { [key: string]: string }
  idsa_ats_score?: number
  patient_age?: number
}

// Helper function to handle fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export default function CurieUploadInterface({ status }: { status: Record<string, string> }) {
  const allServicesActive = Object.values(status).every(s => s === "Activo");
  const [activeTab, setActiveTab] = useState<FileType>("xray")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [lungInfectionData, setLungInfectionData] = useState<LungInfectionData | null>(null)

  // Configure dropzone for the active file type
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: FILE_TYPES[activeTab].accept,
    maxFiles: FILE_TYPES[activeTab].maxFiles,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      // Create new file object
      const newFile = {
        id: `${Date.now()}-${acceptedFiles[0].name}`,
        file: acceptedFiles[0],
        type: activeTab,
        status: "idle" as FileStatus,
        progress: 0,
      }

      // Replace any existing file of the same type
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.type !== activeTab)
        return [...filtered, newFile]
      })

      // Reset results when new files are uploaded
      setShowResults(false)
      setLungInfectionData(null)
    },
  })

  // Generate mock lung infection data
  const generateMockLungInfectionData = () => {
    // Generate random infection ratios between 0-30%
    const generateQuadrantData = () => {
      return {
        lt: Number.parseFloat((Math.random() * 30).toFixed(1)),
        rt: Number.parseFloat((Math.random() * 30).toFixed(1)),
        rb: Number.parseFloat((Math.random() * 30).toFixed(1)),
        lb: Number.parseFloat((Math.random() * 30).toFixed(1)),
      }
    }

    const rightRatio = generateQuadrantData()
    const leftRatio = generateQuadrantData()

    // Calculate total ratio as average of all quadrants
    const totalRatio = (
      (Object.values(rightRatio).reduce((a, b) => a + b, 0) + Object.values(leftRatio).reduce((a, b) => a + b, 0)) / 8
    )

    // Determine label based on total ratio
    let label = "SANO" // Healthy
    if (totalRatio > 15) {
      label = "NEUMONIA" // Pneumonia
    } else if (totalRatio > 5) {
      label = "OTROS" // Others
    }

    return {
      total_ratio: Number(totalRatio.toFixed(1)),
      right_ratio: rightRatio,
      left_ratio: leftRatio,
      label: label,
      confidence: Number((70 + Math.random() * 25).toFixed(1)),
    }
  }

  const processXrayResponse = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_ENDPOINTS.IMAGES}/images/Curie_v1/`, {
        method: "POST",
        body: formData,
      });

      const rawResponse = await response.json();
      const analysisData = JSON.parse(rawResponse);

      return {
        total_ratio: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.total_ratio) || 0,
        right_ratio: {
          lt: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.right_ratio?.lt) || 0,
          rt: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.right_ratio?.rt) || 0,
          rb: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.right_ratio?.rb) || 0,
          lb: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.right_ratio?.lb) || 0,
        },
        left_ratio: {
          lt: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.left_ratio?.lt) || 0,
          rt: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.left_ratio?.rt) || 0,
          rb: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.left_ratio?.rb) || 0,
          lb: analysisData.label === "SANO" || analysisData.label === "OTROS" ? 0 : Number(analysisData.left_ratio?.lb) || 0,
        },
        label: analysisData.label || "OTROS",
        confidence: (Number(analysisData.confidence) * 100) || 0,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const processMedicalHistory = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_ENDPOINTS.NLP}/nlp/upload_docx`, {
        method: "POST",
        body: formData,
        redirect: "manual",
      });

      const rawResponse = await response.text()
      const historyData = JSON.parse(rawResponse);

      let parsedPatterns = {};
      if (typeof historyData["IDSA ATS patterns"] === "string") {
        try {
          parsedPatterns = JSON.parse(
            historyData["IDSA ATS patterns"].replace(/'/g, '"')
          );
        } catch (error) {
          console.error(error);
        }
      }

      return {
        patient_age: Number(historyData["Patient age"] || 0),
        idsa_ats_score: Number(historyData["IDSA ATS score"] || 0),
        idsa_ats_patterns: parsedPatterns,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const processEcgResponse = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("fs", "250");
      formData.append("pdf_file", file);

      const response = await fetch(`${API_ENDPOINTS.BIOSIGNALS}/biosignals/deteccion_arritmias_pacientes/`, {
        method: "POST",
        body: formData,
      });

      const rawResponse = await response.json();
      const ecgData = JSON.parse(rawResponse);

      return {
        pleth_status: ecgData["PERSONA_0"]?.["PLETH"] || undefined,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleProcessFiles = async () => {
    const filesToProcess = files.filter(
      (f) => ["xray", "pdf", "ecg"].includes(f.type) && f.status === "idle"
    );

    if (filesToProcess.length === 0) {
      alert("Please upload at least one file to process.");
      return;
    }

    setIsProcessing(true);

    let responses = {
      total_ratio: 0,
      right_ratio: { lt: 0, rt: 0, rb: 0, lb: 0 },
      left_ratio: { lt: 0, rt: 0, rb: 0, lb: 0 },
      label: "OTROS",
      confidence: 0,
      patient_age: 0,
      idsa_ats_score: 0,
      idsa_ats_patterns: {},
      pleth_status: undefined,
    };

    try {
      setFiles((prev) =>
        prev.map((f) =>
          filesToProcess.some((file) => file.id === f.id)
            ? { ...f, status: "uploading" }
            : f
        )
      );

      await Promise.all(
        filesToProcess.map(async (file) => {
          let result = null;

          if (file.type === "xray") {
            result = await processXrayResponse(file.file);
          } else if (file.type === "pdf") {
            result = await processMedicalHistory(file.file);
          } else if (file.type === "ecg") {
            result = await processEcgResponse(file.file);
          }

          Object.assign(responses, result);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 100, status: "complete" } : f
            )
          );
        })
      );

      console.log("Final processed data:", responses);

      setLungInfectionData(responses as LungInfectionData);
      setShowResults(true);
    } catch (error) {
      console.error("Error processing files:", error);

      setFiles((prev) =>
        prev.map((f) =>
          filesToProcess.some((file) => file.id === f.id)
            ? { ...f, status: "error", error: "Error uploading file" }
            : f
        )
      );

      alert("Error uploading file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))

    // If removing an X-Ray file, reset the results
    const fileToRemove = files.find((f) => f.id === fileId)
    if (fileToRemove?.type === "xray") {
      setShowResults(false)
      setLungInfectionData(null)
    }
  }

  const handleClearAll = () => {
    setFiles([])
    setShowResults(false)
    setLungInfectionData(null)
  }

  const handleBackToUpload = () => {
    setShowResults(false)
  }

  // Count files by type and status
  const fileCountsByType = {
    xray: files.filter((f) => f.type === "xray").length,
    pdf: files.filter((f) => f.type === "pdf").length,
    ecg: files.filter((f) => f.type === "ecg").length,
  }

  // For demonstration purposes, let's create a button to directly show results
  const showDemoResults = () => {
    const mockData = generateMockLungInfectionData()
    setLungInfectionData(mockData)
    setShowResults(true)
  }

  return (
    <div className="space-y-8">
      {!showResults ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Medical Data</CardTitle>
            <CardDescription>Upload patient files for AI-powered analysis</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FileType)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="xray">X-Ray Image {fileCountsByType.xray > 0 ? "✓" : ""}</TabsTrigger>
                <TabsTrigger value="pdf">Medical History {fileCountsByType.pdf > 0 ? "✓" : ""}</TabsTrigger>
                <TabsTrigger value="ecg">ECG Signal {fileCountsByType.ecg > 0 ? "✓" : ""}</TabsTrigger>
              </TabsList>

              {Object.entries(FILE_TYPES).map(([type, config]) => (
                <TabsContent key={type} value={type} className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 hover:border-primary/50"
                      }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-xs text-muted-foreground">Maximum {config.maxFiles} files</p>
                  </div>

                  {fileRejections.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Invalid files</AlertTitle>
                      <AlertDescription>
                        {fileRejections.map(({ file, errors }) => (
                          <div key={file.name} className="text-sm">
                            {file.name}: {errors.map((e) => e.message).join(", ")}
                          </div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {files.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Uploaded Files</h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <FileUploadStatus key={file.id} file={file} onRemove={() => handleRemoveFile(file.id)} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClearAll} disabled={files.length === 0 || isProcessing}>
              Clear All
            </Button>
            <div className="space-x-2">
              {/* For demonstration purposes only */}
              <Button variant="outline" onClick={showDemoResults}>
                Show Demo Results
              </Button>
              <Button
                onClick={handleProcessFiles}
                disabled={
                  !files.some((f) => f.status === "idle") || isProcessing || !allServicesActive
                }
              >
                {isProcessing ? "Processing..." : "Process Files"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Lung Infection Analysis Results</h2>
            <Button variant="outline" onClick={handleBackToUpload}>
              Back to Upload
            </Button>
          </div>
          {lungInfectionData && <LungInfectionResults data={lungInfectionData} />}
        </div>
      )}
    </div>
  )
}

