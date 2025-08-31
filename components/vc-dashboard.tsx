"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

// Type Definitions
interface CompanyData {
  name: string;
  sector: string;
  stage: string;
  raising: string;
  valuation: string;
  founded: string;
  headquarters: string;
  employees: string;
  website: string;
  summary: string;
}

interface ScoreItem {
  score: number;
  weight: number;
  evidence: string;
  missing: string;
  rationale: string;
}

interface Scores {
  marketSize: ScoreItem;
  timing: ScoreItem;
  customerPain: ScoreItem;
  founderMarketFit: ScoreItem;
  founderInvestorFit: ScoreItem;
  productMaturity: ScoreItem;
  differentiation: ScoreItem;
  traction: ScoreItem;
  distribution: ScoreItem;
  techReadiness: ScoreItem;
  capitalEfficiency: ScoreItem;
  fundability: ScoreItem;
  exitPotential: ScoreItem;
  valuation: ScoreItem;
  xFactor: ScoreItem;
  portfolioFit: ScoreItem;
}

interface ThresholdIssue {
  issue: string;
  severity: 'Critical' | 'High' | 'Medium';
  category: string;
  triggered: boolean;
  notes: string;
}

interface EvaluationData {
  scores: Scores;
  thresholdIssues: ThresholdIssue[];
}

type ScoreKey = keyof Scores;
type ExpandedSections = Record<string, boolean>;
type CategoryGroups = Record<string, ScoreKey[]>;
type CategoryWeights = Record<string, number>;
type CriteriaLabels = Record<ScoreKey, string>;

interface VCDashboardProps {
  onClose?: () => void;
}

