// Flexible template system that works with column mapping

export interface FieldType {
  key: string
  label: string
  type: 'date' | 'numeric' | 'category' | 'text' | 'entity' | 'boolean'
  required: boolean
  description?: string
  defaultValue?: any
  validation?: (value: any) => boolean
  transform?: (value: any) => any
}

export interface FlexibleWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'scorecard' | 'funnel' | 'progress'
  title: string
  description?: string
  requiredFields: string[] // References to field keys
  optionalFields?: string[]
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
    aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max'
    groupBy?: string[]
    sortBy?: string
    limit?: number
    [key: string]: any
  }
}

export interface FlexibleSection {
  id: string
  title: string
  description?: string
  widgets: FlexibleWidget[]
}

export interface FlexibleTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  
  // Define what data this template needs
  requiredFields: FieldType[]
  optionalFields?: FieldType[]
  
  // The dashboard structure
  sections: FlexibleSection[]
  
  // Sample data for preview
  sampleData?: any[]
  
  // Suggestions for enrichment if data is missing
  enrichmentSuggestions?: {
    field: string
    prompt: string
  }[]
}

// Example: Sales Dashboard with flexible fields
export const flexibleSalesDashboard: FlexibleTemplate = {
  id: 'sales_dashboard_flex',
  name: 'Sales Performance Dashboard',
  description: 'Analyze sales trends, top performers, and revenue metrics',
  icon: '📊',
  category: 'sales',
  
  requiredFields: [
    {
      key: 'date',
      label: 'Transaction Date',
      type: 'date',
      required: true,
      description: 'Date of the sale or transaction'
    },
    {
      key: 'amount',
      label: 'Sale Amount',
      type: 'numeric',
      required: true,
      description: 'Revenue or transaction value'
    }
  ],
  
  optionalFields: [
    {
      key: 'product',
      label: 'Product/Service',
      type: 'category',
      required: false,
      description: 'What was sold'
    },
    {
      key: 'customer',
      label: 'Customer',
      type: 'entity',
      required: false,
      description: 'Who made the purchase'
    },
    {
      key: 'region',
      label: 'Region/Location',
      type: 'category',
      required: false,
      description: 'Geographic information'
    },
    {
      key: 'salesperson',
      label: 'Sales Rep',
      type: 'entity',
      required: false,
      description: 'Who made the sale'
    }
  ],
  
  sections: [
    {
      id: 'overview',
      title: 'Sales Overview',
      description: 'Key performance indicators',
      widgets: [
        {
          id: 'total_revenue',
          type: 'kpi',
          title: 'Total Revenue',
          requiredFields: ['amount'],
          config: {
            aggregation: 'sum',
            format: 'currency'
          }
        },
        {
          id: 'revenue_trend',
          type: 'chart',
          title: 'Revenue Trend',
          requiredFields: ['date', 'amount'],
          config: {
            chartType: 'line',
            aggregation: 'sum',
            groupBy: ['date']
          }
        }
      ]
    },
    {
      id: 'breakdown',
      title: 'Sales Breakdown',
      description: 'Detailed analysis',
      widgets: [
        {
          id: 'by_product',
          type: 'chart',
          title: 'Sales by Product',
          requiredFields: ['amount'],
          optionalFields: ['product'],
          config: {
            chartType: 'bar',
            aggregation: 'sum',
            groupBy: ['product']
          }
        },
        {
          id: 'top_customers',
          type: 'table',
          title: 'Top Customers',
          requiredFields: ['amount'],
          optionalFields: ['customer'],
          config: {
            aggregation: 'sum',
            groupBy: ['customer'],
            sortBy: 'amount',
            limit: 10
          }
        }
      ]
    }
  ],
  
  sampleData: [
    { date: '2024-01-01', amount: 5000, product: 'Widget A', customer: 'Acme Corp', region: 'North' },
    { date: '2024-01-02', amount: 3500, product: 'Widget B', customer: 'Tech Inc', region: 'South' },
    { date: '2024-01-03', amount: 7200, product: 'Widget A', customer: 'Global Ltd', region: 'East' },
  ],
  
  enrichmentSuggestions: [
    {
      field: 'customer_size',
      prompt: 'Add company employee count for each customer'
    },
    {
      field: 'customer_industry',
      prompt: 'Add industry classification for each customer'
    }
  ]
}

