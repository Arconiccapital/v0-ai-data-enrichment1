export interface ProcessedDashboardData {
  companies: CompanyData[]
  metrics: DashboardMetrics
  distributions: DistributionData
  trends: TrendData[]
  scores: ScoreData
}

export interface CompanyData {
  name: string
  stage?: string
  sector?: string
  revenue?: number
  growth?: number
  burnRate?: number
  runway?: number
  valuation?: number
  employees?: number
  founded?: string
  location?: string
  website?: string
  description?: string
  scores?: {
    market?: number
    team?: number
    product?: number
    financial?: number
    overall?: number
  }
  risks?: {
    execution?: number
    market?: number
    financial?: number
    overall?: string
  }
}

export interface DashboardMetrics {
  totalCompanies: number
  totalValuation: number
  averageValuation: number
  medianValuation: number
  totalRevenue: number
  averageGrowth: number
  averageBurnRate: number
  averageRunway: number
  stages: Record<string, number>
  sectors: Record<string, number>
}

export interface DistributionData {
  byStage: Array<{ name: string; value: number; percentage: number }>
  bySector: Array<{ name: string; value: number; percentage: number }>
  byLocation: Array<{ name: string; value: number; percentage: number }>
  byRisk: Array<{ name: string; value: number; percentage: number }>
}

export interface TrendData {
  date: string
  revenue?: number
  growth?: number
  valuation?: number
  dealCount?: number
}

export interface ScoreData {
  marketScore: ScoreCriteria[]
  teamScore: ScoreCriteria[]
  productScore: ScoreCriteria[]
  financialScore: ScoreCriteria[]
  riskScore: ScoreCriteria[]
}

export interface ScoreCriteria {
  name: string
  score: number
  max: number
  weight: number
  description?: string
}

export function processDashboardData(
  headers: string[],
  rows: string[][],
  template?: any
): ProcessedDashboardData {
  // Map headers to indices for easier access
  const headerMap = new Map<string, number>()
  headers.forEach((header, index) => {
    headerMap.set(header.toLowerCase(), index)
  })

  // Process each company/row
  const companies: CompanyData[] = rows.map((row) => {
    return extractCompanyData(row, headerMap, headers)
  })

  // Calculate metrics
  const metrics = calculateMetrics(companies)

  // Generate distributions
  const distributions = generateDistributions(companies)

  // Generate trend data (mock for now, would need time-series data)
  const trends = generateTrends(companies)

  // Calculate scores based on template criteria
  const scores = calculateScores(companies, template)

  return {
    companies,
    metrics,
    distributions,
    trends,
    scores
  }
}

function extractCompanyData(
  row: string[],
  headerMap: Map<string, number>,
  headers: string[]
): CompanyData {
  const getValue = (keys: string[]): string | undefined => {
    for (const key of keys) {
      const index = headerMap.get(key.toLowerCase())
      if (index !== undefined && row[index]) {
        return row[index]
      }
    }
    // Try to find by partial match
    for (const key of keys) {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(key.toLowerCase())
      )
      if (index !== -1 && row[index]) {
        return row[index]
      }
    }
    return undefined
  }

  const parseNumber = (value: string | undefined): number | undefined => {
    if (!value) return undefined
    // Remove common formatting
    const cleaned = value.replace(/[$,K%M]/gi, '')
    const num = parseFloat(cleaned)
    // Handle K/M suffixes
    if (value.toUpperCase().includes('K')) return num * 1000
    if (value.toUpperCase().includes('M')) return num * 1000000
    return isNaN(num) ? undefined : num
  }

  const company: CompanyData = {
    name: getValue(['company', 'name', 'startup']) || `Company ${row[0]}`,
    stage: getValue(['stage', 'round', 'series']),
    sector: getValue(['sector', 'industry', 'category']),
    revenue: parseNumber(getValue(['revenue', 'arr', 'mrr'])),
    growth: parseNumber(getValue(['growth', 'growth rate', 'yoy'])),
    burnRate: parseNumber(getValue(['burn', 'burn rate', 'monthly burn'])),
    runway: parseNumber(getValue(['runway', 'months runway', 'cash runway'])),
    valuation: parseNumber(getValue(['valuation', 'value', 'post-money'])),
    employees: parseNumber(getValue(['employees', 'team size', 'headcount'])),
    founded: getValue(['founded', 'year founded', 'established']),
    location: getValue(['location', 'city', 'hq', 'headquarters']),
    website: getValue(['website', 'url', 'site']),
    description: getValue(['description', 'about', 'summary'])
  }

  // Calculate scores if data is available
  company.scores = {
    market: calculateMarketScore(company),
    team: calculateTeamScore(company),
    product: calculateProductScore(company),
    financial: calculateFinancialScore(company),
    overall: 0
  }
  
  // Calculate overall score as weighted average
  const scores = Object.values(company.scores).filter(s => s !== undefined) as number[]
  company.scores.overall = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0

  // Calculate risk scores
  company.risks = {
    execution: calculateExecutionRisk(company),
    market: calculateMarketRisk(company),
    financial: calculateFinancialRisk(company),
    overall: 'Medium'
  }

  // Determine overall risk level
  const riskScores = [company.risks.execution, company.risks.market, company.risks.financial]
    .filter(r => r !== undefined) as number[]
  const avgRisk = riskScores.length > 0 
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
    : 5
  
  company.risks.overall = avgRisk < 3 ? 'Low' : avgRisk < 7 ? 'Medium' : 'High'

  return company
}

