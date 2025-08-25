export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  variables: string[] // Column names or data fields to map
  sections: ReportSection[]
  prompt: string // AI prompt for generating content
}

export interface ReportSection {
  title: string
  type: 'summary' | 'analysis' | 'table' | 'chart' | 'insights'
  prompt?: string
}

export interface EmailTemplate {
  id: string
  name: string
  description: string
  category: string
  subject: string
  body: string
  variables: string[] // Personalization tokens
  tone: 'formal' | 'casual' | 'urgent' | 'friendly'
}

export const reportTemplateCategories = {
  sales: {
    name: "Sales Reports",
    templates: [
      {
        id: "pipeline-summary",
        name: "Pipeline Summary",
        description: "Overview of sales pipeline with deal stages and values",
        category: "sales",
        variables: ["Company", "Deal_Value", "Stage", "Close_Date", "Owner"],
        sections: [
          { title: "Executive Summary", type: "summary" },
          { title: "Pipeline Overview", type: "analysis" },
          { title: "Deal Breakdown", type: "table" },
          { title: "Key Insights", type: "insights" }
        ],
        prompt: "Generate a professional sales pipeline report summarizing deal stages, total pipeline value, and win probability. Focus on actionable insights and next steps."
      },
      {
        id: "win-loss-analysis",
        name: "Win/Loss Analysis",
        description: "Analysis of won and lost deals with patterns and insights",
        category: "sales",
        variables: ["Company", "Deal_Value", "Status", "Loss_Reason", "Competitor"],
        sections: [
          { title: "Win/Loss Summary", type: "summary" },
          { title: "Win Rate Analysis", type: "analysis" },
          { title: "Loss Reasons", type: "chart" },
          { title: "Competitive Analysis", type: "insights" }
        ],
        prompt: "Analyze win/loss patterns, identify key success factors and common loss reasons. Provide recommendations to improve win rate."
      },
      {
        id: "territory-performance",
        name: "Territory Performance",
        description: "Performance metrics by sales territory or region",
        category: "sales",
        variables: ["Territory", "Revenue", "Quota", "Growth", "Rep_Count"],
        sections: [
          { title: "Territory Overview", type: "summary" },
          { title: "Performance Metrics", type: "table" },
          { title: "Growth Trends", type: "chart" },
          { title: "Recommendations", type: "insights" }
        ],
        prompt: "Generate territory performance report showing revenue vs quota, growth trends, and recommendations for underperforming territories."
      },
      {
        id: "sales-forecast",
        name: "Sales Forecast",
        description: "Quarterly or annual sales forecast with confidence levels",
        category: "sales",
        variables: ["Quarter", "Forecast", "Pipeline", "Closed", "Target"],
        sections: [
          { title: "Forecast Summary", type: "summary" },
          { title: "Quarter-by-Quarter", type: "table" },
          { title: "Pipeline Coverage", type: "analysis" },
          { title: "Risk Assessment", type: "insights" }
        ],
        prompt: "Create sales forecast report with confidence levels, pipeline coverage analysis, and risk factors that could impact forecast."
      }
    ]
  },
  finance: {
    name: "Financial Reports",
    templates: [
      {
        id: "revenue-summary",
        name: "Revenue Summary",
        description: "Monthly or quarterly revenue breakdown and trends",
        category: "finance",
        variables: ["Period", "Revenue", "Cost", "Margin", "Growth"],
        sections: [
          { title: "Revenue Overview", type: "summary" },
          { title: "Revenue Breakdown", type: "table" },
          { title: "Margin Analysis", type: "analysis" },
          { title: "Growth Trends", type: "chart" }
        ],
        prompt: "Generate revenue summary report with period-over-period growth, margin analysis, and key revenue drivers."
      },
      {
        id: "budget-variance",
        name: "Budget Variance Report",
        description: "Actual vs budget comparison with variance analysis",
        category: "finance",
        variables: ["Department", "Budget", "Actual", "Variance", "Category"],
        sections: [
          { title: "Variance Summary", type: "summary" },
          { title: "Department Breakdown", type: "table" },
          { title: "Variance Analysis", type: "analysis" },
          { title: "Action Items", type: "insights" }
        ],
        prompt: "Analyze budget vs actual spending, identify significant variances, and provide explanations and recommendations."
      },
      {
        id: "cash-flow",
        name: "Cash Flow Analysis",
        description: "Cash flow statement with inflows and outflows",
        category: "finance",
        variables: ["Period", "Inflows", "Outflows", "Net_Cash", "Balance"],
        sections: [
          { title: "Cash Flow Summary", type: "summary" },
          { title: "Cash Movement", type: "table" },
          { title: "Trend Analysis", type: "chart" },
          { title: "Projections", type: "insights" }
        ],
        prompt: "Create cash flow analysis showing sources and uses of cash, trends, and projections for future periods."
      },
      {
        id: "pl-statement",
        name: "P&L Statement",
        description: "Profit and loss statement with key metrics",
        category: "finance",
        variables: ["Line_Item", "Current_Period", "Prior_Period", "YTD", "Budget"],
        sections: [
          { title: "P&L Summary", type: "summary" },
          { title: "Income Statement", type: "table" },
          { title: "Profitability Analysis", type: "analysis" },
          { title: "Key Metrics", type: "insights" }
        ],
        prompt: "Generate P&L statement with year-over-year comparison, profitability metrics, and analysis of key line items."
      }
    ]
  },
  executive: {
    name: "Executive Reports",
    templates: [
      {
        id: "board-deck",
        name: "Board Deck Summary",
        description: "High-level metrics and insights for board presentation",
        category: "executive",
        variables: ["Metric", "Current", "Target", "Status", "Notes"],
        sections: [
          { title: "Executive Summary", type: "summary" },
          { title: "Key Metrics", type: "table" },
          { title: "Strategic Initiatives", type: "analysis" },
          { title: "Outlook", type: "insights" }
        ],
        prompt: "Create executive-level board report with key metrics, strategic progress, challenges, and forward-looking statements."
      },
      {
        id: "kpi-dashboard",
        name: "KPI Dashboard",
        description: "Key performance indicators across departments",
        category: "executive",
        variables: ["KPI", "Value", "Target", "Trend", "Department"],
        sections: [
          { title: "KPI Overview", type: "summary" },
          { title: "Performance Metrics", type: "table" },
          { title: "Trend Analysis", type: "chart" },
          { title: "Action Items", type: "insights" }
        ],
        prompt: "Generate KPI dashboard showing performance against targets, trends, and areas requiring attention."
      },
      {
        id: "quarterly-review",
        name: "Quarterly Business Review",
        description: "Comprehensive quarterly performance review",
        category: "executive",
        variables: ["Department", "Revenue", "Cost", "Headcount", "Goals"],
        sections: [
          { title: "Quarter Summary", type: "summary" },
          { title: "Financial Performance", type: "analysis" },
          { title: "Operational Metrics", type: "table" },
          { title: "Next Quarter Focus", type: "insights" }
        ],
        prompt: "Create quarterly business review covering financial performance, operational metrics, achievements, and priorities for next quarter."
      }
    ]
  },
  operations: {
    name: "Operations Reports",
    templates: [
      {
        id: "inventory-status",
        name: "Inventory Status Report",
        description: "Current inventory levels and turnover analysis",
        category: "operations",
        variables: ["Product", "Quantity", "Value", "Turnover", "Status"],
        sections: [
          { title: "Inventory Summary", type: "summary" },
          { title: "Stock Levels", type: "table" },
          { title: "Turnover Analysis", type: "analysis" },
          { title: "Recommendations", type: "insights" }
        ],
        prompt: "Generate inventory report showing current stock levels, turnover rates, and recommendations for optimization."
      },
      {
        id: "supply-chain",
        name: "Supply Chain Metrics",
        description: "Supply chain performance and efficiency metrics",
        category: "operations",
        variables: ["Supplier", "Lead_Time", "Quality", "Cost", "Performance"],
        sections: [
          { title: "Supply Chain Overview", type: "summary" },
          { title: "Supplier Performance", type: "table" },
          { title: "Efficiency Metrics", type: "analysis" },
          { title: "Risk Assessment", type: "insights" }
        ],
        prompt: "Analyze supply chain performance including lead times, quality metrics, and supplier reliability."
      },
      {
        id: "quality-report",
        name: "Quality Report",
        description: "Quality metrics and defect analysis",
        category: "operations",
        variables: ["Product", "Defects", "Returns", "Quality_Score", "Action"],
        sections: [
          { title: "Quality Summary", type: "summary" },
          { title: "Defect Analysis", type: "table" },
          { title: "Trend Analysis", type: "chart" },
          { title: "Improvement Plan", type: "insights" }
        ],
        prompt: "Create quality report analyzing defect rates, return reasons, and improvement recommendations."
      }
    ]
  },
  customer: {
    name: "Customer Reports",
    templates: [
      {
        id: "satisfaction-survey",
        name: "Customer Satisfaction Report",
        description: "Analysis of customer satisfaction survey results",
        category: "customer",
        variables: ["Customer", "Score", "Category", "Feedback", "Segment"],
        sections: [
          { title: "Satisfaction Overview", type: "summary" },
          { title: "Score Breakdown", type: "table" },
          { title: "Feedback Analysis", type: "analysis" },
          { title: "Action Plan", type: "insights" }
        ],
        prompt: "Analyze customer satisfaction scores, identify trends and patterns, and provide actionable recommendations."
      },
      {
        id: "churn-analysis",
        name: "Churn Analysis",
        description: "Customer churn patterns and retention insights",
        category: "customer",
        variables: ["Customer", "Churn_Date", "Reason", "Revenue_Lost", "Tenure"],
        sections: [
          { title: "Churn Summary", type: "summary" },
          { title: "Churn Reasons", type: "table" },
          { title: "Pattern Analysis", type: "analysis" },
          { title: "Retention Strategy", type: "insights" }
        ],
        prompt: "Analyze customer churn patterns, identify root causes, and recommend retention strategies."
      },
      {
        id: "engagement-metrics",
        name: "Engagement Metrics",
        description: "Customer engagement and usage patterns",
        category: "customer",
        variables: ["Customer", "Usage", "Engagement_Score", "Last_Activity", "Tier"],
        sections: [
          { title: "Engagement Overview", type: "summary" },
          { title: "Usage Metrics", type: "table" },
          { title: "Engagement Trends", type: "chart" },
          { title: "Recommendations", type: "insights" }
        ],
        prompt: "Generate engagement report showing usage patterns, engagement scores, and recommendations for improvement."
      }
    ]
  }
}

