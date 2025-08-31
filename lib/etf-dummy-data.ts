// ETF Dummy Data Generator for Dashboard Visualizations

export interface ETFData {
  ticker: string
  name: string
  category: string
  expenseRatio: number
  aum: number
  ytdReturn: number
  oneYearReturn: number
  threeYearReturn: number
  fiveYearReturn: number
  volatility: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  dividendYield: number
  volume: number
  bidAskSpread: number
  inceptionDate: string
  provider: string
}

export interface ETFHolding {
  ticker: string
  company: string
  weight: number
  sector: string
  marketCap: number
  performanceContribution: number
}

export interface TimeSeriesData {
  date: string
  value: number
  benchmark?: number
}

export interface SectorAllocation {
  sector: string
  weight: number
  color: string
}

// Popular ETFs with realistic data
export const ETF_LIST: ETFData[] = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    category: "Large Cap Equity",
    expenseRatio: 0.09,
    aum: 425000000000,
    ytdReturn: 18.2,
    oneYearReturn: 26.3,
    threeYearReturn: 10.1,
    fiveYearReturn: 15.7,
    volatility: 15.8,
    sharpeRatio: 1.42,
    sortinoRatio: 2.1,
    maxDrawdown: -19.4,
    dividendYield: 1.3,
    volume: 75234000,
    bidAskSpread: 0.01,
    inceptionDate: "1993-01-22",
    provider: "State Street"
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    category: "Technology",
    expenseRatio: 0.20,
    aum: 210000000000,
    ytdReturn: 22.5,
    oneYearReturn: 31.2,
    threeYearReturn: 12.8,
    fiveYearReturn: 19.3,
    volatility: 18.2,
    sharpeRatio: 1.35,
    sortinoRatio: 1.98,
    maxDrawdown: -22.1,
    dividendYield: 0.6,
    volume: 45123000,
    bidAskSpread: 0.01,
    inceptionDate: "1999-03-10",
    provider: "Invesco"
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    category: "Total Market",
    expenseRatio: 0.03,
    aum: 285000000000,
    ytdReturn: 17.8,
    oneYearReturn: 25.9,
    threeYearReturn: 9.8,
    fiveYearReturn: 15.2,
    volatility: 16.1,
    sharpeRatio: 1.38,
    sortinoRatio: 2.05,
    maxDrawdown: -20.2,
    dividendYield: 1.4,
    volume: 3456000,
    bidAskSpread: 0.01,
    inceptionDate: "2001-05-24",
    provider: "Vanguard"
  },
  {
    ticker: "IWM",
    name: "iShares Russell 2000 ETF",
    category: "Small Cap",
    expenseRatio: 0.19,
    aum: 65000000000,
    ytdReturn: 12.3,
    oneYearReturn: 19.8,
    threeYearReturn: 7.2,
    fiveYearReturn: 10.5,
    volatility: 21.3,
    sharpeRatio: 0.85,
    sortinoRatio: 1.24,
    maxDrawdown: -25.3,
    dividendYield: 1.1,
    volume: 28934000,
    bidAskSpread: 0.02,
    inceptionDate: "2000-05-22",
    provider: "BlackRock"
  },
  {
    ticker: "EEM",
    name: "iShares MSCI Emerging Markets ETF",
    category: "Emerging Markets",
    expenseRatio: 0.68,
    aum: 25000000000,
    ytdReturn: 5.2,
    oneYearReturn: 8.9,
    threeYearReturn: -2.1,
    fiveYearReturn: 3.8,
    volatility: 18.9,
    sharpeRatio: 0.42,
    sortinoRatio: 0.61,
    maxDrawdown: -28.6,
    dividendYield: 2.3,
    volume: 42156000,
    bidAskSpread: 0.03,
    inceptionDate: "2003-04-07",
    provider: "BlackRock"
  }
]

// Generate time series performance data
export function generateTimeSeriesData(months: number = 12): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const today = new Date()
  let cumulativeReturn = 100
  let benchmarkReturn = 100
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    
    // Add some realistic volatility
    const monthlyReturn = (Math.random() - 0.48) * 8 // -4% to +4% monthly
    const benchmarkMonthlyReturn = (Math.random() - 0.48) * 6 // Slightly less volatile
    
    cumulativeReturn *= (1 + monthlyReturn / 100)
    benchmarkReturn *= (1 + benchmarkMonthlyReturn / 100)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(cumulativeReturn.toFixed(2)),
      benchmark: parseFloat(benchmarkReturn.toFixed(2))
    })
  }
  
  return data
}

// Generate sector allocation data
export function generateSectorAllocation(): SectorAllocation[] {
  return [
    { sector: "Technology", weight: 28.5, color: "#8884d8" },
    { sector: "Healthcare", weight: 13.2, color: "#82ca9d" },
    { sector: "Financials", weight: 12.8, color: "#ffc658" },
    { sector: "Consumer Discretionary", weight: 11.5, color: "#ff7c7c" },
    { sector: "Industrials", weight: 8.9, color: "#8dd1e1" },
    { sector: "Communication Services", weight: 8.2, color: "#d084d0" },
    { sector: "Consumer Staples", weight: 6.4, color: "#ffb347" },
    { sector: "Energy", weight: 4.3, color: "#67b7dc" },
    { sector: "Utilities", weight: 2.9, color: "#a4de6c" },
    { sector: "Real Estate", weight: 2.3, color: "#ffd1dc" },
    { sector: "Materials", weight: 1.0, color: "#c1c1c1" }
  ]
}

