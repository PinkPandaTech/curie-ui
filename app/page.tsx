'use client';

// import type { Metadata } from "next"
import CurieUploadInterface from "@/components/curie-upload-interface"
import { CurieLogo } from "@/components/curie-logo"
import ServiceStatus from "@/components/service-status"
import { useEffect, useState } from "react";
import { services } from '@/components/services-config';

export default function HomePage() {
  const [status, setStatus] = useState<Record<string, string>>(
    Object.fromEntries(services.map(({ name }) => [name, 'Cargando...']))
  );

  const checkServices = async () => {
    const updates: Record<string, string> = {};

    await Promise.all(
      services.map(async ({ name, url }) => {
        try {
          const res = await fetch(url, { method: 'GET', cache: 'no-store' });
          if (name === 'XRay') {
            updates[name] = (res.ok || res.status === 404) ? 'Activo' : 'Cargando...';
          } else {
            updates[name] = res.ok ? 'Activo' : 'Cargando...';
          }
        } catch {
          updates[name] = 'Error';
        }
      })
    );

    setStatus(updates)
  };

  useEffect(() => {
    checkServices();
    const intervalId = setInterval(checkServices, 45000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 flex items-center gap-6 border-b pb-6">
        <div className="flex-shrink-0">
          <CurieLogo />
        </div>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Humath Curie Medical Analysis System
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Advanced AI-powered platform for medical image analysis and diagnostics
          </p>
        </div>
      </header>

      <main>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Services Status:
        </h1>

        {/* Mostrar siempre ServiceStatus, aunque status sea null */}
        <ServiceStatus status={status} />

        {/* Mostrar "Cargando..." mientras aún no está listo el status */}
        {status === null ? (
          <p className="mt-2 text-muted-foreground">Cargando servicios...</p>
        ) : (
          <CurieUploadInterface status={status} />
        )}
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Curie Medical Systems. All rights reserved.</p>
      </footer>
    </div>
  )
}