const VCDashboard: React.FC<VCDashboardProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    'Market': true,
    'Team': false,
    'Product': false,
    'GTM': false,
    'Technology': false,
    'Business': false
  });

  // Pre-filled startup data
  const companyData: CompanyData = {
    name: "DataSync AI",
    sector: "B2B SaaS - Data Infrastructure",
    stage: "Series A",
    raising: "$15M",
    valuation: "$60M pre-money",
    founded: "2022",
    headquarters: "San Francisco, CA",
    employees: "28",
    website: "www.datasync.ai",
    summary: "AI-powered data integration platform that automates ETL pipelines for mid-market enterprises, reducing data engineering time by 75% through intelligent schema mapping and self-healing connectors."
  };

  // Pre-filled evaluation scores with detailed assessments
  const evaluationData: EvaluationData = {
    scores: {
      // Market (30%)
      marketSize: {
        score: 8,
        weight: 15,
        evidence: "Slide 8: TAM of $28B (data integration market) growing at 22% CAGR. SAM of $8B (mid-market segment). SOM achievable at $500M in 5 years.",
        missing: "Detailed breakdown of enterprise vs mid-market splits",
        rationale: "Strong market size with verified third-party data (Gartner, IDC reports cited). High growth driven by digital transformation trends."
      },
      timing: {
        score: 9,
        weight: 10,
        evidence: "Slide 12: 67% of mid-market companies planning data modernization in 2024 (Forrester). New AI capabilities making automated integration feasible.",
        missing: "Specific regulatory drivers beyond GDPR/CCPA",
        rationale: "Excellent timing with AI breakthrough enabling new approaches. Enterprises desperate for solutions due to data engineer shortage."
      },
      customerPain: {
        score: 9,
        weight: 5,
        evidence: "Slide 6: Customer interviews show 40% of data engineering time on manual integration. Current solutions average $250k/year + 3 FTEs.",
        missing: "Quantified cost of data silos on decision-making",
        rationale: "Critical pain point with high urgency. Customers actively seeking solutions and have budget allocated."
      },
      
      // Team (20%)
      founderMarketFit: {
        score: 8,
        weight: 12,
        evidence: "Slide 18: CEO ex-Snowflake (built core ETL features), CTO ex-Databricks (ML pipeline lead), CPO from Segment (product-led growth).",
        missing: "Advisory board composition",
        rationale: "Exceptional technical expertise and direct experience with target problem. Strong industry connections for enterprise sales."
      },
      founderInvestorFit: {
        score: 7,
        weight: 8,
        evidence: "Slide 19: Weekly investor updates since seed. Implemented OKR system. Active in YC alumni network. Previous exit ($40M acquisition).",
        missing: "Reference checks from previous investors",
        rationale: "Coachable team with strong execution track record. Good communication habits established."
      },
      
      // Product (15%)
      productMaturity: {
        score: 7,
        weight: 10,
        evidence: "Demo video: Production v2.1 with 200+ connectors. Self-serve onboarding. 99.95% uptime SLA achieved for 6 months.",
        missing: "Technical architecture deep-dive",
        rationale: "Solid product in market with proven reliability. Still adding enterprise features but core platform is mature."
      },
      differentiation: {
        score: 8,
        weight: 5,
        evidence: "Slide 14: Proprietary AI model for schema mapping (patent pending). 75% faster implementation vs Fivetran/Stitch. Self-healing connectors unique.",
        missing: "Detailed competitive feature matrix",
        rationale: "Clear technical differentiation with IP protection in progress. Significant performance advantages validated by customers."
      },
      
      // GTM (12%)
      traction: {
        score: 8,
        weight: 7,
        evidence: "Slide 10: $2.4M ARR, 48 customers, 140% NRR, 15% MoM growth for 8 months. Key logos: Spotify, Instacart, Robinhood.",
        missing: "Cohort retention analysis, logo churn details",
        rationale: "Strong traction with impressive growth rate and tier-1 logos. NRR indicates excellent product-market fit."
      },
      distribution: {
        score: 6,
        weight: 5,
        evidence: "Slide 15: PLG motion with free tier (2k signups/month). Enterprise sales team of 4. CAC of $15k, payback in 8 months.",
        missing: "Channel partnership strategy, international expansion plan",
        rationale: "Dual GTM motion showing promise but enterprise sales cycle still being optimized. CAC improving but not best-in-class yet."
      },
      
      // Technology (8%)
      techReadiness: {
        score: 8,
        weight: 8,
        evidence: "Slide 16: Kubernetes architecture, 10ms latency, processes 1B+ events/day. SOC2 Type II certified. Core ML models proprietary.",
        missing: "Detailed security architecture, GDPR compliance status",
        rationale: "Scalable architecture with strong technical moat. Security certifications in place for enterprise sales."
      },
      
      // Business & Deal (15%)
      capitalEfficiency: {
        score: 7,
        weight: 5,
        evidence: "Slide 22: $4M raised to date, 18-month runway at current burn. Revenue per employee at $85k and growing.",
        missing: "Detailed unit economics by customer segment",
        rationale: "Reasonable burn multiple of 2.5x. Improving efficiency metrics but still investing heavily in R&D."
      },
      fundability: {
        score: 8,
        weight: 4,
        evidence: "Slide 23: Clear path to $10M ARR in 14 months. Series B metrics achievable (3x YoY growth, 60%+ gross margins).",
        missing: "Specific Series B investor targets",
        rationale: "Strong fundamentals for next round. Multiple clear value inflection points before Series B."
      },
      exitPotential: {
        score: 7,
        weight: 3,
        evidence: "Slide 24: Strategic interest from Snowflake, Databricks. Comparable exits: Fivetran ($5.6B), Matillion ($1.5B).",
        missing: "IPO feasibility analysis",
        rationale: "Multiple exit paths with proven acquirer interest in the category. Recent comps support $1B+ outcome."
      },
      valuation: {
        score: 6,
        weight: 1,
        evidence: "Terms: $60M pre at 25x ARR forward. Seed was $8M cap. Market comps at 20-30x for similar growth.",
        missing: "Detailed comparable company analysis",
        rationale: "Slightly aggressive but within market range for top-tier team and growth rate."
      },
      xFactor: {
        score: 8,
        weight: 2,
        evidence: "Strong fit with fund's data infrastructure thesis. Can leverage portfolio connections (Databricks, Confluent).",
        missing: "Specific portfolio synergy opportunities",
        rationale: "Perfect thesis fit with multiple portfolio synergy opportunities."
      },
      portfolioFit: {
        score: 9,
        weight: 1,
        evidence: "Clean cap table: 65% founders, 20% employees, 15% investors. No SAFEs or complex terms.",
        missing: "Employee option pool details",
        rationale: "Exceptionally clean structure with founder-friendly terms. Room for proper ownership."
      }
    },
    
    thresholdIssues: [
      {
        issue: "Enterprise sales cycle not fully proven",
        severity: "Medium",
        category: "GTM",
        triggered: true,
        notes: "Only 8 enterprise deals closed to date. Average deal size of $75k needs to increase for efficient scaling."
      },
      {
        issue: "Competitive pressure from incumbents",
        severity: "High",
        category: "Market",
        triggered: true,
        notes: "Fivetran raised $560M and aggressively expanding. Databricks/Snowflake building native solutions."
      },
      {
        issue: "Technical founder CEO may need coaching on sales",
        severity: "Medium",
        category: "Team",
        triggered: true,
        notes: "CEO strong technically but limited enterprise sales experience. May need experienced CRO soon."
      }
    ]
  };

  // Calculate total score
  const calculateTotalScore = (): string => {
    let total = 0;
    (Object.values(evaluationData.scores) as ScoreItem[]).forEach((item: ScoreItem) => {
      total += (item.score * item.weight) / 10;
    });
    return total.toFixed(1);
  };

  const totalScore: string = calculateTotalScore();

  // Determine recommendation based on score and threshold issues
  const getRecommendation = (): string => {
    const criticalIssues = evaluationData.thresholdIssues.filter(i => i.severity === 'Critical' && i.triggered);
    const highIssues = evaluationData.thresholdIssues.filter(i => i.severity === 'High' && i.triggered);
    
    if (criticalIssues.length > 0) return 'STOP';
    if (highIssues.length > 0 || parseFloat(totalScore) < 60) return 'NEEDS DILIGENCE';
    return 'PROCEED';
  };

  const recommendation: string = getRecommendation();

  const toggleSection = (section: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categoryGroups: CategoryGroups = {
    'Market': ['marketSize', 'timing', 'customerPain'],
    'Team': ['founderMarketFit', 'founderInvestorFit'],
    'Product': ['productMaturity', 'differentiation'],
    'GTM': ['traction', 'distribution'],
    'Technology': ['techReadiness'],
    'Business': ['capitalEfficiency', 'fundability', 'exitPotential', 'valuation', 'xFactor', 'portfolioFit']
  };

  const categoryWeights: CategoryWeights = {
    'Market': 30,
    'Team': 20,
    'Product': 15,
    'GTM': 12,
    'Technology': 8,
    'Business': 15
  };

  const criteriaLabels: CriteriaLabels = {
    marketSize: 'Market Size & Growth',
    timing: 'Timing & Macro Drivers',
    customerPain: 'Customer Pain Intensity',
    founderMarketFit: 'Founder-Market Fit',
    founderInvestorFit: 'Founder-Investor Fit',
    productMaturity: 'Product Maturity',
    differentiation: 'Differentiation',
    traction: 'Early Traction & Validation',
    distribution: 'Distribution Strategy',
    techReadiness: 'Tech Readiness & Defensibility',
    capitalEfficiency: 'Capital Efficiency',
    fundability: 'Fundability & Next Round',
    exitPotential: 'Exit / Return Potential',
    valuation: 'Valuation / Terms',
    xFactor: 'X Factor / Thesis Alignment',
    portfolioFit: 'Portfolio Fit / Cap Table'
  };

  const getSeverityStyles = (severity: ThresholdIssue['severity']): string => {
    switch (severity) {
      case 'Critical':
        return 'bg-gray-900 text-white';
      case 'High':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-gray-900">Investment Memorandum</h1>
              <div className="mt-2 text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Company Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-light mb-6">{companyData.name}</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Sector</span>
              <span className="font-medium">{companyData.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stage</span>
              <span className="font-medium">{companyData.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Raising</span>
              <span className="font-medium">{companyData.raising}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valuation</span>
              <span className="font-medium">{companyData.valuation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Founded</span>
              <span className="font-medium">{companyData.founded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employees</span>
              <span className="font-medium">{companyData.employees}</span>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">{companyData.summary}</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-sm text-gray-500 mb-2">Overall Score</div>
            <div className="text-4xl font-light">{totalScore}</div>
            <div className="text-sm text-gray-400 mt-1">/ 100</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-sm text-gray-500 mb-2">Recommendation</div>
            <div className="text-xl font-medium mt-3">{recommendation.replace('_', ' ')}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-3">Deal Terms</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Investment</span>
                <span className="font-medium">$2-3M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ownership</span>
                <span className="font-medium">3.3-5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Board</span>
                <span className="font-medium">Observer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-lg font-light text-gray-700 mb-6">Key Metrics</h3>
          <div className="grid grid-cols-5 gap-8">
            <div>
              <div className="text-2xl font-light">$2.4M</div>
              <div className="text-sm text-gray-500 mt-1">ARR</div>
            </div>
            <div>
              <div className="text-2xl font-light">140%</div>
              <div className="text-sm text-gray-500 mt-1">NRR</div>
            </div>
            <div>
              <div className="text-2xl font-light">48</div>
              <div className="text-sm text-gray-500 mt-1">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-light">15%</div>
              <div className="text-sm text-gray-500 mt-1">MoM Growth</div>
            </div>
            <div>
              <div className="text-2xl font-light">8mo</div>
              <div className="text-sm text-gray-500 mt-1">CAC Payback</div>
            </div>
          </div>
        </div>

        {/* Scoring Analysis */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-8">
            <h3 className="text-lg font-light text-gray-700 mb-6">Scoring Analysis</h3>
          </div>
          <div>
            {Object.entries(categoryGroups).map(([category, criteria], idx) => {
              const categoryScore = criteria.reduce((sum: number, c: ScoreKey) => {
                const item = evaluationData.scores[c];
                return sum + (item.score * item.weight) / 10;
              }, 0);
              
              return (
                <div key={category} className={idx > 0 ? 'border-t border-gray-100' : ''}>
                  <button
                    onClick={() => toggleSection(category)}
                    className="w-full px-8 py-4 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-gray-500">{categoryWeights[category]}% weight</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Score: {categoryScore.toFixed(1)} / {categoryWeights[category]}
                      </span>
                      {expandedSections[category] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>
                  
                  {expandedSections[category] && (
                    <div className="bg-gray-50 px-8 py-6">
                      {criteria.map((criterion: ScoreKey, critIdx: number) => {
                        const item = evaluationData.scores[criterion];
                        return (
                          <div key={criterion} className={critIdx > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="font-medium text-gray-900">{criteriaLabels[criterion]}</div>
                                <div className="text-xs text-gray-500 mt-1">Weight: {item.weight}%</div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-light">{item.score}/10</div>
                                <div className="text-xs text-gray-500">Contribution: {(item.score * item.weight / 10).toFixed(1)}%</div>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm">
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assessment</div>
                                <p className="text-gray-700 leading-relaxed">{item.rationale}</p>
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Evidence</div>
                                <p className="text-gray-600 italic leading-relaxed pl-4 border-l-2 border-gray-300">{item.evidence}</p>
                              </div>
                              
                              {item.missing && (
                                <div>
                                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Missing Information</div>
                                  <p className="text-gray-600 leading-relaxed">{item.missing}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-lg font-light text-gray-700 mb-6">Risk Factors</h3>
          <div className="space-y-4">
            {evaluationData.thresholdIssues.filter(issue => issue.triggered).map((issue: ThresholdIssue, idx: number) => (
              <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getSeverityStyles(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{issue.issue}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{issue.notes}</div>
                  <div className="text-xs text-gray-400 mt-2">Category: {issue.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Thesis */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-lg font-light text-gray-700 mb-6">Investment Thesis</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Why Now:</span>
              <p className="mt-2 text-gray-600 leading-relaxed">
                The convergence of AI capabilities and the acute data engineering talent shortage creates a unique window. 
                Mid-market enterprises are desperate for solutions but underserved by expensive enterprise vendors.
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Why This Team:</span>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Rare combination of technical depth from Snowflake/Databricks with direct experience building the exact features 
                customers need. The team's insider knowledge provides 18-24 month advantage.
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Why This Deal:</span>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Entry at reasonable valuation (25x forward ARR) with clean terms and significant ownership available. 
                Strong portfolio synergies with existing data infrastructure investments.
              </p>
            </div>
          </div>
        </div>

        {/* Due Diligence */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-lg font-light text-gray-700 mb-6">Due Diligence Focus Areas</h3>
          <div className="space-y-3 text-sm text-gray-700">
            {[
              "How defensible is the AI advantage as competitors catch up?",
              "What's the plan to compete against Fivetran's $560M war chest?",
              "When will you hire a CRO and what's the profile?",
              "How do you maintain growth while improving CAC payback?",
              "What's the strategy if Snowflake/Databricks build competing features?"
            ].map((question: string, idx: number) => (
              <div key={idx} className="flex items-start">
                <span className="text-gray-400 mr-3">{idx + 1}.</span>
                <span>{question}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-medium text-gray-700 mb-4">Immediate Actions</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Technical due diligence with CTO</li>
              <li>• Customer reference calls (5-7)</li>
              <li>• Competitive analysis deep dive</li>
              <li>• Legal review of IP and patents</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-medium text-gray-700 mb-4">Partner Meeting</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• CEO/CTO technical presentation</li>
              <li>• GTM scaling plan review</li>
              <li>• Competitive positioning analysis</li>
              <li>• CRO hiring timeline discussion</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-8">
          <p>Confidential - Internal Use Only</p>
        </div>
      </div>
    </div>
  );
};

export default VCDashboard;