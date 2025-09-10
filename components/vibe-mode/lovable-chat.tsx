"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Edit, MessageSquare, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface LovableChatProps {
  chatHistory: ChatMessage[]
  onSendMessage: (message: string) => void
}

export function LovableChat({ chatHistory, onSendMessage }: LovableChatProps) {
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  // Simulate thinking animation
  useEffect(() => {
    if (chatHistory[chatHistory.length - 1]?.role === 'user') {
      setIsThinking(true)
      setTimeout(() => setIsThinking(false), 1500)
    }
  }, [chatHistory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const quickPrompts = [
    { text: "Find top performers" },
    { text: "Clean this data" },
    { text: "Show me insights" },
    { text: "Make it beautiful" }
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold">Lovable AI</h3>
            <p className="text-xs text-gray-500">
              {isThinking ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3",
                message.role === 'user'
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInput(prompt.text)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs text-gray-700 hover:text-gray-900 transition-all"
            >
              {prompt.text}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Ask Lovable..."
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            rows={2}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-lg transition-all",
              input.trim()
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 hover:text-gray-900 transition-all">
            <Edit className="w-3 h-3" />
            Edit
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 hover:text-gray-900 transition-all">
            <MessageSquare className="w-3 h-3" />
            Chat
          </button>
        </div>
      </div>
    </div>
  )
}