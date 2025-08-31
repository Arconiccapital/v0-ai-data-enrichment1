"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  vcInvestmentFramework, 
  calculateCategoryScore, 
  calculateOverallScore,
  getScoreColor,
  getScoreBackground,
  getInvestmentRecommendation,
  type VCCategory,
  type VCCriterion
} from "@/lib/vc-investment-framework"
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Users,
  Package,
  Rocket,
  Cpu,
  DollarSign,
  FileText,
  Download,
  RefreshCw
} from "lucide-react"

interface VCInvestmentDashboardProps {
  companyName?: string
  data?: any
  onRefresh?: () => void
}

const categoryIcons: Record<string, any> = {
  "MARKET": TrendingUp,
  "TEAM": Users,
  "PRODUCT": Package,
  "GTM": Rocket,
  "TECH": Cpu,
  "BUSINESS & DEAL": DollarSign
}

export function VCInvestmentDashboard({ companyName = "Target Company", data, onRefresh }: VCInvestmentDashboardProps) {
  const [framework, setFramework] = useState<VCCategory[]>(vcInvestmentFramework)
  const [overallScore, setOverallScore] = useState(0)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [missingInfo, setMissingInfo] = useState<string[]>([])

  useEffect(() => {
    // Calculate overall score whenever framework changes
    const score = calculateOverallScore(framework)
    setOverallScore(score)
    
    // Find missing information
    const missing: string[] = []
    framework.forEach(category => {
      category.criteria.forEach(criterion => {
        if (!criterion.score || criterion.score === 0) {
          missing.push(`${category.name}: ${criterion.name}`)
        }
      })
    })
    setMissingInfo(missing)
  }, [framework])

  const updateScore = (categoryIndex: number, criterionIndex: number, score: number) => {
    const newFramework = [...framework]
    newFramework[categoryIndex].criteria[criterionIndex].score = score
    newFramework[categoryIndex].criteria[criterionIndex].weightedScore = 
      (score * newFramework[categoryIndex].criteria[criterionIndex].weight) / 100
    setFramework(newFramework)
  }

  const updateEvidence = (categoryIndex: number, criterionIndex: number, evidence: string) => {
    const newFramework = [...framework]
    newFramework[categoryIndex].criteria[criterionIndex].evidence = evidence
    setFramework(newFramework)
  }

  const recommendation = getInvestmentRecommendation(overallScore)

  const exportToCSV = () => {
    let csv = "Category,Criteria,Weight (%),Score,Weighted Score,Evidence\\n"
    framework.forEach(category => {
      category.criteria.forEach(criterion => {
        csv += `"${category.name}","${criterion.name}",${criterion.weight},${criterion.score || 0},${criterion.weightedScore || 0},"${criterion.evidence || ''}"\\n`
      })
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${companyName.replace(/\s+/g, '_')}_vc_analysis.csv`
    a.click()
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{companyName} - VC Investment Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive investment scoring framework</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Weighted average across all criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-2">out of 10.0</div>
              <Progress value={overallScore * 10} className="mt-4" />
            </div>
          </CardContent>
        </Card>

        {/* Investment Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Decision</CardTitle>
            <CardDescription>Based on weighted scoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge className={`text-lg px-4 py-2 ${recommendation.color}`}>
                {recommendation.recommendation}
              </Badge>
              <p className="text-sm text-gray-600 mt-4">
                {recommendation.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Completeness */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Completeness</CardTitle>
            <CardDescription>Scored criteria coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {framework.reduce((sum, cat) => 
                  sum + cat.criteria.filter(c => c.score && c.score > 0).length, 0
                )} / {framework.reduce((sum, cat) => sum + cat.criteria.length, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-2">criteria scored</div>
              {missingInfo.length > 0 && (
                <Badge variant="destructive" className="mt-4">
                  {missingInfo.length} missing
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {framework.map((category, catIdx) => {
          const Icon = categoryIcons[category.name] || Target
          const categoryScore = calculateCategoryScore(category.criteria)
          
          return (
            <Card key={category.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{category.weight}%</Badge>
                </div>
                <CardDescription>Score: {categoryScore.toFixed(1)}/10</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={categoryScore * 10} className="mb-3" />
                <div className="space-y-2">
                  {category.criteria.map((criterion, critIdx) => (
                    <div key={criterion.name} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{criterion.name}</span>
                        <span className={`font-medium ${getScoreColor(criterion.score || 0)}`}>
                          {criterion.score || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Scoring Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scoring Matrix</CardTitle>
          <CardDescription>Click on scores to edit, add evidence for each criterion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Criteria</th>
                  <th className="text-left p-2">Questions</th>
                  <th className="text-center p-2">Weight</th>
                  <th className="text-center p-2">Score</th>
                  <th className="text-center p-2">Weighted</th>
                  <th className="text-left p-2">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {framework.map((category, catIdx) => (
                  category.criteria.map((criterion, critIdx) => (
                    <tr key={`${catIdx}-${critIdx}`} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{category.name}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{criterion.name}</div>
                          <div className="text-xs text-gray-500">{criterion.description}</div>
                        </div>
                      </td>
                      <td className="p-2 text-xs text-gray-600 max-w-xs">
                        {criterion.guidingQuestions}
                      </td>
                      <td className="p-2 text-center">{criterion.weight}%</td>
                      <td className="p-2 text-center">
                        {editingCell === `${catIdx}-${critIdx}-score` ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={criterion.score || 0}
                            onChange={(e) => updateScore(catIdx, critIdx, parseFloat(e.target.value))}
                            onBlur={() => setEditingCell(null)}
                            className="w-16 mx-auto"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell(`${catIdx}-${critIdx}-score`)}
                            className={`cursor-pointer px-2 py-1 rounded ${getScoreBackground(criterion.score || 0)} ${getScoreColor(criterion.score || 0)}`}
                          >
                            {criterion.score || 0}
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center font-medium">
                        {((criterion.score || 0) * criterion.weight / 100).toFixed(2)}
                      </td>
                      <td className="p-2">
                        {editingCell === `${catIdx}-${critIdx}-evidence` ? (
                          <Textarea
                            value={criterion.evidence || ""}
                            onChange={(e) => updateEvidence(catIdx, critIdx, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="min-w-[200px]"
                            rows={2}
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell(`${catIdx}-${critIdx}-evidence`)}
                            className="cursor-pointer text-xs text-gray-600 hover:bg-gray-100 p-1 rounded"
                          >
                            {criterion.evidence || "Click to add evidence..."}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-50">
                  <td colSpan={4} className="p-2 text-right">Total Weighted Score:</td>
                  <td className="p-2 text-center" colSpan={2}>
                    <span className={`text-lg ${getScoreColor(overallScore)}`}>
                      {overallScore.toFixed(2)} / 10.00
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Missing Information Alert */}
      {missingInfo.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Missing Information:</strong> The following criteria need scoring: {missingInfo.join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Scoring Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded ${getScoreBackground(2)}`}>
              <div className={`font-medium ${getScoreColor(2)}`}>Low (1-3)</div>
              <p className="text-xs mt-1">Significant concerns or gaps</p>
            </div>
            <div className={`p-3 rounded ${getScoreBackground(5)}`}>
              <div className={`font-medium ${getScoreColor(5)}`}>Medium (4-6)</div>
              <p className="text-xs mt-1">Acceptable but needs improvement</p>
            </div>
            <div className={`p-3 rounded ${getScoreBackground(8)}`}>
              <div className={`font-medium ${getScoreColor(8)}`}>High (7-10)</div>
              <p className="text-xs mt-1">Strong performance, clear advantage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}