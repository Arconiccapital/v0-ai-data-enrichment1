import { DashboardTemplate } from '../dashboard-templates'

// E-Commerce & Retail Templates
export const ecommerceTemplates: DashboardTemplate[] = [
  {
    id: "product_performance",
    name: "Product Performance Dashboard",
    description: "Track product sales, inventory, and customer feedback across channels",
    icon: "🛍️",
    category: "ecommerce",
    sections: [
      {
        title: "Sales Overview",
        description: "Product sales metrics and trends",
        widgets: [
          {
            id: "sales_kpis",
            type: "kpi",
            title: "Key Sales Metrics",
            dataKey: "sales",
            config: {
              metrics: [
                { label: "Total Revenue", key: "revenue", format: "currency" },
                { label: "Units Sold", key: "units", format: "number" },
                { label: "Avg Order Value", key: "aov", format: "currency" },
                { label: "Conversion Rate", key: "conversion", format: "percentage" }
              ]
            }
          },
          {
            id: "sales_trend",
            type: "chart",
            title: "Sales Trend",
            dataKey: "sales_history",
            config: {
              chartType: "line",
              xAxis: "date",
              yAxis: "revenue"
            }
          }
        ]
      },
      {
        title: "Product Analysis",
        widgets: [
          {
            id: "top_products",
            type: "table",
            title: "Top Performing Products",
            dataKey: "products",
            config: {
              columns: ["Product", "Sales", "Revenue", "Stock", "Rating"]
            }
          },
          {
            id: "category_distribution",
            type: "chart",
            title: "Sales by Category",
            dataKey: "categories",
            config: {
              chartType: "pie",
              valueKey: "sales",
              labelKey: "category"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Analyze product performance with sales trends, inventory levels, and customer ratings"
  },
  {
    id: "customer_journey",
    name: "Customer Journey Analytics",
    description: "Understand customer behavior from acquisition to retention",
    icon: "🛤️",
    category: "ecommerce",
    sections: [
      {
        title: "Acquisition Funnel",
        widgets: [
          {
            id: "acquisition_funnel",
            type: "funnel",
            title: "Customer Acquisition",
            dataKey: "acquisition",
            config: {
              stages: ["Visitors", "Sign-ups", "First Purchase", "Repeat Purchase", "Loyal Customer"]
            }
          }
        ]
      },
      {
        title: "Customer Segments",
        widgets: [
          {
            id: "segment_analysis",
            type: "chart",
            title: "Customer Segmentation",
            dataKey: "segments",
            config: {
              chartType: "donut",
              valueKey: "count",
              labelKey: "segment"
            }
          },
          {
            id: "ltv_by_segment",
            type: "chart",
            title: "LTV by Segment",
            dataKey: "ltv_segments",
            config: {
              chartType: "bar",
              xAxis: "segment",
              yAxis: "ltv"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create customer journey dashboard with acquisition funnel and segmentation analysis"
  }
]

// SaaS & Technology Templates
export const saasTemplates: DashboardTemplate[] = [
  {
    id: "mrr_growth",
    name: "MRR/ARR Growth Tracker",
    description: "Monitor recurring revenue, growth rate, and subscription metrics",
    icon: "📊",
    category: "saas",
    sections: [
      {
        title: "Revenue Metrics",
        widgets: [
          {
            id: "revenue_kpis",
            type: "kpi",
            title: "Key Revenue Indicators",
            dataKey: "revenue",
            config: {
              metrics: [
                { label: "MRR", key: "mrr", format: "currency" },
                { label: "ARR", key: "arr", format: "currency" },
                { label: "Growth Rate", key: "growth", format: "percentage" },
                { label: "ARPU", key: "arpu", format: "currency" }
              ]
            }
          },
          {
            id: "mrr_movement",
            type: "chart",
            title: "MRR Movement",
            dataKey: "mrr_changes",
            config: {
              chartType: "waterfall",
              categories: ["New", "Expansion", "Contraction", "Churn", "Reactivation"]
            }
          }
        ]
      },
      {
        title: "Subscription Analytics",
        widgets: [
          {
            id: "plan_distribution",
            type: "chart",
            title: "Customers by Plan",
            dataKey: "plans",
            config: {
              chartType: "pie",
              valueKey: "customers",
              labelKey: "plan"
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
      }
    ],
    defaultPrompt: "Build SaaS metrics dashboard with MRR tracking, growth analysis, and retention cohorts"
  },
  {
    id: "churn_analysis",
    name: "Customer Churn Analysis",
    description: "Identify churn patterns and predict at-risk customers",
    icon: "🔄",
    category: "saas",
    sections: [
      {
        title: "Churn Overview",
        widgets: [
          {
            id: "churn_metrics",
            type: "kpi",
            title: "Churn Metrics",
            dataKey: "churn",
            config: {
              metrics: [
                { label: "Churn Rate", key: "rate", format: "percentage" },
                { label: "Revenue Churn", key: "revenue_churn", format: "percentage" },
                { label: "At Risk Customers", key: "at_risk", format: "number" },
                { label: "Saved This Month", key: "saved", format: "number" }
              ]
            }
          },
          {
            id: "churn_trend",
            type: "chart",
            title: "Churn Rate Trend",
            dataKey: "churn_history",
            config: {
              chartType: "line",
              xAxis: "month",
              yAxis: "churn_rate"
            }
          }
        ]
      },
      {
        title: "Risk Analysis",
        widgets: [
          {
            id: "risk_factors",
            type: "scorecard",
            title: "Churn Risk Factors",
            dataKey: "risk_factors",
            config: {
              criteria: [
                { name: "Low Usage", weight: 0.3, max: 10 },
                { name: "Support Tickets", weight: 0.2, max: 10 },
                { name: "Payment Issues", weight: 0.25, max: 10 },
                { name: "Feature Adoption", weight: 0.25, max: 10 }
              ]
            }
          },
          {
            id: "at_risk_list",
            type: "table",
            title: "At-Risk Customers",
            dataKey: "at_risk_customers",
            config: {
              columns: ["Customer", "Risk Score", "MRR", "Last Active", "Action"]
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create churn analysis dashboard with risk scoring and prediction models"
  }
]

// Healthcare Templates
export const healthcareTemplates: DashboardTemplate[] = [
  {
    id: "patient_flow",
    name: "Patient Flow Analytics",
    description: "Track patient admissions, wait times, and department utilization",
    icon: "🏥",
    category: "healthcare",
    sections: [
      {
        title: "Patient Metrics",
        widgets: [
          {
            id: "patient_kpis",
            type: "kpi",
            title: "Daily Patient Statistics",
            dataKey: "patients",
            config: {
              metrics: [
                { label: "Total Admissions", key: "admissions", format: "number" },
                { label: "Avg Wait Time", key: "wait_time", format: "minutes" },
                { label: "Bed Occupancy", key: "occupancy", format: "percentage" },
                { label: "ER Visits", key: "er_visits", format: "number" }
              ]
            }
          },
          {
            id: "department_flow",
            type: "funnel",
            title: "Patient Flow by Department",
            dataKey: "departments",
            config: {
              stages: ["ER", "Triage", "Treatment", "Admission", "Discharge"]
            }
          }
        ]
      },
      {
        title: "Resource Utilization",
        widgets: [
          {
            id: "bed_utilization",
            type: "progress",
            title: "Bed Utilization by Ward",
            dataKey: "wards",
            config: {
              categories: ["ICU", "Surgery", "Medical", "Pediatric", "Maternity"]
            }
          },
          {
            id: "staff_allocation",
            type: "chart",
            title: "Staff Allocation",
            dataKey: "staff",
            config: {
              chartType: "stacked-bar",
              xAxis: "department",
              yAxis: "staff_count"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Build patient flow dashboard with admissions, wait times, and resource utilization"
  },
  {
    id: "clinical_outcomes",
    name: "Clinical Outcomes Dashboard",
    description: "Monitor treatment effectiveness and patient outcomes",
    icon: "📋",
    category: "healthcare",
    sections: [
      {
        title: "Outcome Metrics",
        widgets: [
          {
            id: "outcome_kpis",
            type: "kpi",
            title: "Clinical Performance",
            dataKey: "outcomes",
            config: {
              metrics: [
                { label: "Success Rate", key: "success_rate", format: "percentage" },
                { label: "Readmission Rate", key: "readmission", format: "percentage" },
                { label: "Patient Satisfaction", key: "satisfaction", format: "score" },
                { label: "Avg Length of Stay", key: "los", format: "days" }
              ]
            }
          }
        ]
      },
      {
        title: "Treatment Analysis",
        widgets: [
          {
            id: "treatment_effectiveness",
            type: "chart",
            title: "Treatment Effectiveness by Condition",
            dataKey: "treatments",
            config: {
              chartType: "grouped-bar",
              xAxis: "condition",
              yAxis: "success_rate"
            }
          },
          {
            id: "outcome_scorecard",
            type: "scorecard",
            title: "Quality Indicators",
            dataKey: "quality",
            config: {
              criteria: [
                { name: "Clinical Excellence", weight: 0.3, max: 10 },
                { name: "Patient Safety", weight: 0.3, max: 10 },
                { name: "Care Coordination", weight: 0.2, max: 10 },
                { name: "Documentation", weight: 0.2, max: 10 }
              ]
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create clinical outcomes dashboard with success rates and quality metrics"
  }
]

// Marketing & Advertising Templates
export const marketingTemplates: DashboardTemplate[] = [
  {
    id: "campaign_performance",
    name: "Campaign Performance Suite",
    description: "Track marketing campaign ROI across all channels",
    icon: "📣",
    category: "marketing",
    sections: [
      {
        title: "Campaign Overview",
        widgets: [
          {
            id: "campaign_kpis",
            type: "kpi",
            title: "Campaign Metrics",
            dataKey: "campaigns",
            config: {
              metrics: [
                { label: "Total Spend", key: "spend", format: "currency" },
                { label: "Total Revenue", key: "revenue", format: "currency" },
                { label: "ROI", key: "roi", format: "percentage" },
                { label: "Cost per Acquisition", key: "cpa", format: "currency" }
              ]
            }
          },
          {
            id: "channel_performance",
            type: "chart",
            title: "Performance by Channel",
            dataKey: "channels",
            config: {
              chartType: "bar",
              xAxis: "channel",
              yAxis: "roi"
            }
          }
        ]
      },
      {
        title: "Campaign Analysis",
        widgets: [
          {
            id: "campaign_table",
            type: "table",
            title: "Active Campaigns",
            dataKey: "active_campaigns",
            config: {
              columns: ["Campaign", "Channel", "Spend", "Conversions", "ROI", "Status"]
            }
          },
          {
            id: "conversion_funnel",
            type: "funnel",
            title: "Conversion Funnel",
            dataKey: "funnel",
            config: {
              stages: ["Impressions", "Clicks", "Leads", "Qualified", "Customers"]
            }
          }
        ]
      }
    ],
    defaultPrompt: "Build marketing dashboard with campaign ROI, channel performance, and conversion tracking"
  },
  {
    id: "social_media_analytics",
    name: "Social Media Analytics",
    description: "Monitor social media engagement and growth across platforms",
    icon: "📱",
    category: "marketing",
    sections: [
      {
        title: "Social Overview",
        widgets: [
          {
            id: "social_kpis",
            type: "kpi",
            title: "Social Media Metrics",
            dataKey: "social",
            config: {
              metrics: [
                { label: "Total Followers", key: "followers", format: "number" },
                { label: "Engagement Rate", key: "engagement", format: "percentage" },
                { label: "Reach", key: "reach", format: "number" },
                { label: "Share of Voice", key: "sov", format: "percentage" }
              ]
            }
          },
          {
            id: "platform_growth",
            type: "chart",
            title: "Follower Growth by Platform",
            dataKey: "platforms",
            config: {
              chartType: "line",
              xAxis: "date",
              yAxis: "followers",
              series: ["Facebook", "Instagram", "Twitter", "LinkedIn"]
            }
          }
        ]
      },
      {
        title: "Engagement Analysis",
        widgets: [
          {
            id: "post_performance",
            type: "table",
            title: "Top Performing Posts",
            dataKey: "posts",
            config: {
              columns: ["Post", "Platform", "Likes", "Comments", "Shares", "Reach"]
            }
          },
          {
            id: "sentiment_analysis",
            type: "chart",
            title: "Sentiment Analysis",
            dataKey: "sentiment",
            config: {
              chartType: "pie",
              valueKey: "count",
              labelKey: "sentiment"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create social media dashboard with engagement metrics and sentiment analysis"
  }
]

// HR & People Analytics Templates
export const hrTemplates: DashboardTemplate[] = [
  {
    id: "employee_engagement",
    name: "Employee Engagement Survey",
    description: "Analyze employee satisfaction and engagement levels",
    icon: "👥",
    category: "hr",
    sections: [
      {
        title: "Engagement Overview",
        widgets: [
          {
            id: "engagement_kpis",
            type: "kpi",
            title: "Engagement Metrics",
            dataKey: "engagement",
            config: {
              metrics: [
                { label: "Overall Score", key: "overall", format: "score" },
                { label: "Participation Rate", key: "participation", format: "percentage" },
                { label: "eNPS Score", key: "enps", format: "number" },
                { label: "Retention Rate", key: "retention", format: "percentage" }
              ]
            }
          },
          {
            id: "engagement_trend",
            type: "chart",
            title: "Engagement Trend",
            dataKey: "engagement_history",
            config: {
              chartType: "line",
              xAxis: "quarter",
              yAxis: "score"
            }
          }
        ]
      },
      {
        title: "Department Analysis",
        widgets: [
          {
            id: "department_scores",
            type: "chart",
            title: "Engagement by Department",
            dataKey: "departments",
            config: {
              chartType: "bar",
              xAxis: "department",
              yAxis: "score"
            }
          },
          {
            id: "engagement_drivers",
            type: "scorecard",
            title: "Engagement Drivers",
            dataKey: "drivers",
            config: {
              criteria: [
                { name: "Work-Life Balance", weight: 0.2, max: 10 },
                { name: "Career Development", weight: 0.25, max: 10 },
                { name: "Recognition", weight: 0.2, max: 10 },
                { name: "Compensation", weight: 0.2, max: 10 },
                { name: "Leadership", weight: 0.15, max: 10 }
              ]
            }
          }
        ]
      }
    ],
    defaultPrompt: "Build employee engagement dashboard with satisfaction scores and retention metrics"
  },
  {
    id: "recruitment_pipeline",
    name: "Recruitment Pipeline",
    description: "Track hiring process from application to onboarding",
    icon: "🎯",
    category: "hr",
    sections: [
      {
        title: "Recruitment Overview",
        widgets: [
          {
            id: "recruitment_kpis",
            type: "kpi",
            title: "Hiring Metrics",
            dataKey: "recruitment",
            config: {
              metrics: [
                { label: "Open Positions", key: "open", format: "number" },
                { label: "Time to Fill", key: "time_to_fill", format: "days" },
                { label: "Cost per Hire", key: "cost_per_hire", format: "currency" },
                { label: "Offer Acceptance", key: "acceptance", format: "percentage" }
              ]
            }
          },
          {
            id: "hiring_funnel",
            type: "funnel",
            title: "Recruitment Funnel",
            dataKey: "pipeline",
            config: {
              stages: ["Applications", "Screening", "Interview", "Final Round", "Offer", "Hired"]
            }
          }
        ]
      },
      {
        title: "Pipeline Analysis",
        widgets: [
          {
            id: "positions_table",
            type: "table",
            title: "Active Positions",
            dataKey: "positions",
            config: {
              columns: ["Position", "Department", "Applicants", "Stage", "Days Open", "Priority"]
            }
          },
          {
            id: "source_effectiveness",
            type: "chart",
            title: "Source Effectiveness",
            dataKey: "sources",
            config: {
              chartType: "pie",
              valueKey: "hires",
              labelKey: "source"
            }
          }
        ]
      }
    ],
    defaultPrompt: "Create recruitment dashboard with pipeline tracking and source analysis"
  }
]

// Real Estate Templates
export const realEstateTemplates: DashboardTemplate[] = [
  {
    id: "property_portfolio",
    name: "Property Portfolio Analysis",
    description: "Monitor property performance, occupancy, and returns",
    icon: "🏢",
    category: "real_estate",
    sections: [
      {
        title: "Portfolio Overview",
        widgets: [
          {
            id: "portfolio_kpis",
            type: "kpi",
            title: "Portfolio Metrics",
            dataKey: "portfolio",
            config: {
              metrics: [
                { label: "Total Value", key: "value", format: "currency" },
                { label: "Properties", key: "count", format: "number" },
                { label: "Occupancy Rate", key: "occupancy", format: "percentage" },
                { label: "Annual Return", key: "return", format: "percentage" }
              ]
            }
          },
          {
            id: "property_distribution",
            type: "chart",
            title: "Properties by Type",
            dataKey: "property_types",
            config: {
              chartType: "donut",
              valueKey: "count",
              labelKey: "type"
            }
          }
        ]
      },
      {
        title: "Performance Analysis",
        widgets: [
          {
            id: "property_table",
            type: "table",
            title: "Property Performance",
            dataKey: "properties",
            config: {
              columns: ["Property", "Location", "Type", "Occupancy", "Revenue", "ROI"]
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
      }
    ],
    defaultPrompt: "Build property portfolio dashboard with occupancy rates and ROI analysis"
  }
]

// Export all templates
export const allIndustryTemplates = [
  ...ecommerceTemplates,
  ...saasTemplates,
  ...healthcareTemplates,
  ...marketingTemplates,
  ...hrTemplates,
  ...realEstateTemplates
]

// Template categories
export const templateCategories = {
  ecommerce: {
    name: "E-Commerce & Retail",
    icon: "🛍️",
    templates: ecommerceTemplates
  },
  saas: {
    name: "SaaS & Technology",
    icon: "💻",
    templates: saasTemplates
  },
  healthcare: {
    name: "Healthcare",
    icon: "🏥",
    templates: healthcareTemplates
  },
  marketing: {
    name: "Marketing & Advertising",
    icon: "📣",
    templates: marketingTemplates
  },
  hr: {
    name: "HR & People Analytics",
    icon: "👥",
    templates: hrTemplates
  },
  real_estate: {
    name: "Real Estate",
    icon: "🏢",
    templates: realEstateTemplates
  }
}