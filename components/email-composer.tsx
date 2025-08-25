"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { emailTemplateCategories, type EmailTemplate } from "@/lib/output-templates"
import { 
  Mail, 
  Send, 
  Sparkles, 
  CheckCircle,
  Users,
  Briefcase,
  Calendar,
  Megaphone,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmailComposerProps {
  selectedData: {
    headers: string[]
    rows: string[][]
  }
}

const categoryIcons = {
  sales: Briefcase,
  customer: Users,
  internal: Calendar,
  marketing: Megaphone
}

export function EmailComposer({ selectedData }: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [emailColumn, setEmailColumn] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0)

  // Auto-detect email column on mount
  useEffect(() => {
    const emailCol = selectedData.headers.find(header => 
      header.toLowerCase().includes('email') || 
      header.toLowerCase().includes('mail')
    )
    if (emailCol) {
      setEmailColumn(emailCol)
    }
  }, [selectedData.headers])

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template)
  }

  const replaceVariables = (text: string, rowData: string[], columnMappings: Record<string, string>) => {
    let result = text
    Object.entries(columnMappings).forEach(([variable, column]) => {
      const columnIndex = selectedData.headers.indexOf(column)
      const value = columnIndex >= 0 ? rowData[columnIndex] : `{${variable}}`
      result = result.replace(new RegExp(`{${variable}}`, 'g'), value)
    })
    return result
  }

  const handleGenerateEmails = async () => {
    if (!selectedTemplate || !emailColumn) return
    
    setIsGenerating(true)
    try {
      // Auto-map columns based on template variables
      const columnMappings: Record<string, string> = {}
      selectedTemplate.variables.forEach(variable => {
        const matchedColumn = selectedData.headers.find(header => 
          header.toLowerCase().includes(variable.toLowerCase()) ||
          variable.toLowerCase().includes(header.toLowerCase())
        )
        if (matchedColumn) {
          columnMappings[variable] = matchedColumn
        }
      })

      // Generate personalized emails for each row
      const emails = selectedData.rows.slice(0, 10).map((row, index) => {
        const emailColumnIndex = selectedData.headers.indexOf(emailColumn)
        const emailAddress = emailColumnIndex >= 0 ? row[emailColumnIndex] : ''
        
        return {
          to: emailAddress,
          subject: replaceVariables(selectedTemplate.subject, row, columnMappings),
          body: replaceVariables(selectedTemplate.body, row, columnMappings),
          rowIndex: index
        }
      })
      
      setGeneratedEmails(emails)
      setPreviewMode(true)
    } catch (error) {
      console.error('Error generating emails:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendEmails = async () => {
    if (!generatedEmails.length) return
    
    const confirmed = confirm(`Send ${generatedEmails.length} emails?`)
    if (!confirmed) return
    
    setIsSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Successfully queued ${generatedEmails.length} emails for sending!`)
      setPreviewMode(false)
      setSelectedTemplate(null)
      setGeneratedEmails([])
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  // Preview Mode
  if (previewMode && generatedEmails.length > 0) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreviewMode(false)}>
              Back
            </Button>
            <Button 
              size="sm"
              onClick={handleSendEmails}
              disabled={isSending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send {generatedEmails.length} Emails
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Email List */}
          <ScrollArea className="h-[450px] border rounded-lg p-2">
            <div className="space-y-1">
              {generatedEmails.map((email, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    selectedPreviewIndex === idx 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedPreviewIndex(idx)}
                >
                  <div className="font-medium truncate">{email.to}</div>
                  <div className="text-xs text-gray-600 truncate">{email.subject}</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Email Content */}
          <div className="col-span-2 border rounded-lg p-4">
            {generatedEmails[selectedPreviewIndex] && (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">To:</div>
                  <div className="font-medium">{generatedEmails[selectedPreviewIndex].to}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Subject:</div>
                  <div className="font-medium">{generatedEmails[selectedPreviewIndex].subject}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Message:</div>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                    {generatedEmails[selectedPreviewIndex].body}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Template Selection Mode
  return (
    <div className="py-4 space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">Create Personalized Emails</h3>
        <p className="text-sm text-gray-600">Select a template to send emails to your contacts</p>
      </div>

      {/* Email Column Selection */}
      <div>
        <label className="text-sm font-medium mb-1 block">Email Column</label>
        <Select value={emailColumn} onValueChange={setEmailColumn}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select email column..." />
          </SelectTrigger>
          <SelectContent>
            {selectedData.headers.map((header) => (
              <SelectItem key={header} value={header}>
                {header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {Object.entries(emailTemplateCategories).map(([categoryKey, category]) => {
            const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons]
            return (
              <div key={categoryKey}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-700">{category.name}</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.tone}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {template.variables.length} fields
                            </span>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {!emailColumn && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select the column containing email addresses
          </AlertDescription>
        </Alert>
      )}

      {selectedTemplate && emailColumn && (
        <div className="pt-4 border-t">
          <Button
            onClick={handleGenerateEmails}
            disabled={isGenerating}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Emails...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Preview {selectedTemplate.name} Emails
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}