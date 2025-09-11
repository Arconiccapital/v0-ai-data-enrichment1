"use client"

import { useState } from "react"
import { GeneratedView } from "./vibe-mode/generated-view"
import { LovableChat } from "./vibe-mode/lovable-chat"
import { VibeTabs } from "./vibe-mode/vibe-tabs"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

type TabType = 'canvas' | 'data' | 'history'

interface GenerationHistory {
  prompt: string
  code: string
  timestamp: Date
}

export function VibeModeTab() {
  const { headers, data } = useSpreadsheetStore()
  const [activeTab, setActiveTab] = useState<TabType>('canvas')
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string>('')
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([
    {
      role: 'assistant',
      content: "Welcome to Vibe Mode. I can transform your data into any visualization you imagine. What would you like to create?",
      timestamp: new Date()
    }
  ])

  const handleDataTransform = async (prompt: string) => {
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])

    // Reset error state
    setGenerationError('')
    setIsGenerating(true)
    
    try {
      // Call the V1 API for dynamic code generation
      const response = await fetch('/api/vibe-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          headers,
          data
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.code) {
        // Log what we received from API
        console.log('🔵 VibeModeTab received code:', {
          codeLength: result.code.length,
          model: result.model
        })
        
        // Store the generated code
        setGeneratedCode(result.code)
        
        // Add to history
        setHistory(prev => [...prev, {
          prompt,
          code: result.code,
          timestamp: new Date()
        }])
        
        // Switch to canvas tab to show result
        setActiveTab('canvas')
        
        // Add success message to chat
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: "I've generated your visualization. You can see it in the Canvas tab. Feel free to ask for modifications or try something completely different!",
          timestamp: new Date()
        }])
      } else {
        // Log raw response for debugging if available
        if (result.rawResponse) {
          console.error('Raw response from API:', result.rawResponse)
        }
        throw new Error(result.error || 'Failed to generate visualization')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed'
      setGenerationError(errorMessage)
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `I encountered an issue: ${errorMessage}. Let me try a simpler approach or you can try rephrasing your request.`,
        timestamp: new Date()
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'canvas':
        return (
          <GeneratedView 
            code={generatedCode}
            isLoading={isGenerating}
            error={generationError}
          />
        )
      
      case 'data':
        // Show the original spreadsheet data
        return (
          <div className="flex-1 overflow-auto bg-white p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 bg-gray-100 border border-gray-300 text-left text-sm font-semibold text-gray-800">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 border border-gray-300 text-sm text-gray-700">
                        {cell || <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      
      case 'history':
        return (
          <div className="flex-1 overflow-auto bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generation History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500">No generations yet. Start by asking for a visualization!</p>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-700">{item.prompt}</p>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedCode(item.code)
                        setActiveTab('canvas')
                      }}
                      className="text-sm text-black hover:underline"
                    >
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="h-full flex bg-white">
      {/* Left Panel - Dynamic Content (70%) */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        {/* Tab Navigation */}
        <VibeTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasGeneratedContent={history.length > 0}
        />
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderContent()}
        </div>
        
        {/* Status Bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'}`}></div>
                <span className="text-sm text-gray-700">
                  {isGenerating ? 'Generating...' : `${activeTab === 'canvas' ? 'Canvas' : activeTab === 'data' ? 'Data View' : 'History'}`}
                </span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm text-gray-600">{data.length} rows × {headers.length} columns</span>
              {history.length > 0 && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{history.length} generations</span>
                </>
              )}
            </div>
            <button 
              className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
              disabled={!generatedCode || isGenerating}
            >
              Deploy when ready
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Lovable Chat (30%) */}
      <div className="w-[400px] flex-shrink-0">
        <LovableChat 
          chatHistory={chatHistory}
          onSendMessage={handleDataTransform}
        />
      </div>
    </div>
  )
}