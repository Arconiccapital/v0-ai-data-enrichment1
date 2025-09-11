"use client"

import { useState } from "react"
import { GeneratedView } from "./vibe-mode/generated-view"
import { LovableChat } from "./vibe-mode/lovable-chat"
import { DesignFirstInterface } from "./vibe-mode/design-first-interface"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

export function VibeModeTab() {
  const { headers, data, setData } = useSpreadsheetStore()
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [artifactHtml, setArtifactHtml] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string>('')
  const [lastPrompt, setLastPrompt] = useState<string>('')
  const [generatedSchema, setGeneratedSchema] = useState<{
    headers: string[]
    sampleData: any[]
    description: string
  } | undefined>()
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([
    {
      role: 'assistant',
      content: data && data.length > 0 
        ? "I can transform your data into any visualization you imagine. What would you like to create?"
        : "Welcome! Describe the visualization you want to create, and I'll help you build it from scratch.",
      timestamp: new Date()
    }
  ])

  const handleDesignModeGeneration = async (prompt: string, template?: string) => {
    setIsGenerating(true)
    setGenerationError('')
    
    try {
      // First, generate the schema based on the prompt
      const schemaResponse = await fetch('/api/vibe-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, template })
      })
      
      const schemaResult = await schemaResponse.json()
      
      if (schemaResult.success) {
        setGeneratedSchema(schemaResult.schema)
        
        // Now generate visualization with sample data
        const vizResponse = await fetch('/api/vibe-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `${prompt}. Use this exact data structure.`,
            headers: schemaResult.schema.headers,
            data: schemaResult.schema.sampleData,
            isDesignMode: true
          })
        })
        
        const vizResult = await vizResponse.json()
        
        if (vizResult.success && vizResult.code) {
          setGeneratedCode(vizResult.code)
          
          // Update data in store with sample data
          setData(schemaResult.schema.headers, schemaResult.schema.sampleData)
        }
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async (prompt: string) => {
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])

    setLastPrompt(prompt)
    setIsGenerating(true)
    setGenerationError('')
    
    try {
      if (!data || data.length === 0) {
        // No data - generate schema first
        await handleDesignModeGeneration(prompt)
      } else {
        // Has data - use existing data
        const response = await fetch('/api/vibe-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: generatedCode 
              ? `Modify my existing visualization: ${prompt}` 
              : prompt,
            headers,
            data,
            existingCode: generatedCode || undefined
          })
        })
        
        const result = await response.json()
        
        if (result.success && result.code) {
          setGeneratedCode(result.code)
          
          // Add success message to chat
          const successMessage = generatedCode 
            ? "I've updated your visualization based on your request. You can continue refining it or try something completely different!"
            : "I've generated your visualization. Feel free to ask for modifications or try something completely different!"
          
          setChatHistory(prev => [...prev, {
            role: 'assistant',
            content: successMessage,
            timestamp: new Date()
          }])
        } else {
          // If code generation failed, try artifact fallback
          console.warn('Code generation failed, attempting artifact fallback...')
          const artRes = await fetch('/api/vibe-artifact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, headers, data })
          })
          const artJson = await artRes.json()
          if (artJson.success && artJson.html) {
            setArtifactHtml(artJson.html)
            setGeneratedCode('')
            setChatHistory(prev => [...prev, {
              role: 'assistant',
              content: "I've created your visualization. You can keep refining it with more requests.",
              timestamp: new Date()
            }])
          } else {
            throw new Error(result.error || artJson.error || 'Failed to generate visualization')
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed'
      setGenerationError(errorMessage)
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `I encountered an issue: ${errorMessage}. You can try rephrasing your request.`,
        timestamp: new Date()
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const renderContent = () => {
    // If no data and no generated code, show design interface
    if (!data || (data.length === 0 && !generatedCode)) {
      return (
        <DesignFirstInterface
          onGenerateVisualization={handleDesignModeGeneration}
          onSwitchToDataMode={() => {
            // This can be removed or used for other purposes
          }}
          isGenerating={isGenerating}
          generatedSchema={generatedSchema}
        />
      )
    }
    
    // Otherwise show the generated view
    return (
      <GeneratedView 
        code={generatedCode}
        artifactHtml={artifactHtml}
        isLoading={isGenerating}
        error={generationError}
        lastPrompt={lastPrompt}
      />
    )
  }

  return (
    <div className="flex-1 flex h-full bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderContent()}
        </div>
        
        {/* Status Bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-sm text-gray-700">
                  {isGenerating ? 'Generating...' : 'Ready'}
                </span>
              </div>
              {data && data.length > 0 && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{data.length} rows × {headers.length} columns</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-96 border-l border-gray-200">
        <LovableChat 
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}