// Customer Analysis Template
export const flexibleCustomerDashboard: FlexibleTemplate = {
  id: 'customer_dashboard_flex',
  name: 'Customer Analytics Dashboard',
  description: 'Understand customer behavior, segments, and lifetime value',
  icon: '👥',
  category: 'customer',
  
  requiredFields: [
    {
      key: 'customer_id',
      label: 'Customer Identifier',
      type: 'entity',
      required: true,
      description: 'Unique customer ID or name'
    },
    {
      key: 'transaction_value',
      label: 'Transaction Value',
      type: 'numeric',
      required: true,
      description: 'Purchase or transaction amount'
    }
  ],
  
  optionalFields: [
    {
      key: 'acquisition_date',
      label: 'First Purchase Date',
      type: 'date',
      required: false
    },
    {
      key: 'last_purchase_date',
      label: 'Last Purchase Date',
      type: 'date',
      required: false
    },
    {
      key: 'segment',
      label: 'Customer Segment',
      type: 'category',
      required: false
    },
    {
      key: 'churn_risk',
      label: 'Churn Risk Score',
      type: 'numeric',
      required: false
    }
  ],
  
  sections: [
    {
      id: 'customer_overview',
      title: 'Customer Overview',
      widgets: [
        {
          id: 'total_customers',
          type: 'kpi',
          title: 'Total Customers',
          requiredFields: ['customer_id'],
          config: {
            aggregation: 'count',
            unique: true
          }
        },
        {
          id: 'avg_value',
          type: 'kpi',
          title: 'Average Customer Value',
          requiredFields: ['customer_id', 'transaction_value'],
          config: {
            aggregation: 'average',
            groupBy: ['customer_id'],
            format: 'currency'
          }
        }
      ]
    }
  ],
  
  sampleData: [
    { customer_id: 'CUST001', transaction_value: 1500, acquisition_date: '2023-01-15', segment: 'Premium' },
    { customer_id: 'CUST002', transaction_value: 750, acquisition_date: '2023-03-20', segment: 'Standard' },
  ]
}

// Function to map user columns to template fields
export function mapColumnsToTemplate(
  template: FlexibleTemplate,
  columnMappings: Record<string, string>,
  data: any[]
): any[] {
  return data.map(row => {
    const mappedRow: any = {}
    
    // Map required fields
    template.requiredFields.forEach(field => {
      const userColumn = columnMappings[field.key]
      if (userColumn && row[userColumn] !== undefined) {
        mappedRow[field.key] = field.transform 
          ? field.transform(row[userColumn])
          : row[userColumn]
      }
    })
    
    // Map optional fields
    template.optionalFields?.forEach(field => {
      const userColumn = columnMappings[field.key]
      if (userColumn && row[userColumn] !== undefined) {
        mappedRow[field.key] = field.transform 
          ? field.transform(row[userColumn])
          : row[userColumn]
      }
    })
    
    return mappedRow
  })
}

// Function to validate if data meets template requirements
export function validateDataForTemplate(
  template: FlexibleTemplate,
  columnMappings: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  template.requiredFields.forEach(field => {
    if (!columnMappings[field.key]) {
      missing.push(field.label)
    }
  })
  
  return {
    valid: missing.length === 0,
    missing
  }
}

// Export all flexible templates
export const flexibleTemplates: FlexibleTemplate[] = [
  flexibleSalesDashboard,
  flexibleCustomerDashboard,
]

// Get template by ID
export function getFlexibleTemplate(id: string): FlexibleTemplate | undefined {
  return flexibleTemplates.find(t => t.id === id)
}