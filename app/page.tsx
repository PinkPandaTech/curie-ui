import type { Metadata } from "next"
import CurieUploadInterface from "@/components/curie-upload-interface"
import { CurieLogo } from "@/components/curie-logo"

export const metadata: Metadata = {
  title: "Curie Medical Analysis System",
  description: "AI-powered medical analysis for healthcare professionals",
}

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 flex items-center gap-6 border-b pb-6">
        <div className="flex-shrink-0">
          <CurieLogo />
        </div>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Curie Medical Analysis System
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Advanced AI-powered platform for medical image analysis and diagnostics
          </p>
        </div>
      </header>

      <main>
        <CurieUploadInterface />
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Curie Medical Systems. All rights reserved.</p>
      </footer>
    </div>
  )
}

