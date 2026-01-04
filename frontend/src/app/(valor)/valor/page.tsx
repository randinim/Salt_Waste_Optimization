"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ValorPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/valor/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold mx-auto mb-4">
          V
        </div>
        <p className="text-muted-foreground">Redirecting to Valor Dashboard...</p>
      </div>
    </div>
  )
}
