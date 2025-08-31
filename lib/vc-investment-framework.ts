// VC Investment Framework - Comprehensive Scoring System
export interface VCCriterion {
  category: string
  name: string
  description: string
  guidingQuestions: string
  lowDescription: string  // 1-3
  mediumDescription: string  // 4-6
  highDescription: string  // 7-10
  weight: number  // Percentage weight
  score?: number
  weightedScore?: number
  evidence?: string
  missingInfo?: string
}

export interface VCCategory {
  name: string
  weight: number  // Total category weight
  criteria: VCCriterion[]
}

export const vcInvestmentFramework: VCCategory[] = [
  {
    name: "MARKET",
    weight: 30,
    criteria: [
      {
        category: "MARKET",
        name: "Market Size & Growth",
        description: "TAM assessment and growth trajectory",
        guidingQuestions: "How big is TAM? How fast is it growing? Is this VC-scale?",
        lowDescription: "<$1B, flat",
        mediumDescription: "$1–5B, 5–10% CAGR",
        highDescription: "$5B+, 15%+ CAGR, adjacencies",
        weight: 15
      },
      {
        category: "MARKET",
        name: "Timing & Macro Drivers",
        description: "Market timing and external catalysts",
        guidingQuestions: "Why now? Any macro/tech/regulatory tailwinds?",
        lowDescription: "No clear drivers",
        mediumDescription: "Some weak trends",
        highDescription: "Strong secular shift (regulation, tech, behavior)",
        weight: 10
      },
      {
        category: "MARKET",
        name: "Customer Pain Intensity",
        description: "Problem urgency and criticality",
        guidingQuestions: "How urgent/critical is the problem?",
        lowDescription: "Nice-to-have",
        mediumDescription: "Important but not urgent",
        highDescription: "Mission-critical, high willingness to pay",
        weight: 5
      }
    ]
  },
  {
    name: "TEAM",
    weight: 20,
    criteria: [
      {
        category: "TEAM",
        name: "Founder-Market Fit",
        description: "Founder expertise and unique insights",
        guidingQuestions: "Do founders have unique insight or unfair advantage?",
        lowDescription: "No relevant experience",
        mediumDescription: "Some industry exp",
        highDescription: "Deep expertise, lived problem",
        weight: 12
      },
      {
        category: "TEAM",
        name: "Founder–Investor Fit",
        description: "Coachability and alignment",
        guidingQuestions: "Are they coachable, resilient, aligned?",
        lowDescription: "Defensive, avoids feedback",
        mediumDescription: "Mixed",
        highDescription: "Highly coachable, resilient, aligned",
        weight: 8
      }
    ]
  },
  {
    name: "PRODUCT",
    weight: 15,
    criteria: [
      {
        category: "PRODUCT",
        name: "Product Maturity",
        description: "Development stage and readiness",
        guidingQuestions: "What's built?",
        lowDescription: "Idea only",
        mediumDescription: "Prototype/MVP",
        highDescription: "Production-ready, active users",
        weight: 10
      },
      {
        category: "PRODUCT",
        name: "Differentiation",
        description: "Uniqueness vs competition",
        guidingQuestions: "Is this unique vs. incumbents?",
        lowDescription: "Copycat, replicable",
        mediumDescription: "Some differentiation",
        highDescription: "Proprietary IP/approach, moat forming",
        weight: 5
      }
    ]
  },
  {
    name: "GTM",
    weight: 12,
    criteria: [
      {
        category: "GTM",
        name: "Early Traction & Validation",
        description: "Market demand proof",
        guidingQuestions: "Any proof of demand?",
        lowDescription: "None",
        mediumDescription: "Pilots, LOIs, waitlist",
        highDescription: "Paying customers, strong retention",
        weight: 7
      },
      {
        category: "GTM",
        name: "Distribution Strategy",
        description: "Go-to-market scalability",
        guidingQuestions: "Clear scalable GTM?",
        lowDescription: "No GTM plan",
        mediumDescription: "Early channels, unproven CAC",
        highDescription: "Clear scalable channels, CAC efficiency",
        weight: 5
      }
    ]
  },
  {
    name: "TECH",
    weight: 8,
    criteria: [
      {
        category: "TECH",
        name: "Tech Readiness & Defensibility",
        description: "Technical maturity and moat",
        guidingQuestions: "What's built? Is it defensible?",
        lowDescription: "Wireframes/slides only",
        mediumDescription: "MVP, basic stack",
        highDescription: "Proprietary IP/data, scalable infra",
        weight: 8
      }
    ]
  },
  {
    name: "BUSINESS & DEAL",
    weight: 15,
    criteria: [
      {
        category: "BUSINESS & DEAL",
        name: "Capital Efficiency",
        description: "Burn rate and milestone achievement",
        guidingQuestions: "Can they hit milestones without excessive burn?",
        lowDescription: "High burn, unclear",
        mediumDescription: "Moderate burn",
        highDescription: "Lean, milestone-driven",
        weight: 5
      },
      {
        category: "BUSINESS & DEAL",
        name: "Fundability & Next Round Path",
        description: "Series A readiness",
        guidingQuestions: "Will Series A investors fund it?",
        lowDescription: "No clear path",
        mediumDescription: "Some alignment",
        highDescription: "Clear roadmap, Series A hooks",
        weight: 4
      },
      {
        category: "BUSINESS & DEAL",
        name: "Exit / Return Potential",
        description: "Return multiple potential",
        guidingQuestions: "Could this be 10x+?",
        lowDescription: "<$100M ceiling",
        mediumDescription: "$100–500M potential",
        highDescription: "$1B+ potential, multiple paths",
        weight: 3
      },
      {
        category: "BUSINESS & DEAL",
        name: "Valuation / Terms",
        description: "Entry price attractiveness",
        guidingQuestions: "Are entry terms fair?",
        lowDescription: "Overpriced (>3–4x peers)",
        mediumDescription: "Fair but stretched",
        highDescription: "Attractive entry",
        weight: 1
      },
      {
        category: "BUSINESS & DEAL",
        name: "X Factor / Thesis Alignment",
        description: "Strategic fit with fund thesis",
        guidingQuestions: "Does this fit our thesis?",
        lowDescription: "Outside thesis",
        mediumDescription: "Adjacent",
        highDescription: "Perfect fit, aligned",
        weight: 2
      },
      {
        category: "BUSINESS & DEAL",
        name: "Portfolio Fit / Cap Table",
        description: "Ownership and cap table health",
        guidingQuestions: "Clean and accretive?",
        lowDescription: "Messy",
        mediumDescription: "Some complexity",
        highDescription: "Clean, favorable ownership",
        weight: 1
      }
    ]
  }
]

