import { Sparkles, BarChart3, FileText } from "lucide-react"

// Quick Insights - One-click analysis for immediate value
export const quickInsights = [
  {
    name: "What's Interesting?",
    prompt: "Analyze this data and tell me the most interesting patterns, outliers, and insights",
    icon: Sparkles,
    description: "Find patterns automatically"
  },
  {
    name: "Summary Stats",
    prompt: "Generate comprehensive summary statistics and key metrics for this dataset",
    icon: BarChart3,
    description: "Key metrics overview"
  },
  {
    name: "Quick Report",
    prompt: "Create a one-page executive summary with the most important findings",
    icon: FileText,
    description: "Executive summary"
  }
]

// Analysis templates organized by business function
export const analysisTemplates = {
  sales: [
    { name: "Win Rate Analysis", prompt: "Analyze why deals are won or lost", description: "Understand sales success" },
    { name: "Sales Rep Performance", prompt: "Rank reps by performance metrics", description: "Find top performers" },
    { name: "Pipeline Health", prompt: "Assess pipeline quality and forecast", description: "Hit your targets" }
  ],
  customer: [
    { name: "Customer Health Score", prompt: "Calculate health scores to prevent churn", description: "Prevent churn early" },
    { name: "Best Customers", prompt: "Identify most valuable customer segments", description: "Focus on high value" },
    { name: "Usage Patterns", prompt: "Analyze customer behavior patterns", description: "Understand behavior" }
  ],
  operations: [
    { name: "Process Bottlenecks", prompt: "Find where processes slow down", description: "Fix operational delays" },
    { name: "Quality Metrics", prompt: "Analyze quality issues and root causes", description: "Improve quality" },
    { name: "Resource Utilization", prompt: "Assess resource efficiency", description: "Optimize allocation" }
  ],
  financial: [
    { name: "Unit Economics", prompt: "Calculate CAC, LTV, and payback period", description: "Profitable growth" },
    { name: "Burn Rate", prompt: "Analyze cash burn and runway", description: "Cash management" },
    { name: "ROI Analysis", prompt: "Calculate return on investments", description: "Investment returns" }
  ]
}

// Output templates for reports, dashboards, and presentations
export const outputTemplates = {
  reports: [
    { name: "Financial Report", prompt: "Generate comprehensive financial statements", description: "P&L and balance sheet" },
    { name: "Sales Report", prompt: "Create sales performance report", description: "Revenue and pipeline" },
    { name: "Marketing Report", prompt: "Build marketing performance report", description: "Campaign ROI" },
    { name: "Operations Report", prompt: "Generate operations metrics report", description: "KPIs and efficiency" }
  ],
  dashboards: [
    { name: "Executive Dashboard", prompt: "Create CEO dashboard with KPIs", description: "C-suite overview" },
    { name: "Sales Dashboard", prompt: "Build real-time sales dashboard", description: "Live performance" },
    { name: "Customer Dashboard", prompt: "Design customer success dashboard", description: "Health and NPS" },
    { name: "Financial Dashboard", prompt: "Create financial health dashboard", description: "Cash and metrics" }
  ],
  presentations: [
    { name: "Board Deck", prompt: "Generate board presentation", description: "Quarterly board meeting" },
    { name: "Investor Update", prompt: "Create investor update deck", description: "Monthly newsletter" },
    { name: "Team All-Hands", prompt: "Build all-hands presentation", description: "Company updates" },
    { name: "Client QBR", prompt: "Generate quarterly business review", description: "Client success" }
  ]
}