function calculateMetrics(companies: CompanyData[]): DashboardMetrics {
  const validValuations = companies
    .map(c => c.valuation)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b)

  const stages: Record<string, number> = {}
  const sectors: Record<string, number> = {}

  companies.forEach(company => {
    if (company.stage) {
      stages[company.stage] = (stages[company.stage] || 0) + 1
    }
    if (company.sector) {
      sectors[company.sector] = (sectors[company.sector] || 0) + 1
    }
  })

  return {
    totalCompanies: companies.length,
    totalValuation: validValuations.reduce((a, b) => a + b, 0),
    averageValuation: validValuations.length > 0 
      ? validValuations.reduce((a, b) => a + b, 0) / validValuations.length 
      : 0,
    medianValuation: validValuations.length > 0 
      ? validValuations[Math.floor(validValuations.length / 2)] 
      : 0,
    totalRevenue: companies.reduce((sum, c) => sum + (c.revenue || 0), 0),
    averageGrowth: companies.reduce((sum, c) => sum + (c.growth || 0), 0) / companies.length,
    averageBurnRate: companies.reduce((sum, c) => sum + (c.burnRate || 0), 0) / companies.length,
    averageRunway: companies.reduce((sum, c) => sum + (c.runway || 0), 0) / companies.length,
    stages,
    sectors
  }
}

function generateDistributions(companies: CompanyData[]): DistributionData {
  const stageCount: Record<string, number> = {}
  const sectorCount: Record<string, number> = {}
  const locationCount: Record<string, number> = {}
  const riskCount: Record<string, number> = {}

  companies.forEach(company => {
    if (company.stage) {
      stageCount[company.stage] = (stageCount[company.stage] || 0) + 1
    }
    if (company.sector) {
      sectorCount[company.sector] = (sectorCount[company.sector] || 0) + 1
    }
    if (company.location) {
      locationCount[company.location] = (locationCount[company.location] || 0) + 1
    }
    if (company.risks?.overall) {
      riskCount[company.risks.overall] = (riskCount[company.risks.overall] || 0) + 1
    }
  })

  const total = companies.length

  return {
    byStage: Object.entries(stageCount).map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100
    })),
    bySector: Object.entries(sectorCount).map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100
    })),
    byLocation: Object.entries(locationCount).map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100
    })),
    byRisk: Object.entries(riskCount).map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100
    }))
  }
}

function generateTrends(companies: CompanyData[]): TrendData[] {
  // Generate mock trend data for the last 12 months
  const trends: TrendData[] = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    trends.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      revenue: Math.random() * 1000000 * (12 - i),
      growth: 50 + Math.random() * 100,
      valuation: 5000000 + Math.random() * 10000000 * (12 - i),
      dealCount: Math.floor(5 + Math.random() * 15)
    })
  }
  
  return trends
}

function calculateScores(companies: CompanyData[], template: any): ScoreData {
  // Use template scoring criteria if available
  const defaultScore = (): ScoreCriteria[] => [
    { name: 'Overall', score: Math.random() * 10, max: 10, weight: 1 }
  ]

  return {
    marketScore: template?.sections?.[1]?.widgets?.[0]?.config?.criteria || defaultScore(),
    teamScore: template?.sections?.[2]?.widgets?.[0]?.config?.criteria || defaultScore(),
    productScore: template?.sections?.[3]?.widgets?.[0]?.config?.criteria || defaultScore(),
    financialScore: template?.sections?.[4]?.widgets?.[0]?.config?.criteria || defaultScore(),
    riskScore: template?.sections?.[7]?.widgets?.[0]?.config?.criteria || defaultScore()
  }
}

// Scoring functions
function calculateMarketScore(company: CompanyData): number {
  // Simple scoring based on available data
  let score = 5 // Base score
  if (company.revenue && company.revenue > 1000000) score += 2
  if (company.growth && company.growth > 100) score += 2
  if (company.sector) score += 1
  return Math.min(10, score)
}

function calculateTeamScore(company: CompanyData): number {
  let score = 5
  if (company.employees && company.employees > 10) score += 1
  if (company.employees && company.employees > 50) score += 2
  if (company.founded) score += 1
  if (company.location) score += 1
  return Math.min(10, score)
}

function calculateProductScore(company: CompanyData): number {
  let score = 5
  if (company.website) score += 1
  if (company.description) score += 1
  if (company.revenue && company.revenue > 0) score += 3
  return Math.min(10, score)
}

function calculateFinancialScore(company: CompanyData): number {
  let score = 5
  if (company.revenue && company.revenue > 1000000) score += 2
  if (company.growth && company.growth > 50) score += 1
  if (company.runway && company.runway > 12) score += 1
  if (company.valuation) score += 1
  return Math.min(10, score)
}

// Risk calculation functions
function calculateExecutionRisk(company: CompanyData): number {
  let risk = 5
  if (company.employees && company.employees < 10) risk += 2
  if (company.runway && company.runway < 6) risk += 2
  if (!company.revenue) risk += 1
  return Math.min(10, risk)
}

function calculateMarketRisk(company: CompanyData): number {
  let risk = 5
  if (!company.sector) risk += 1
  if (company.growth && company.growth < 50) risk += 2
  if (!company.revenue) risk += 2
  return Math.min(10, risk)
}

function calculateFinancialRisk(company: CompanyData): number {
  let risk = 5
  if (company.burnRate && company.burnRate > 500000) risk += 2
  if (company.runway && company.runway < 12) risk += 2
  if (!company.revenue) risk += 1
  return Math.min(10, risk)
}