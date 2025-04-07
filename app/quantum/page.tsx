"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function QuantumDemoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeQuantumOperation = async (operation: string, params?: any) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/quantum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation, params }),
      })

      if (!response.ok) {
        throw new Error('Failed to execute quantum operation')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Quantum Computing Demo</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quantum Random Number Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Generate a truly random number using quantum superposition.
            </p>
            <Button
              onClick={() => executeQuantumOperation('random', { numBits: 8 })}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Generate Random Number'
              )}
            </Button>
            {result !== null && (
              <p className="mt-4 text-center font-mono">
                Random Number: {result}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Coin Flip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Flip a quantum coin using superposition.
            </p>
            <Button
              onClick={() => executeQuantumOperation('flip')}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Flip Quantum Coin'
              )}
            </Button>
            {result !== null && (
              <p className="mt-4 text-center font-mono">
                Result: {result}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
} 