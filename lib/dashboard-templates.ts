export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'scorecard' | 'funnel' | 'progress'
  title: string
  description?: string
  dataKey: string
  config?: any
  position?: { x: number; y: number; w: number; h: number }
}

export interface DashboardSection {
  title: string
  description?: string
  widgets: DashboardWidget[]
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  sections: DashboardSection[]
  defaultPrompt?: string
}

export interface DashboardCategory {
  id: string
  name: string
  description: string
  templates: DashboardTemplate[]
}

export const dashboardTemplateCategories: Record<string, DashboardCategory> = {
  finance: {
    id: 'finance',
    name: 'Finance & Investment',
    description: 'Financial analysis and investment tracking dashboards',
    templates: []
  },
  sales: {
    id: 'sales',
    name: 'Sales & Revenue',
    description: 'Sales performance and revenue tracking dashboards',
    templates: []
  },
  customer: {
    id: 'customer',
    name: 'Customer Analytics',
    description: 'Customer behavior and satisfaction dashboards',
    templates: []
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'Operational efficiency and resource management dashboards',
    templates: []
  }
}

export const dashboardTemplates: Record<string, DashboardTemplate> = {
  vc_investment: {
    id: "vc_investment",
    name: "VC Investment Framework",
    description: "Comprehensive dashboard for venture capital investment analysis and portfolio monitoring",
    icon: "💰",
    category: "finance",
    sections: [
      {
        title: "Deal Flow Pipeline",
        description: "Track deals through investment stages",
        widgets: [
          {
            id: "deal_funnel",
            type: "funnel",
            title: "Deal Pipeline Funnel",
            dataKey: "stage",
            config: {
              stages: ["Sourcing", "Screening", "Due Diligence", "Term Sheet", "Closed"],
              metrics: ["count", "conversion_rate"]
            }
          },
          {
            id: "stage_metrics",
            type: "kpi",
            title: "Stage Metrics",
            dataKey: "stage_stats",
            config: {
              metrics: [
                { label: "Total Deals", key: "total_deals" },
                { label: "Active Deals", key: "active_deals" },
                { label: "Conversion Rate", key: "conversion_rate" },
                { label: "Avg Time in Stage", key: "avg_time" }
              ]
            }
          }
        ]
      },
      {
        title: "Market Assessment",
        description: "Comprehensive market opportunity analysis",
        widgets: [
          {
            id: "market_size",
            type: "scorecard",
            title: "Market Size Analysis",
            dataKey: "market_size",
            config: {
              criteria: [
                { name: "TAM (Total Addressable Market)", weight: 0.3, max: 10, description: "$B market size" },
                { name: "SAM (Serviceable Addressable Market)", weight: 0.3, max: 10, description: "Reachable market" },
                { name: "SOM (Serviceable Obtainable Market)", weight: 0.2, max: 10, description: "Realistic capture" },
                { name: "Market Growth Rate", weight: 0.2, max: 10, description: "YoY growth %" }
              ]
            }
          },
          {
            id: "market_dynamics",
            type: "scorecard",
            title: "Market Dynamics",
            dataKey: "market_dynamics",
            config: {
              criteria: [
                { name: "Market Timing", weight: 0.3, max: 10, description: "Right time to enter" },
                { name: "Competitive Landscape", weight: 0.25, max: 10, description: "Competition level" },
                { name: "Regulatory Environment", weight: 0.2, max: 10, description: "Regulatory favorability" },
                { name: "Customer Readiness", weight: 0.25, max: 10, description: "Market adoption readiness" }
              ]
            }
          }
        ]
      },
      {
        title: "Team & Leadership Assessment",
        description: "Evaluate founding team and leadership capabilities",
        widgets: [
          {
            id: "founder_assessment",
            type: "scorecard",
            title: "Founder Evaluation",
            dataKey: "founders",
            config: {
              criteria: [
                { name: "Domain Expertise", weight: 0.25, max: 10, description: "Industry knowledge" },
                { name: "Track Record", weight: 0.25, max: 10, description: "Previous successes" },
                { name: "Technical Skills", weight: 0.2, max: 10, description: "Technical capabilities" },
                { name: "Vision & Strategy", weight: 0.15, max: 10, description: "Strategic thinking" },
                { name: "Coachability", weight: 0.15, max: 10, description: "Openness to feedback" }
              ]
            }
          },
          {
            id: "team_completeness",
            type: "scorecard",
            title: "Team Completeness",
            dataKey: "team",
            config: {
              criteria: [
                { name: "Product/Engineering", weight: 0.3, max: 10, description: "Technical team strength" },
                { name: "Sales/Marketing", weight: 0.25, max: 10, description: "GTM capabilities" },
                { name: "Operations", weight: 0.2, max: 10, description: "Operational excellence" },
                { name: "Advisory Board", weight: 0.15, max: 10, description: "Advisor quality" },
                { name: "Team Chemistry", weight: 0.1, max: 10, description: "Team dynamics" }
              ]
            }
          }
        ]
      },
      {
        title: "Product & Technology Evaluation",
        description: "Assess product-market fit and technology advantages",
        widgets: [
          {
            id: "product_assessment",
            type: "scorecard",
            title: "Product Excellence",
            dataKey: "product",
            config: {
              criteria: [
                { name: "Product-Market Fit", weight: 0.3, max: 10, description: "Customer validation" },
                { name: "Unique Value Prop", weight: 0.25, max: 10, description: "Differentiation" },
                { name: "User Experience", weight: 0.2, max: 10, description: "UX/UI quality" },
                { name: "Feature Completeness", weight: 0.15, max: 10, description: "Product maturity" },
                { name: "Customer Feedback", weight: 0.1, max: 10, description: "NPS/satisfaction" }
              ]
            }
          },
          {
            id: "technology_assessment",
            type: "scorecard",
            title: "Technology Moat",
            dataKey: "technology",
            config: {
              criteria: [
                { name: "Technical Innovation", weight: 0.3, max: 10, description: "Innovation level" },
                { name: "IP/Patents", weight: 0.25, max: 10, description: "IP protection" },
                { name: "Scalability", weight: 0.2, max: 10, description: "Technical scalability" },
                { name: "Data Network Effects", weight: 0.15, max: 10, description: "Network advantages" },
                { name: "Technical Debt", weight: 0.1, max: 10, description: "Code quality (inverse)" }
              ]
            }
          }
        ]
      },
      {
        title: "Business Model & Unit Economics",
        description: "Analyze revenue model and economic sustainability",
        widgets: [
          {
            id: "business_model",
            type: "scorecard",
            title: "Business Model Strength",
            dataKey: "business_model",
            config: {
              criteria: [
                { name: "Revenue Model Clarity", weight: 0.25, max: 10, description: "Clear monetization" },
                { name: "Pricing Power", weight: 0.25, max: 10, description: "Pricing flexibility" },
                { name: "Customer Stickiness", weight: 0.2, max: 10, description: "Retention ability" },
                { name: "Sales Efficiency", weight: 0.15, max: 10, description: "GTM efficiency" },
                { name: "Partnership Strategy", weight: 0.15, max: 10, description: "Strategic partnerships" }
              ]
            }
          },
          {
            id: "unit_economics",
            type: "scorecard",
            title: "Unit Economics",
            dataKey: "unit_economics",
            config: {
              criteria: [
                { name: "LTV/CAC Ratio", weight: 0.3, max: 10, description: ">3x target" },
                { name: "Gross Margin", weight: 0.25, max: 10, description: ">70% SaaS target" },
                { name: "Payback Period", weight: 0.2, max: 10, description: "<12 months target" },
                { name: "Revenue per Employee", weight: 0.15, max: 10, description: "Efficiency metric" },
                { name: "Capital Efficiency", weight: 0.1, max: 10, description: "Burn multiple" }
              ]
            }
          }
        ]
      },
      {
        title: "Traction & Growth Metrics",
        description: "Measure current performance and growth trajectory",
        widgets: [
          {
            id: "growth_metrics",
            type: "scorecard",
            title: "Growth Indicators",
            dataKey: "growth",
            config: {
              criteria: [
                { name: "Revenue Growth Rate", weight: 0.3, max: 10, description: "MoM/YoY growth" },
                { name: "Customer Growth", weight: 0.25, max: 10, description: "Customer acquisition" },
                { name: "Market Share Growth", weight: 0.2, max: 10, description: "Competitive position" },
                { name: "Geographic Expansion", weight: 0.15, max: 10, description: "Market expansion" },
                { name: "Product Line Expansion", weight: 0.1, max: 10, description: "Product diversity" }
              ]
            }
          },
          {
            id: "engagement_metrics",
            type: "scorecard",
            title: "Customer Engagement",
            dataKey: "engagement",
            config: {
              criteria: [
                { name: "Monthly Active Users", weight: 0.25, max: 10, description: "User activity" },
                { name: "Net Revenue Retention", weight: 0.25, max: 10, description: ">110% target" },
                { name: "Product Usage Depth", weight: 0.2, max: 10, description: "Feature adoption" },
                { name: "Customer Satisfaction", weight: 0.15, max: 10, description: "CSAT/NPS scores" },
                { name: "Community Engagement", weight: 0.15, max: 10, description: "Community strength" }
              ]
            }
          }
        ]
      },
      {
        title: "Financial Assessment",
        description: "Detailed financial health and projections analysis",
        widgets: [
          {
            id: "financial_health",
            type: "scorecard",
            title: "Financial Health",
            dataKey: "financial_health",
            config: {
              criteria: [
                { name: "Cash Runway", weight: 0.3, max: 10, description: "Months remaining" },
                { name: "Burn Rate Trend", weight: 0.25, max: 10, description: "Burn optimization" },
                { name: "Revenue Quality", weight: 0.2, max: 10, description: "Recurring vs one-time" },
                { name: "Collection Efficiency", weight: 0.15, max: 10, description: "DSO metrics" },
                { name: "Working Capital", weight: 0.1, max: 10, description: "Capital management" }
              ]
            }
          },
          {
            id: "valuation_metrics",
            type: "scorecard",
            title: "Valuation Justification",
            dataKey: "valuation",
            config: {
              criteria: [
                { name: "Revenue Multiple", weight: 0.3, max: 10, description: "vs comparables" },
                { name: "Growth Adjusted Multiple", weight: 0.25, max: 10, description: "Rule of 40" },
                { name: "Market Comparables", weight: 0.2, max: 10, description: "Peer valuation" },
                { name: "Strategic Premium", weight: 0.15, max: 10, description: "Strategic value" },
                { name: "Downside Protection", weight: 0.1, max: 10, description: "Asset coverage" }
              ]
            }
          }
        ]
      },
      {
        title: "Risk Analysis Matrix",
        description: "Comprehensive risk assessment across key dimensions",
        widgets: [
          {
            id: "execution_risk",
            type: "scorecard",
            title: "Execution Risk",
            dataKey: "execution_risk",
            config: {
              criteria: [
                { name: "Product Development Risk", weight: 0.3, max: 10, description: "Technical complexity" },
                { name: "Go-to-Market Risk", weight: 0.25, max: 10, description: "Sales execution" },
                { name: "Scaling Risk", weight: 0.2, max: 10, description: "Operational scaling" },
                { name: "Talent Risk", weight: 0.15, max: 10, description: "Hiring challenges" },
                { name: "Culture Risk", weight: 0.1, max: 10, description: "Cultural scaling" }
              ]
            }
          },
          {
            id: "market_risk",
            type: "scorecard",
            title: "Market & External Risk",
            dataKey: "market_risk",
            config: {
              criteria: [
                { name: "Competition Risk", weight: 0.3, max: 10, description: "Competitive threats" },
                { name: "Market Timing Risk", weight: 0.25, max: 10, description: "Market readiness" },
                { name: "Regulatory Risk", weight: 0.2, max: 10, description: "Regulatory changes" },
                { name: "Technology Shift Risk", weight: 0.15, max: 10, description: "Tech disruption" },
                { name: "Economic Risk", weight: 0.1, max: 10, description: "Macro sensitivity" }
              ]
            }
          }
        ]
      },
      {
        title: "Portfolio Monitoring",
        description: "Track portfolio company performance",
        widgets: [
          {
            id: "portfolio_kpis",
            type: "kpi",
            title: "Key Performance Indicators",
            dataKey: "kpis",
            config: {
              metrics: [
                { label: "ARR", key: "arr", format: "currency" },
                { label: "Growth Rate", key: "growth_rate", format: "percentage" },
                { label: "Churn Rate", key: "churn", format: "percentage" },
                { label: "CAC", key: "cac", format: "currency" },
                { label: "LTV", key: "ltv", format: "currency" },
                { label: "Cash Runway", key: "runway", format: "months" }
              ]
            }
          },
          {
            id: "valuation_trends",
            type: "chart",
            title: "Valuation Trends",
            dataKey: "valuations",
            config: {
              chartType: "line",
              xAxis: "date",
              yAxis: "valuation",
              series: ["company"]
            }
          },
          {
            id: "risk_indicators",
            type: "table",
            title: "Risk Indicators",
            dataKey: "risks",
            config: {
              columns: ["Company", "Cash Runway", "Dependency Risk", "Market Risk", "Overall Risk"]
            }
          }
        ]
      },
      {
        title: "Fund-Level Metrics",
        description: "Overall fund performance and allocation",
        widgets: [
          {
            id: "fund_performance",
            type: "kpi",
            title: "Fund Performance",
            dataKey: "fund_metrics",
            config: {
              metrics: [
                { label: "IRR", key: "irr", format: "percentage" },
                { label: "MOIC", key: "moic", format: "multiplier" },
                { label: "DPI", key: "dpi", format: "multiplier" },
                { label: "TVPI", key: "tvpi", format: "multiplier" }
              ]
            }
          },
          {
            id: "sector_allocation",
            type: "chart",
            title: "Sector Allocation",
            dataKey: "sectors",
            config: {
              chartType: "pie",
              valueKey: "allocation",
              labelKey: "sector"
            }
          },
          {
            id: "stage_allocation",
            type: "chart",
            title: "Stage Allocation",
            dataKey: "stages",
            config: {
              chartType: "donut",
              valueKey: "allocation",
              labelKey: "stage"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create a comprehensive VC investment dashboard with deal flow tracking, scoring criteria, portfolio monitoring, and fund metrics"
  },
  
  sales_performance: {
    id: "sales_performance",
    name: "Sales Performance Dashboard",
    description: "Track sales team performance, pipeline, and revenue metrics",
    icon: "📈",
    category: "sales",
    sections: [
      {
        title: "Revenue Overview",
        widgets: [
          {
            id: "revenue_kpis",
            type: "kpi",
            title: "Revenue Metrics",
            dataKey: "revenue",
            config: {
              metrics: [
                { label: "Total Revenue", key: "total", format: "currency" },
                { label: "MRR", key: "mrr", format: "currency" },
                { label: "ARR", key: "arr", format: "currency" },
                { label: "Growth Rate", key: "growth", format: "percentage" }
              ]
            }
          },
          {
            id: "revenue_trend",
            type: "chart",
            title: "Revenue Trend",
            dataKey: "revenue_history",
            config: {
              chartType: "area",
              xAxis: "month",
              yAxis: "revenue"
            }
          }
        ]
      },
      {
        title: "Sales Pipeline",
        widgets: [
          {
            id: "pipeline_funnel",
            type: "funnel",
            title: "Sales Funnel",
            dataKey: "pipeline",
            config: {
              stages: ["Leads", "Qualified", "Proposal", "Negotiation", "Closed Won"]
            }
          },
          {
            id: "pipeline_value",
            type: "kpi",
            title: "Pipeline Value",
            dataKey: "pipeline_metrics",
            config: {
              metrics: [
                { label: "Total Pipeline", key: "total_value", format: "currency" },
                { label: "Weighted Value", key: "weighted_value", format: "currency" },
                { label: "Avg Deal Size", key: "avg_deal", format: "currency" },
                { label: "Win Rate", key: "win_rate", format: "percentage" }
              ]
            }
          }
        ]
      },
      {
        title: "Team Performance",
        widgets: [
          {
            id: "rep_performance",
            type: "table",
            title: "Sales Rep Performance",
            dataKey: "reps",
            config: {
              columns: ["Rep Name", "Quota", "Achieved", "% to Quota", "Deals Closed", "Pipeline"]
            }
          },
          {
            id: "team_leaderboard",
            type: "chart",
            title: "Team Leaderboard",
            dataKey: "leaderboard",
            config: {
              chartType: "bar",
              xAxis: "rep",
              yAxis: "revenue"
            }
          }
        ]
      }
    ]
  },

  customer_analytics: {
    id: "customer_analytics",
    name: "Customer Analytics Dashboard",
    description: "Analyze customer behavior, satisfaction, and retention",
    icon: "👥",
    category: "customer",
    sections: [
      {
        title: "Customer Overview",
        widgets: [
          {
            id: "customer_stats",
            type: "kpi",
            title: "Customer Statistics",
            dataKey: "stats",
            config: {
              metrics: [
                { label: "Total Customers", key: "total" },
                { label: "Active Users", key: "active" },
                { label: "NPS Score", key: "nps" },
                { label: "CSAT Score", key: "csat", format: "percentage" }
              ]
            }
          },
          {
            id: "customer_growth",
            type: "chart",
            title: "Customer Growth",
            dataKey: "growth",
            config: {
              chartType: "line",
              xAxis: "month",
              yAxis: "customers"
            }
          }
        ]
      },
      {
        title: "Retention & Churn",
        widgets: [
          {
            id: "retention_metrics",
            type: "kpi",
            title: "Retention Metrics",
            dataKey: "retention",
            config: {
              metrics: [
                { label: "Retention Rate", key: "retention_rate", format: "percentage" },
                { label: "Churn Rate", key: "churn_rate", format: "percentage" },
                { label: "Avg Customer Lifetime", key: "lifetime", format: "months" },
                { label: "CLV", key: "clv", format: "currency" }
              ]
            }
          },
          {
            id: "cohort_retention",
            type: "chart",
            title: "Cohort Retention",
            dataKey: "cohorts",
            config: {
              chartType: "heatmap",
              xAxis: "month",
              yAxis: "cohort"
            }
          }
        ]
      },
      {
        title: "Segmentation",
        widgets: [
          {
            id: "segment_distribution",
            type: "chart",
            title: "Customer Segments",
            dataKey: "segments",
            config: {
              chartType: "pie",
              valueKey: "count",
              labelKey: "segment"
            }
          },
          {
            id: "segment_value",
            type: "table",
            title: "Segment Analysis",
            dataKey: "segment_analysis",
            config: {
              columns: ["Segment", "Customers", "Revenue", "Avg Value", "Churn Rate"]
            }
          }
        ]
      }
    ]
  },

  financial_overview: {
    id: "financial_overview",
    name: "Financial Overview Dashboard",
    description: "Monitor financial health, cash flow, and key financial metrics",
    icon: "💵",
    category: "finance",
    sections: [
      {
        title: "Financial Health",
        widgets: [
          {
            id: "financial_kpis",
            type: "kpi",
            title: "Key Financial Metrics",
            dataKey: "financials",
            config: {
              metrics: [
                { label: "Revenue", key: "revenue", format: "currency" },
                { label: "Gross Margin", key: "gross_margin", format: "percentage" },
                { label: "EBITDA", key: "ebitda", format: "currency" },
                { label: "Net Profit", key: "net_profit", format: "currency" }
              ]
            }
          },
          {
            id: "pl_summary",
            type: "table",
            title: "P&L Summary",
            dataKey: "pl",
            config: {
              columns: ["Line Item", "Current Month", "YTD", "Budget", "Variance"]
            }
          }
        ]
      },
      {
        title: "Cash Flow",
        widgets: [
          {
            id: "cash_metrics",
            type: "kpi",
            title: "Cash Metrics",
            dataKey: "cash",
            config: {
              metrics: [
                { label: "Cash Balance", key: "balance", format: "currency" },
                { label: "Burn Rate", key: "burn_rate", format: "currency" },
                { label: "Runway", key: "runway", format: "months" },
                { label: "Days Sales Outstanding", key: "dso", format: "days" }
              ]
            }
          },
          {
            id: "cash_flow_chart",
            type: "chart",
            title: "Cash Flow Trend",
            dataKey: "cash_flow",
            config: {
              chartType: "waterfall",
              categories: ["Operating", "Investing", "Financing"]
            }
          }
        ]
      }
    ]
  },

  operations_efficiency: {
    id: "operations_efficiency",
    name: "Operations Efficiency Dashboard",
    description: "Track operational metrics, efficiency, and resource utilization",
    icon: "⚙️",
    category: "operations",
    sections: [
      {
        title: "Operational Metrics",
        widgets: [
          {
            id: "ops_kpis",
            type: "kpi",
            title: "Key Operational Metrics",
            dataKey: "operations",
            config: {
              metrics: [
                { label: "Efficiency Rate", key: "efficiency", format: "percentage" },
                { label: "Utilization Rate", key: "utilization", format: "percentage" },
                { label: "Quality Score", key: "quality", format: "score" },
                { label: "On-Time Delivery", key: "otd", format: "percentage" }
              ]
            }
          },
          {
            id: "efficiency_trend",
            type: "chart",
            title: "Efficiency Trend",
            dataKey: "efficiency_history",
            config: {
              chartType: "line",
              xAxis: "date",
              yAxis: "efficiency"
            }
          }
        ]
      },
      {
        title: "Resource Management",
        widgets: [
          {
            id: "resource_allocation",
            type: "chart",
            title: "Resource Allocation",
            dataKey: "resources",
            config: {
              chartType: "stacked-bar",
              xAxis: "department",
              yAxis: "allocation"
            }
          },
          {
            id: "capacity_planning",
            type: "progress",
            title: "Capacity Utilization",
            dataKey: "capacity",
            config: {
              categories: ["Manufacturing", "Warehouse", "Logistics", "Support"]
            }
          }
        ]
      }
    ]
  },

  etf_comparison: {
    id: "etf_comparison",
    name: "ETF Comparison & Analysis",
    description: "Comprehensive ETF comparison dashboard with performance, risk, composition, and cost analysis",
    icon: "📊",
    category: "finance",
    sections: [
      {
        title: "Overview",
        description: "High-level ETF metrics and benchmark comparison",
        widgets: [
          {
            id: "etf_summary_cards",
            type: "kpi",
            title: "Key ETF Metrics",
            dataKey: "etf_summary",
            config: {
              metrics: [
                { label: "Expense Ratio", key: "expense_ratio", format: "percentage", icon: "💰" },
                { label: "AUM", key: "aum", format: "currency", icon: "📈" },
                { label: "YTD Return", key: "ytd_return", format: "percentage", icon: "🎯" },
                { label: "Sector Focus", key: "sector_focus", format: "text", icon: "🏢" },
                { label: "Inception Date", key: "inception_date", format: "date", icon: "📅" },
                { label: "Fund Provider", key: "provider", format: "text", icon: "🏦" }
              ]
            }
          },
          {
            id: "benchmark_comparison",
            type: "scorecard",
            title: "ETF vs Benchmark (S&P 500)",
            dataKey: "benchmark_comp",
            config: {
              criteria: [
                { name: "1Y Return vs Benchmark", weight: 0.25, max: 10, description: "Outperformance" },
                { name: "3Y Return vs Benchmark", weight: 0.25, max: 10, description: "Sustained outperformance" },
                { name: "Volatility vs Benchmark", weight: 0.25, max: 10, description: "Lower is better" },
                { name: "Sharpe Ratio vs Benchmark", weight: 0.25, max: 10, description: "Risk-adjusted returns" }
              ]
            }
          }
        ]
      },
      {
        title: "Performance Visualization",
        description: "Interactive performance charts and comparisons",
        widgets: [
          {
            id: "time_series_performance",
            type: "chart",
            title: "Historical Performance",
            dataKey: "performance_history",
            config: {
              chartType: "line",
              xAxis: "date",
              yAxis: "cumulative_return",
              series: ["etf", "benchmark", "competitors"],
              timeRanges: ["1M", "6M", "1Y", "3Y", "5Y", "Max"],
              annotations: ["major_events", "rebalance_dates"]
            }
          },
          {
            id: "cumulative_returns",
            type: "chart",
            title: "Cumulative Returns Comparison",
            dataKey: "cumulative_returns",
            config: {
              chartType: "area",
              xAxis: "date",
              yAxis: "return_percentage",
              series: ["etf", "competitor_1", "competitor_2", "benchmark"],
              stacked: false,
              showLegend: true
            }
          },
          {
            id: "rolling_metrics",
            type: "chart",
            title: "Rolling Volatility & Sharpe Ratio",
            dataKey: "rolling_metrics",
            config: {
              chartType: "dual_axis",
              xAxis: "date",
              yAxis1: "volatility",
              yAxis2: "sharpe_ratio",
              series1: ["30d_volatility", "90d_volatility"],
              series2: ["30d_sharpe", "90d_sharpe"],
              rollingWindow: [30, 60, 90, 180]
            }
          }
        ]
      },
      {
        title: "Risk & Composition",
        description: "Portfolio composition and risk analysis",
        widgets: [
          {
            id: "sector_allocation",
            type: "chart",
            title: "Sector Allocation",
            dataKey: "sector_weights",
            config: {
              chartType: "pie",
              valueKey: "weight",
              labelKey: "sector",
              showPercentages: true,
              interactive: true,
              colors: "category20"
            }
          },
          {
            id: "top_holdings",
            type: "table",
            title: "Top Holdings",
            dataKey: "holdings",
            config: {
              columns: [
                { key: "ticker", label: "Ticker", sortable: true },
                { key: "company_name", label: "Company", sortable: true },
                { key: "weight", label: "Weight %", sortable: true, format: "percentage" },
                { key: "sector", label: "Sector", sortable: true },
                { key: "performance_contrib", label: "Perf. Contribution", sortable: true, format: "percentage" },
                { key: "market_cap", label: "Market Cap", sortable: true, format: "currency" }
              ],
              pageSize: 15,
              showSearch: true,
              exportable: true
            }
          },
          {
            id: "geographic_exposure",
            type: "chart",
            title: "Geographic Exposure",
            dataKey: "geographic_allocation",
            config: {
              chartType: "heatmap",
              dimension: "country",
              valueKey: "exposure_percentage",
              colorScale: "blues",
              showTooltip: true,
              interactive: true
            }
          }
        ]
      },
      {
        title: "Cost & Liquidity",
        description: "Expense analysis and liquidity metrics",
        widgets: [
          {
            id: "expense_comparison",
            type: "chart",
            title: "Expense Ratio Comparison",
            dataKey: "expense_ratios",
            config: {
              chartType: "bar",
              xAxis: "etf_name",
              yAxis: "expense_ratio",
              benchmark: "category_average",
              colors: ["green", "yellow", "red"],
              thresholds: [0.1, 0.5, 1.0]
            }
          },
          {
            id: "liquidity_metrics",
            type: "kpi",
            title: "Liquidity Metrics",
            dataKey: "liquidity",
            config: {
              metrics: [
                { label: "Avg Daily Volume", key: "avg_volume", format: "number", suffix: "M shares" },
                { label: "Bid-Ask Spread", key: "bid_ask_spread", format: "percentage" },
                { label: "Premium/Discount", key: "premium_discount", format: "percentage" },
                { label: "Tracking Error", key: "tracking_error", format: "percentage" }
              ]
            }
          },
          {
            id: "aum_flow_trend",
            type: "chart",
            title: "AUM & Fund Flows",
            dataKey: "fund_flows",
            config: {
              chartType: "combo",
              xAxis: "date",
              yAxis1: "aum",
              yAxis2: "net_flows",
              chartType1: "area",
              chartType2: "bar",
              showInflows: true,
              showOutflows: true
            }
          }
        ]
      },
      {
        title: "Advanced Metrics",
        description: "Sophisticated risk and performance analytics",
        widgets: [
          {
            id: "risk_adjusted_performance",
            type: "scorecard",
            title: "Risk-Adjusted Performance",
            dataKey: "risk_metrics",
            config: {
              criteria: [
                { name: "Sharpe Ratio", weight: 0.25, max: 10, description: "Risk-adjusted returns" },
                { name: "Sortino Ratio", weight: 0.25, max: 10, description: "Downside risk-adjusted" },
                { name: "Information Ratio", weight: 0.2, max: 10, description: "Active return vs risk" },
                { name: "Max Drawdown", weight: 0.15, max: 10, description: "Lower is better", inverse: true },
                { name: "Recovery Time", weight: 0.15, max: 10, description: "Drawdown recovery", inverse: true }
              ]
            }
          },
          {
            id: "dividend_analysis",
            type: "chart",
            title: "Dividend Yield & Growth",
            dataKey: "dividends",
            config: {
              chartType: "combo",
              xAxis: "date",
              yAxis1: "dividend_yield",
              yAxis2: "dividend_growth_rate",
              chartType1: "line",
              chartType2: "bar",
              showTrend: true,
              annotations: ["ex_dividend_dates"]
            }
          },
          {
            id: "tracking_analysis",
            type: "chart",
            title: "Tracking Error Analysis",
            dataKey: "tracking",
            config: {
              chartType: "scatter",
              xAxis: "index_return",
              yAxis: "etf_return",
              trendLine: true,
              r2Display: true,
              confidenceBands: true,
              outlierDetection: true
            }
          }
        ]
      },
      {
        title: "Comparison Panel",
        description: "Side-by-side ETF comparison",
        widgets: [
          {
            id: "etf_comparison_table",
            type: "table",
            title: "ETF Comparison Matrix",
            dataKey: "etf_comparison",
            config: {
              columns: [
                { key: "metric", label: "Metric", fixed: true },
                { key: "etf_1", label: "ETF 1", editable: true },
                { key: "etf_2", label: "ETF 2", editable: true },
                { key: "etf_3", label: "ETF 3", editable: true },
                { key: "category_avg", label: "Category Avg", highlight: true }
              ],
              rows: [
                "Expense Ratio", "AUM", "YTD Return", "3Y Return", "5Y Return",
                "Volatility", "Sharpe Ratio", "Max Drawdown", "Dividend Yield",
                "Holdings Count", "Turnover Rate", "Tracking Error"
              ],
              conditionalFormatting: true,
              exportable: true,
              filterable: true
            }
          },
          {
            id: "relative_performance",
            type: "chart",
            title: "Relative Performance Matrix",
            dataKey: "relative_performance",
            config: {
              chartType: "heatmap",
              xAxis: "time_period",
              yAxis: "etf_name",
              valueKey: "return",
              colorScale: "diverging",
              midpoint: 0,
              showValues: true
            }
          },
          {
            id: "correlation_matrix",
            type: "chart",
            title: "Correlation Matrix",
            dataKey: "correlations",
            config: {
              chartType: "heatmap",
              dimension: "etf_pairs",
              valueKey: "correlation",
              colorScale: "spectral",
              range: [-1, 1],
              showValues: true,
              interactive: true
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create a comprehensive ETF comparison dashboard analyzing performance, risk, composition, costs, and relative metrics across multiple ETFs with interactive visualizations and benchmark comparisons"
  }
}

// Populate categories with templates
Object.values(dashboardTemplates).forEach(template => {
  const categoryKey = template.category
  if (dashboardTemplateCategories[categoryKey]) {
    dashboardTemplateCategories[categoryKey].templates.push(template)
  }
})