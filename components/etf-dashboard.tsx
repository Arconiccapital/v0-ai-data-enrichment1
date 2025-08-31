"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// TypeScript Interfaces
interface ETFHolding {
  rank: number;
  symbol: string;
  name: string;
  weight: number;
  change: number;
}

interface ETFSector {
  name: string;
  value: number;
}

interface ETFReturns {
  '1d': number;
  '1w': number;
  '1m': number;
  '3m': number;
  '6m': number;
  '1y': number;
  '3y': number;
  '5y': number;
}

interface ETFData {
  name: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  range52w: string;
  expenseRatio: string;
  divYield: string;
  ytdReturn: string;
  beta: string;
  sharpe: string;
  returns: ETFReturns;
  holdings: ETFHolding[];
  sectors: ETFSector[];
}

interface ETFDatabase {
  [key: string]: ETFData;
}

// ETF Data
const etfDatabase: ETFDatabase = {
  SPY: {
    name: 'SPDR S&P 500 ETF Trust',
    description: 'Tracks the S&P 500 Index',
    price: 452.38,
    change: 5.42,
    changePercent: 1.21,
    marketCap: '$516.8B',
    volume: '68.5M',
    range52w: '$380-$465',
    expenseRatio: '0.09%',
    divYield: '1.28%',
    ytdReturn: '+19.82%',
    beta: '1.00',
    sharpe: '1.42',
    returns: {
      '1d': 1.21,
      '1w': 2.35,
      '1m': 4.82,
      '3m': 8.45,
      '6m': 12.30,
      '1y': 28.45,
      '3y': 11.23,
      '5y': 14.82
    },
    holdings: [
      { rank: 1, symbol: 'AAPL', name: 'Apple Inc.', weight: 7.15, change: 1.8 },
      { rank: 2, symbol: 'MSFT', name: 'Microsoft Corp', weight: 6.92, change: 0.9 },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA Corp', weight: 5.48, change: 3.2 },
      { rank: 4, symbol: 'AMZN', name: 'Amazon.com', weight: 3.82, change: -0.5 },
      { rank: 5, symbol: 'META', name: 'Meta Platforms', weight: 2.56, change: 2.1 },
      { rank: 6, symbol: 'GOOGL', name: 'Alphabet A', weight: 2.14, change: 0.7 },
      { rank: 7, symbol: 'GOOG', name: 'Alphabet C', weight: 1.82, change: 0.8 },
      { rank: 8, symbol: 'BRK.B', name: 'Berkshire', weight: 1.68, change: -0.2 },
      { rank: 9, symbol: 'LLY', name: 'Eli Lilly', weight: 1.45, change: 1.5 },
      { rank: 10, symbol: 'TSM', name: 'Taiwan Semi', weight: 1.38, change: 2.8 },
      { rank: 11, symbol: 'JPM', name: 'JPMorgan', weight: 1.35, change: 0.4 },
      { rank: 12, symbol: 'V', name: 'Visa Inc', weight: 1.32, change: 0.6 },
      { rank: 13, symbol: 'UNH', name: 'UnitedHealth', weight: 1.28, change: -0.8 },
      { rank: 14, symbol: 'MA', name: 'Mastercard', weight: 1.15, change: 0.9 },
      { rank: 15, symbol: 'JNJ', name: 'Johnson & J', weight: 1.12, change: -0.3 }
    ],
    sectors: [
      { name: 'Technology', value: 28.9 },
      { name: 'Healthcare', value: 12.5 },
      { name: 'Financials', value: 12.8 },
      { name: 'Consumer Disc', value: 10.5 },
      { name: 'Communication', value: 8.7 },
      { name: 'Industrials', value: 8.3 },
      { name: 'Staples', value: 6.2 },
      { name: 'Energy', value: 3.8 },
      { name: 'Utilities', value: 2.4 },
      { name: 'Real Estate', value: 2.3 },
      { name: 'Materials', value: 2.4 },
      { name: 'Other', value: 1.2 }
    ]
  },
  QQQ: {
    name: 'Invesco QQQ Trust',
    description: 'Tracks the Nasdaq-100 Index',
    price: 392.85,
    change: 7.23,
    changePercent: 1.88,
    marketCap: '$201.4B',
    volume: '42.3M',
    range52w: '$310-$404',
    expenseRatio: '0.20%',
    divYield: '0.56%',
    ytdReturn: '+23.45%',
    beta: '1.15',
    sharpe: '1.38',
    returns: {
      '1d': 1.88,
      '1w': 3.12,
      '1m': 6.45,
      '3m': 11.23,
      '6m': 18.92,
      '1y': 35.28,
      '3y': 13.67,
      '5y': 18.45
    },
    holdings: [
      { rank: 1, symbol: 'AAPL', name: 'Apple Inc.', weight: 11.28, change: 1.8 },
      { rank: 2, symbol: 'MSFT', name: 'Microsoft Corp', weight: 10.15, change: 0.9 },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA Corp', weight: 8.95, change: 3.2 },
      { rank: 4, symbol: 'AMZN', name: 'Amazon.com', weight: 5.68, change: -0.5 },
      { rank: 5, symbol: 'META', name: 'Meta Platforms', weight: 4.92, change: 2.1 },
      { rank: 6, symbol: 'GOOGL', name: 'Alphabet A', weight: 3.45, change: 0.7 },
      { rank: 7, symbol: 'GOOG', name: 'Alphabet C', weight: 3.38, change: 0.8 },
      { rank: 8, symbol: 'TSLA', name: 'Tesla Inc', weight: 2.85, change: 4.2 },
      { rank: 9, symbol: 'AVGO', name: 'Broadcom', weight: 2.62, change: 1.5 },
      { rank: 10, symbol: 'COST', name: 'Costco', weight: 1.98, change: 0.3 }
    ],
    sectors: [
      { name: 'Technology', value: 48.5 },
      { name: 'Communication', value: 16.2 },
      { name: 'Consumer Disc', value: 14.3 },
      { name: 'Healthcare', value: 7.8 },
      { name: 'Staples', value: 5.6 },
      { name: 'Industrials', value: 4.8 },
      { name: 'Utilities', value: 1.2 },
      { name: 'Other', value: 1.6 }
    ]
  },
  VTI: {
    name: 'Vanguard Total Stock Market ETF',
    description: 'Tracks the entire U.S. stock market',
    price: 235.67,
    change: 2.34,
    changePercent: 1.00,
    marketCap: '$318.5B',
    volume: '3.2M',
    range52w: '$195-$242',
    expenseRatio: '0.03%',
    divYield: '1.35%',
    ytdReturn: '+18.92%',
    beta: '1.02',
    sharpe: '1.35',
    returns: {
      '1d': 1.00,
      '1w': 2.12,
      '1m': 4.55,
      '3m': 8.12,
      '6m': 11.80,
      '1y': 27.15,
      '3y': 10.85,
      '5y': 13.92
    },
    holdings: [
      { rank: 1, symbol: 'AAPL', name: 'Apple Inc.', weight: 6.58, change: 1.8 },
      { rank: 2, symbol: 'MSFT', name: 'Microsoft Corp', weight: 6.35, change: 0.9 },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA Corp', weight: 5.02, change: 3.2 },
      { rank: 4, symbol: 'AMZN', name: 'Amazon.com', weight: 3.48, change: -0.5 },
      { rank: 5, symbol: 'META', name: 'Meta Platforms', weight: 2.34, change: 2.1 }
    ],
    sectors: [
      { name: 'Technology', value: 27.8 },
      { name: 'Financials', value: 13.5 },
      { name: 'Healthcare', value: 13.2 },
      { name: 'Consumer Disc', value: 11.1 },
      { name: 'Industrials', value: 9.2 },
      { name: 'Communication', value: 8.8 },
      { name: 'Staples', value: 6.0 },
      { name: 'Energy', value: 3.6 },
      { name: 'Real Estate', value: 2.8 },
      { name: 'Utilities', value: 2.3 },
      { name: 'Materials', value: 1.7 }
    ]
  }
};