// Generate top holdings data
export function generateTopHoldings(etfTicker: string): ETFHolding[] {
  const techHoldings: ETFHolding[] = [
    { ticker: "AAPL", company: "Apple Inc.", weight: 7.12, sector: "Technology", marketCap: 3000000000000, performanceContribution: 0.95 },
    { ticker: "MSFT", company: "Microsoft Corp.", weight: 6.89, sector: "Technology", marketCap: 2900000000000, performanceContribution: 0.88 },
    { ticker: "NVDA", company: "NVIDIA Corp.", weight: 4.52, sector: "Technology", marketCap: 1200000000000, performanceContribution: 1.23 },
    { ticker: "AMZN", company: "Amazon.com Inc.", weight: 3.38, sector: "Consumer Discretionary", marketCap: 1700000000000, performanceContribution: 0.42 },
    { ticker: "META", company: "Meta Platforms Inc.", weight: 2.15, sector: "Communication Services", marketCap: 900000000000, performanceContribution: 0.65 },
    { ticker: "GOOGL", company: "Alphabet Inc. Class A", weight: 1.98, sector: "Communication Services", marketCap: 1600000000000, performanceContribution: 0.31 },
    { ticker: "GOOG", company: "Alphabet Inc. Class C", weight: 1.72, sector: "Communication Services", marketCap: 1600000000000, performanceContribution: 0.28 },
    { ticker: "BRK.B", company: "Berkshire Hathaway Inc.", weight: 1.68, sector: "Financials", marketCap: 800000000000, performanceContribution: 0.15 },
    { ticker: "TSLA", company: "Tesla Inc.", weight: 1.54, sector: "Consumer Discretionary", marketCap: 850000000000, performanceContribution: 0.48 },
    { ticker: "UNH", company: "UnitedHealth Group Inc.", weight: 1.32, sector: "Healthcare", marketCap: 520000000000, performanceContribution: 0.22 }
  ]
  
  return techHoldings
}

// Generate correlation matrix data
export function generateCorrelationMatrix(etfs: string[]): number[][] {
  const matrix: number[][] = []
  
  for (let i = 0; i < etfs.length; i++) {
    matrix[i] = []
    for (let j = 0; j < etfs.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0
      } else if (j < i) {
        matrix[i][j] = matrix[j][i]
      } else {
        // Generate realistic correlations
        matrix[i][j] = parseFloat((0.3 + Math.random() * 0.6).toFixed(2))
      }
    }
  }
  
  return matrix
}

// Generate monthly returns data
export function generateMonthlyReturns(months: number = 12): { month: string; return: number }[] {
  const data = []
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const today = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    
    data.push({
      month: monthNames[date.getMonth()],
      return: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)) // -5% to +5%
    })
  }
  
  return data
}

// Generate risk-return scatter data
export function generateRiskReturnData(): { name: string; risk: number; return: number; size: number }[] {
  return ETF_LIST.map(etf => ({
    name: etf.ticker,
    risk: etf.volatility,
    return: etf.oneYearReturn,
    size: Math.log(etf.aum / 1000000000) * 5 // Size based on AUM
  }))
}

// Generate dividend history
export function generateDividendHistory(): { date: string; amount: number }[] {
  const data = []
  const quarters = 8 // 2 years of quarterly dividends
  
  for (let i = quarters - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - (i * 3))
    
    data.push({
      date: date.toISOString().split('T')[0],
      amount: parseFloat((0.3 + Math.random() * 0.2).toFixed(2)) // $0.30 to $0.50 per quarter
    })
  }
  
  return data
}

// Generate expense ratio comparison
export function generateExpenseComparison(): { etf: string; expense: number; category: string }[] {
  return ETF_LIST.map(etf => ({
    etf: etf.ticker,
    expense: etf.expenseRatio,
    category: etf.expenseRatio < 0.1 ? "Low" : etf.expenseRatio < 0.3 ? "Medium" : "High"
  }))
}

// Generate rolling volatility data
export function generateRollingVolatility(days: number = 90): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const today = new Date()
  
  for (let i = days; i >= 0; i -= 5) { // Every 5 days
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Volatility typically ranges from 10% to 30%
    const volatility = 15 + Math.sin(i / 20) * 5 + (Math.random() - 0.5) * 3
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(volatility.toFixed(2))
    })
  }
  
  return data
}

// Generate fund flow data
export function generateFundFlows(months: number = 12): { date: string; inflows: number; outflows: number; net: number }[] {
  const data = []
  const today = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    
    const inflows = Math.random() * 5000 + 1000 // $1-6 billion
    const outflows = Math.random() * 4000 + 500 // $0.5-4.5 billion
    
    data.push({
      date: date.toISOString().split('T')[0],
      inflows: parseFloat(inflows.toFixed(0)),
      outflows: parseFloat(outflows.toFixed(0)),
      net: parseFloat((inflows - outflows).toFixed(0))
    })
  }
  
  return data
}