// Helper functions for scoring calculations
export function calculateWeightedScore(score: number, weight: number): number {
  return (score * weight) / 100
}

export function calculateCategoryScore(criteria: VCCriterion[]): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const weightedSum = criteria.reduce((sum, c) => {
    if (c.score) {
      return sum + (c.score * c.weight)
    }
    return sum
  }, 0)
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

export function calculateOverallScore(categories: VCCategory[]): number {
  let totalWeightedScore = 0
  let totalWeight = 0
  
  categories.forEach(category => {
    const categoryScore = calculateCategoryScore(category.criteria)
    totalWeightedScore += categoryScore * category.weight
    totalWeight += category.weight
  })
  
  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

export function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-600"
  if (score >= 4) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreBackground(score: number): string {
  if (score >= 7) return "bg-green-50"
  if (score >= 4) return "bg-yellow-50"
  return "bg-red-50"
}

export function getInvestmentRecommendation(overallScore: number): {
  recommendation: string
  color: string
  description: string
} {
  if (overallScore >= 7) {
    return {
      recommendation: "STRONG BUY",
      color: "text-green-600",
      description: "Exceptional opportunity with strong fundamentals across all dimensions"
    }
  } else if (overallScore >= 5.5) {
    return {
      recommendation: "BUY",
      color: "text-green-500",
      description: "Good investment opportunity with solid potential"
    }
  } else if (overallScore >= 4) {
    return {
      recommendation: "HOLD",
      color: "text-yellow-600",
      description: "Moderate opportunity, needs improvement in key areas"
    }
  } else {
    return {
      recommendation: "PASS",
      color: "text-red-600",
      description: "Does not meet investment criteria at this time"
    }
  }
}