// Utility functions
const generateTimeLabels = (count: number): string[] => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (count <= 7) {
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    } else if (count <= 31) {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
  }
  return labels;
};

const generatePriceData = (basePrice: number, count: number): number[] => {
  const data: number[] = [];
  let price = basePrice - 10;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * 3;
    price += change;
    data.push(parseFloat(price.toFixed(2)));
  }
  return data;
};

const generateVolumeData = (count: number): number[] => {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * 40 + 50));
  }
  return data;
};

// Main Component
const ETFDashboard: React.FC = () => {
  const [selectedETF, setSelectedETF] = useState<string>('SPY');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [timeRange, setTimeRange] = useState<string>('1M');

  const etf = etfDatabase[selectedETF];

  // Time range mapping
  const timeRangeDays: { [key: string]: number } = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    'YTD': Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
    '1Y': 365
  };

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Removed live price updates to keep charts static

  // Generate static chart data using useMemo to prevent regeneration
  const priceChartData = useMemo(() => ({
    labels: generateTimeLabels(timeRangeDays[timeRange]),
    datasets: [
      {
        label: 'Price',
        data: generatePriceData(etf.price, timeRangeDays[timeRange]),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      }
    ]
  }), [timeRange, etf.price]);

  const volumeData = useMemo(() => generateVolumeData(20), []);
  const volumeChartData = useMemo(() => ({
    labels: generateTimeLabels(20),
    datasets: [
      {
        label: 'Volume (M)',
        data: volumeData,
        backgroundColor: volumeData.map(v => v > 70 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(74, 144, 226, 0.6)'),
        borderColor: volumeData.map(v => v > 70 ? '#10b981' : '#4a90e2'),
        borderWidth: 1
      }
    ]
  }), [volumeData]);

  const sectorChartData = {
    labels: etf.sectors.map(s => s.name),
    datasets: [
      {
        data: etf.sectors.map(s => s.value),
        backgroundColor: [
          '#4a90e2', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
          '#6366f1', '#84cc16', '#06b6d4', '#a855f7'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 10,
          font: {
            size: 11
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            return data.labels.map((label: string, i: number) => ({
              text: `${label}: ${data.datasets[0].data[i]}%`,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              📊 ETF Analytics Pro
            </h1>
            <div className="flex items-center gap-4">
              <select
                value={selectedETF}
                onChange={(e) => setSelectedETF(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="SPY">SPY - SPDR S&P 500</option>
                <option value="QQQ">QQQ - Invesco QQQ</option>
                <option value="VTI">VTI - Vanguard Total</option>
              </select>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{currentTime}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-end">
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold">{etf.name}</h2>
              <p className="text-blue-200">{etf.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl lg:text-4xl font-bold">
                ${etf.price.toFixed(2)}
              </div>
              <div className={`text-lg ${etf.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {etf.change >= 0 ? '▲' : '▼'} ${Math.abs(etf.change).toFixed(2)} ({etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {[
            { label: 'Market Cap', value: etf.marketCap, sub: '▲ 2.3% Week' },
            { label: 'Volume', value: etf.volume, sub: 'Avg: 75.2M' },
            { label: '52W Range', value: etf.range52w, sub: '97.3% of High' },
            { label: 'Expense', value: etf.expenseRatio, sub: 'Low Cost' },
            { label: 'Div Yield', value: etf.divYield, sub: 'Quarterly' },
            { label: 'YTD Return', value: etf.ytdReturn, sub: 'vs SPX: +0.12%' },
            { label: 'Beta', value: etf.beta, sub: 'Market Risk' },
            { label: 'Sharpe', value: etf.sharpe, sub: '3Y Risk-Adj' }
          ].map((metric, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 uppercase font-semibold">{metric.label}</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{metric.value}</div>
              <div className="text-xs text-gray-500 mt-1">{metric.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Price Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Price Performance</h3>
              <div className="flex gap-2">
                {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      timeRange === range 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={priceChartData} options={chartOptions} />
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Analysis</h3>
            <div style={{ height: '300px' }}>
              <Bar data={volumeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Sector Allocation and Holdings */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Sector Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sector Allocation</h3>
            <div style={{ height: '250px' }}>
              <Doughnut data={sectorChartData} options={doughnutOptions} />
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Symbol</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Company</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase">Weight</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase">1D %</th>
                  </tr>
                </thead>
                <tbody>
                  {etf.holdings.slice(0, 10).map(holding => (
                    <tr key={holding.rank} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-2 font-semibold text-blue-600">{holding.symbol}</td>
                      <td className="py-2 text-gray-700">{holding.name}</td>
                      <td className="py-2 text-right font-semibold">{holding.weight.toFixed(2)}%</td>
                      <td className={`py-2 text-right font-semibold ${holding.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Returns */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 uppercase text-xs tracking-wider">Returns</h3>
            {Object.entries(etf.returns).map(([period, value]) => (
              <div key={period} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-gray-600">{period.toUpperCase()}</span>
                <span className={`font-semibold ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Risk Metrics */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 uppercase text-xs tracking-wider">Risk Metrics</h3>
            {[
              { label: 'Volatility (30D)', value: '12.5%' },
              { label: 'Volatility (1Y)', value: '15.8%' },
              { label: 'Beta (3Y)', value: etf.beta },
              { label: 'Alpha (3Y)', value: '0.02' },
              { label: 'Sharpe Ratio', value: etf.sharpe },
              { label: 'Sortino Ratio', value: '2.15' },
              { label: 'Max Drawdown', value: '-18.5%', negative: true },
              { label: 'Correlation to S&P', value: '0.99' }
            ].map(metric => (
              <div key={metric.label} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-gray-600 text-sm">{metric.label}</span>
                <span className={`font-semibold text-sm ${metric.negative ? 'text-red-500' : 'text-gray-800'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>

          {/* Fund Details */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 uppercase text-xs tracking-wider">Fund Details</h3>
            {[
              { label: 'Inception Date', value: 'Jan 22, 1993' },
              { label: 'Total Assets', value: etf.marketCap },
              { label: 'Holdings Count', value: '503' },
              { label: 'P/E Ratio', value: '24.8' },
              { label: 'P/B Ratio', value: '4.5' },
              { label: 'Dividend Freq.', value: 'Quarterly' },
              { label: 'Last Dividend', value: '$1.58' },
              { label: 'Turnover Rate', value: '3.2%' }
            ].map(detail => (
              <div key={detail.label} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-gray-600 text-sm">{detail.label}</span>
                <span className="font-semibold text-sm text-gray-800">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Data is for demonstration purposes only. Real-time quotes may be delayed.</p>
          <p>© 2024 ETF Analytics Pro - Built with React & TypeScript</p>
        </div>
      </div>
    </div>
  );
};

export default ETFDashboard;