"use client"

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { DashboardConfig, DataEntity } from '@/lib/dashboard-types'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'
import { processData } from '@/lib/data-processing'

interface PresentationViewProps {
  config: DashboardConfig
  data: DataEntity[]
}

export function PresentationView({ config, data }: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const processedData = processData(data, config)
  const metrics = config.dataSchema.metrics
  
  // Build slides
  const slides = [
    // Title Slide
    {
      type: 'title',
      content: {
        title: config.title || 'Executive Presentation',
        subtitle: config.subtitle || `Analysis of ${data.length} Key Data Points`,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }
    },
    // Key Metrics Slide
    {
      type: 'metrics',
      title: 'Key Performance Metrics',
      metrics: metrics.slice(0, 3).map(metric => {
        const aggregate = processedData.aggregates[metric.key]
        return {
          label: metric.label,
          value: metric.type === 'currency' 
            ? formatCurrency(aggregate?.total || 0)
            : formatLargeNumber(aggregate?.total || 0),
          change: aggregate?.growth || 0
        }
      })
    },
    // Top Performers Slide
    {
      type: 'ranking',
      title: 'Top Performers',
      items: data.slice(0, 5).map(item => ({
        name: item[config.dataSchema.primaryKey],
        value: formatValue(item[metrics[0]?.key], metrics[0]?.type)
      }))
    },
    // Insights Slide
    {
      type: 'insights',
      title: 'Key Insights',
      insights: processedData.insights.slice(0, 4).map(insight => ({
        title: insight.title,
        description: insight.description,
        severity: insight.severity
      }))
    },
    // Conclusion Slide
    {
      type: 'conclusion',
      title: 'Conclusion',
      points: [
        `Analyzed ${data.length} total records`,
        `${metrics.length} key metrics evaluated`,
        `${processedData.insights.length} insights generated`,
        'Data-driven recommendations available'
      ]
    }
  ]
  
  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))
  }
  
  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1))
  }
  
  React.useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(nextSlide, 5000)
      return () => clearTimeout(timer)
    }
  }, [currentSlide, isPlaying])
  
  const slide = slides[currentSlide]
  
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Slide Content */}
      <div className="h-full flex items-center justify-center p-16">
        {/* Title Slide */}
        {slide.type === 'title' && (
          <div className="text-center animate-fadeIn">
            <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {slide.content.title}
            </h1>
            <p className="text-2xl text-blue-200 mb-12">{slide.content.subtitle}</p>
            <p className="text-lg text-gray-400">{slide.content.date}</p>
          </div>
        )}
        
        {/* Metrics Slide */}
        {slide.type === 'metrics' && (
          <div className="w-full max-w-6xl animate-fadeIn">
            <h2 className="text-5xl font-bold text-center mb-16">{slide.title}</h2>
            <div className="grid grid-cols-3 gap-12">
              {slide.metrics.map((metric, idx) => (
                <div key={idx} className="text-center transform hover:scale-105 transition-transform">
                  <div className="text-6xl font-bold text-yellow-400 mb-4">
                    {metric.value}
                  </div>
                  <div className="text-xl text-blue-200 mb-2">{metric.label}</div>
                  {metric.change !== 0 && (
                    <div className={`text-lg ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Ranking Slide */}
        {slide.type === 'ranking' && (
          <div className="w-full max-w-4xl animate-fadeIn">
            <h2 className="text-5xl font-bold text-center mb-16">{slide.title}</h2>
            <div className="space-y-6">
              {slide.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/10 rounded-xl p-6 backdrop-blur transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-6">
                    <div className="text-3xl font-bold text-yellow-400">#{idx + 1}</div>
                    <div className="text-2xl">{item.name}</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Insights Slide */}
        {slide.type === 'insights' && (
          <div className="w-full max-w-5xl animate-fadeIn">
            <h2 className="text-5xl font-bold text-center mb-16">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-8">
              {slide.insights.map((insight, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-8 backdrop-blur transform hover:scale-105 transition-transform">
                  <div className={`text-2xl font-bold mb-4 ${
                    insight.severity === 'success' ? 'text-green-400' :
                    insight.severity === 'warning' ? 'text-yellow-400' :
                    insight.severity === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {insight.title}
                  </div>
                  <p className="text-lg text-gray-200">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Conclusion Slide */}
        {slide.type === 'conclusion' && (
          <div className="w-full max-w-4xl animate-fadeIn">
            <h2 className="text-5xl font-bold text-center mb-16">{slide.title}</h2>
            <div className="space-y-8">
              {slide.points.map((point, idx) => (
                <div key={idx} className="flex items-center gap-6 text-2xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                    ✓
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Thank You
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur">
          {currentSlide + 1} / {slides.length}
        </div>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-8 bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}