export const emailTemplateCategories = {
  sales: {
    name: "Sales Outreach",
    templates: [
      {
        id: "cold-outreach",
        name: "Cold Outreach",
        description: "Initial outreach to potential customers",
        category: "sales",
        subject: "Quick question about {Company}'s {Challenge}",
        body: `Hi {First_Name},

I noticed that {Company} is {Observation}. Many companies in {Industry} struggle with {Challenge}.

We've helped similar companies like {Similar_Company} to {Achievement}.

Would you be open to a brief 15-minute call to discuss how we might help {Company} achieve similar results?

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Industry", "Challenge", "Observation", "Similar_Company", "Achievement", "Sender_Name"],
        tone: "friendly" as const
      },
      {
        id: "follow-up",
        name: "Follow-up Email",
        description: "Follow up after initial contact or meeting",
        category: "sales",
        subject: "Following up on our conversation",
        body: `Hi {First_Name},

Thank you for taking the time to speak with me {Meeting_Date}. I enjoyed learning about {Company}'s {Initiative}.

As discussed, I'm attaching {Document} that outlines how we can help with {Solution}.

Key benefits for {Company}:
• {Benefit_1}
• {Benefit_2}
• {Benefit_3}

What would be the best next step from your perspective?

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Meeting_Date", "Initiative", "Document", "Solution", "Benefit_1", "Benefit_2", "Benefit_3", "Sender_Name"],
        tone: "formal" as const
      },
      {
        id: "proposal",
        name: "Proposal Email",
        description: "Sending a proposal or quote",
        category: "sales",
        subject: "Proposal for {Company} - {Solution}",
        body: `Dear {First_Name},

Following our discussions about {Need}, I'm pleased to present our proposal for {Company}.

Investment: {Price}
Timeline: {Timeline}
Expected ROI: {ROI}

The proposal includes:
• {Deliverable_1}
• {Deliverable_2}
• {Deliverable_3}

This proposal is valid until {Expiry_Date}. I'm available to discuss any questions you may have.

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Need", "Solution", "Price", "Timeline", "ROI", "Deliverable_1", "Deliverable_2", "Deliverable_3", "Expiry_Date", "Sender_Name"],
        tone: "formal" as const
      },
      {
        id: "deal-closure",
        name: "Deal Closure",
        description: "Final push to close a deal",
        category: "sales",
        subject: "Ready to move forward with {Solution}?",
        body: `Hi {First_Name},

I wanted to check in regarding our proposal for {Solution}. 

As we discussed, implementing this by {Target_Date} would allow {Company} to {Benefit}.

To secure your {Incentive}, we would need to finalize by {Deadline}.

Are there any remaining questions I can address to help you make the best decision for {Company}?

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Solution", "Target_Date", "Benefit", "Incentive", "Deadline", "Sender_Name"],
        tone: "urgent" as const
      }
    ]
  },
  customer: {
    name: "Customer Communication",
    templates: [
      {
        id: "welcome",
        name: "Welcome Email",
        description: "Welcome new customers",
        category: "customer",
        subject: "Welcome to {Product_Name}, {First_Name}!",
        body: `Hi {First_Name},

Welcome to {Product_Name}! We're thrilled to have {Company} as part of our community.

To help you get started:
1. {Step_1}
2. {Step_2}
3. {Step_3}

Your dedicated success manager is {CSM_Name}, who will reach out within {Timeframe}.

If you have any questions, don't hesitate to reach out to our support team at {Support_Email}.

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Product_Name", "Step_1", "Step_2", "Step_3", "CSM_Name", "Timeframe", "Support_Email", "Sender_Name"],
        tone: "friendly" as const
      },
      {
        id: "service-update",
        name: "Service Update",
        description: "Notify customers about service changes",
        category: "customer",
        subject: "Important update about your {Service} service",
        body: `Dear {First_Name},

We're writing to inform you about an update to your {Service} service that will take effect on {Date}.

What's changing:
• {Change_1}
• {Change_2}

What this means for you:
{Impact}

No action is required on your part. If you have any questions, please contact us at {Support_Email}.

Thank you for being a valued customer.

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Service", "Date", "Change_1", "Change_2", "Impact", "Support_Email", "Sender_Name"],
        tone: "formal" as const
      },
      {
        id: "renewal-reminder",
        name: "Renewal Reminder",
        description: "Remind customers about upcoming renewal",
        category: "customer",
        subject: "Your {Service} renewal is coming up",
        body: `Hi {First_Name},

Your {Service} subscription for {Company} will renew on {Renewal_Date}.

Current plan: {Current_Plan}
Renewal amount: {Amount}

Over the past {Period}, you've {Achievement}. We'd love to continue supporting your success.

If you'd like to make any changes to your plan or have questions, please let me know by {Response_Date}.

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Company", "Service", "Renewal_Date", "Current_Plan", "Amount", "Period", "Achievement", "Response_Date", "Sender_Name"],
        tone: "friendly" as const
      }
    ]
  },
  internal: {
    name: "Internal Updates",
    templates: [
      {
        id: "team-update",
        name: "Team Update",
        description: "Weekly or monthly team update",
        category: "internal",
        subject: "Team Update - {Period}",
        body: `Team,

Here's our update for {Period}:

Achievements:
• {Achievement_1}
• {Achievement_2}
• {Achievement_3}

Priorities for {Next_Period}:
• {Priority_1}
• {Priority_2}
• {Priority_3}

Kudos to {Recognition} for {Accomplishment}.

Please review and let me know if you have any questions.

Best,
{Sender_Name}`,
        variables: ["Period", "Achievement_1", "Achievement_2", "Achievement_3", "Next_Period", "Priority_1", "Priority_2", "Priority_3", "Recognition", "Accomplishment", "Sender_Name"],
        tone: "casual" as const
      },
      {
        id: "project-status",
        name: "Project Status",
        description: "Project status update for stakeholders",
        category: "internal",
        subject: "{Project_Name} - Status Update",
        body: `Hi all,

Here's the latest status update for {Project_Name}:

Status: {Status}
Completion: {Percentage}%
Target Date: {Target_Date}

Recent Progress:
• {Progress_1}
• {Progress_2}

Next Steps:
• {Next_Step_1}
• {Next_Step_2}

Blockers/Risks:
{Blockers}

Let me know if you need any additional information.

Best,
{Sender_Name}`,
        variables: ["Project_Name", "Status", "Percentage", "Target_Date", "Progress_1", "Progress_2", "Next_Step_1", "Next_Step_2", "Blockers", "Sender_Name"],
        tone: "formal" as const
      }
    ]
  },
  marketing: {
    name: "Marketing",
    templates: [
      {
        id: "newsletter",
        name: "Newsletter",
        description: "Monthly company newsletter",
        category: "marketing",
        subject: "{Company} Newsletter - {Month} Edition",
        body: `Hi {First_Name},

Welcome to our {Month} newsletter! Here's what's new:

📈 Key Highlights:
• {Highlight_1}
• {Highlight_2}

🎯 Feature Spotlight:
{Feature_Description}

📚 Resource of the Month:
{Resource}

🎉 Customer Success:
{Customer_Story}

Stay tuned for more updates next month!

Best regards,
The {Company} Team`,
        variables: ["First_Name", "Company", "Month", "Highlight_1", "Highlight_2", "Feature_Description", "Resource", "Customer_Story"],
        tone: "friendly" as const
      },
      {
        id: "product-announcement",
        name: "Product Announcement",
        description: "Announce new product or feature",
        category: "marketing",
        subject: "Introducing {Product_Name} - {Tagline}",
        body: `Hi {First_Name},

We're excited to announce {Product_Name}!

{Product_Description}

Key Benefits:
✓ {Benefit_1}
✓ {Benefit_2}
✓ {Benefit_3}

{Special_Offer}

Learn more at {Link} or reply to this email with any questions.

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Product_Name", "Tagline", "Product_Description", "Benefit_1", "Benefit_2", "Benefit_3", "Special_Offer", "Link", "Sender_Name"],
        tone: "friendly" as const
      },
      {
        id: "event-invitation",
        name: "Event Invitation",
        description: "Invite to webinar or event",
        category: "marketing",
        subject: "You're invited: {Event_Name}",
        body: `Hi {First_Name},

You're invited to join us for {Event_Name}!

📅 Date: {Date}
🕐 Time: {Time}
📍 Location: {Location}

What you'll learn:
• {Learning_1}
• {Learning_2}
• {Learning_3}

{Speaker_Info}

Space is limited - register now at {Registration_Link}

Hope to see you there!

Best regards,
{Sender_Name}`,
        variables: ["First_Name", "Event_Name", "Date", "Time", "Location", "Learning_1", "Learning_2", "Learning_3", "Speaker_Info", "Registration_Link", "Sender_Name"],
        tone: "friendly" as const
      }
    ]
  }
}