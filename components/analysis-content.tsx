"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  RefreshCw
} from "lucide-react"

interface AnalysisContentProps {
  analysisType: string
  data: any
  metadata?: {
    prompt?: string
    createdAt?: Date
    sourceColumns?: string[]
  }
  onRefresh?: () => void
}

export function AnalysisContent({ analysisType, data, metadata, onRefresh }: AnalysisContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh?.()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Render different content based on analysis type
  switch (analysisType) {
    case 'lead-scoring':
      return (
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Lead Scoring Analysis</h2>
              <p className="text-gray-600 mt-1">AI-powered lead qualification and scoring</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-gray-500 mt-1">From current dataset</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Hot Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">124</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Score 8-10</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Warm Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">312</div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Score 5-7</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14.6%</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+2.3% vs last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Score Distribution</CardTitle>
              <CardDescription>Breakdown of leads by score range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Hot (8-10)</span>
                    <span className="text-sm text-gray-600">124 leads</span>
                  </div>
                  <Progress value={14.6} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Warm (5-7)</span>
                    <span className="text-sm text-gray-600">312 leads</span>
                  </div>
                  <Progress value={36.8} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Cold (1-4)</span>
                    <span className="text-sm text-gray-600">411 leads</span>
                  </div>
                  <Progress value={48.5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Scoring Leads</CardTitle>
              <CardDescription>Highest priority leads based on AI scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Company</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Contact</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Score</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Potential Value</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Next Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Acme Corp</td>
                      <td className="py-3">John Smith</td>
                      <td className="py-3">
                        <Badge className="bg-green-100 text-green-800">9.5</Badge>
                      </td>
                      <td className="py-3">$120,000</td>
                      <td className="py-3 text-sm text-gray-600">Schedule demo</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">TechStart Inc</td>
                      <td className="py-3">Sarah Johnson</td>
                      <td className="py-3">
                        <Badge className="bg-green-100 text-green-800">9.2</Badge>
                      </td>
                      <td className="py-3">$85,000</td>
                      <td className="py-3 text-sm text-gray-600">Send proposal</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Global Systems</td>
                      <td className="py-3">Mike Chen</td>
                      <td className="py-3">
                        <Badge className="bg-green-100 text-green-800">8.8</Badge>
                      </td>
                      <td className="py-3">$200,000</td>
                      <td className="py-3 text-sm text-gray-600">Follow up call</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case 'churn-risk':
      return (
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Churn Risk Analysis</h2>
              <p className="text-gray-600 mt-1">Identify customers at risk of leaving</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">23</div>
                <p className="text-xs text-gray-500 mt-1">Immediate attention needed</p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Medium Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">67</div>
                <p className="text-xs text-gray-500 mt-1">Monitor closely</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Low Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">410</div>
                <p className="text-xs text-gray-500 mt-1">Healthy customers</p>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                High Risk Customers
              </CardTitle>
              <CardDescription>Customers requiring immediate intervention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Customer A', 'Customer B', 'Customer C'].map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">{customer}</div>
                      <div className="text-sm text-gray-600">Last active: 45 days ago</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">85% risk</Badge>
                      <div className="text-xs text-gray-600 mt-1">$12,000 ARR</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case 'revenue-forecast':
      return (
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Revenue Forecast</h2>
              <p className="text-gray-600 mt-1">AI-powered revenue predictions</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Q1 Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+15% YoY</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Q2 Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.8M</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+22% YoY</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Full Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12.5M</div>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600">105% of target</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <Progress value={87} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Historical data and forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                <BarChart3 className="h-12 w-12 text-gray-400" />
                <span className="ml-3 text-gray-500">Chart visualization would go here</span>
              </div>
            </CardContent>
          </Card>

          {/* Key Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Key Revenue Drivers</CardTitle>
              <CardDescription>Factors influencing the forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Customer Acquisition</span>
                  <Badge variant="outline">+$3.2M impact</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expansion Revenue</span>
                  <Badge variant="outline">+$1.8M impact</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Churn Reduction</span>
                  <Badge variant="outline">+$0.9M impact</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Price Optimization</span>
                  <Badge variant="outline">+$0.6M impact</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case 'dcf-model':
      return (
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">DCF Valuation Model</h2>
              <p className="text-gray-600 mt-1">Discounted Cash Flow analysis</p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Valuation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Enterprise Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$145.2M</div>
                <p className="text-xs text-gray-500 mt-1">Based on DCF analysis</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Implied Share Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32.45</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">18% upside</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">WACC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9.5%</div>
                <p className="text-xs text-gray-500 mt-1">Weighted avg cost of capital</p>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Projections */}
          <Card>
            <CardHeader>
              <CardTitle>Free Cash Flow Projections</CardTitle>
              <CardDescription>5-year forecast period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Year</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">EBITDA</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">FCF</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">PV of FCF</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">2024</td>
                      <td className="py-3 text-right">$12.5M</td>
                      <td className="py-3 text-right">$3.1M</td>
                      <td className="py-3 text-right">$2.4M</td>
                      <td className="py-3 text-right font-medium">$2.2M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">2025</td>
                      <td className="py-3 text-right">$15.0M</td>
                      <td className="py-3 text-right">$3.9M</td>
                      <td className="py-3 text-right">$3.1M</td>
                      <td className="py-3 text-right font-medium">$2.6M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">2026</td>
                      <td className="py-3 text-right">$18.0M</td>
                      <td className="py-3 text-right">$4.9M</td>
                      <td className="py-3 text-right">$4.0M</td>
                      <td className="py-3 text-right font-medium">$3.0M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">2027</td>
                      <td className="py-3 text-right">$21.6M</td>
                      <td className="py-3 text-right">$6.0M</td>
                      <td className="py-3 text-right">$5.0M</td>
                      <td className="py-3 text-right font-medium">$3.4M</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">2028</td>
                      <td className="py-3 text-right">$25.9M</td>
                      <td className="py-3 text-right">$7.3M</td>
                      <td className="py-3 text-right">$6.2M</td>
                      <td className="py-3 text-right font-medium">$3.9M</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Key Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle>Key Assumptions</CardTitle>
              <CardDescription>Model inputs and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Revenue Growth Rate</label>
                  <div className="text-lg font-medium">20% CAGR</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Terminal Growth Rate</label>
                  <div className="text-lg font-medium">3%</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">EBITDA Margin</label>
                  <div className="text-lg font-medium">25-28%</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tax Rate</label>
                  <div className="text-lg font-medium">21%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analysis Type: {analysisType}</h3>
            <p className="text-gray-500">This analysis type is being developed</p>
            {metadata?.prompt && (
              <p className="text-sm text-gray-400 mt-4">
                Generated from: "{metadata.prompt}"
              </p>
            )}
          </Card>
        </div>
      )
  }
}