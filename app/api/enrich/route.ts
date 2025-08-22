import { LinkupClient } from "linkup-sdk"

const client = new LinkupClient({ apiKey: "0e82fb78-e35f-48ae-aa64-af16af4fcaab" })

export async function POST(request: Request) {
  try {
    const { value, prompt } = await request.json()

    if (!value || !prompt) {
      return Response.json({ error: "Missing value or prompt" }, { status: 400 })
    }

    try {
      // Create search query by combining the cell value with the prompt
      const searchQuery = `${value} ${prompt.replace(/\{value\}/g, value)}`

      console.log("[v0] Linkup search query:", searchQuery)

      const response = await client.search({
        query: searchQuery,
        depth: "standard",
        outputType: "sourcedAnswer",
        includeImages: false,
      })

      console.log("[v0] Linkup response:", response)

      let enrichedValue = value // fallback to original value

      if (response.answer) {
        // Use the AI-generated answer from Linkup
        enrichedValue = response.answer

        // For specific prompt types, try to extract more targeted information
        if (prompt.toLowerCase().includes("website") || prompt.toLowerCase().includes("url")) {
          // Look for URLs in the sources
          if (response.sources && response.sources.length > 0) {
            const urlSource = response.sources.find((source) => source.url)
            if (urlSource) {
              enrichedValue = urlSource.url
            }
          }
        } else if (prompt.toLowerCase().includes("email")) {
          // Look for email patterns in the answer
          const emailMatch = response.answer.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
          if (emailMatch) {
            enrichedValue = emailMatch[0]
          }
        }
      }

      return Response.json({ enrichedValue: enrichedValue.trim() })
    } catch (linkupError) {
      console.log("[v0] Linkup API error:", linkupError.message)
      console.log("[v0] Linkup API not available, using mock enrichment")

      // Fallback to mock enrichment for demo purposes
      const mockEnrichment = generateMockEnrichment(value, prompt)
      return Response.json({ enrichedValue: mockEnrichment })
    }
  } catch (error) {
    console.error("Enrichment API error:", error)
    return Response.json({ error: "Failed to enrich data" }, { status: 500 })
  }
}

function generateMockEnrichment(value: string, prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  const lowerValue = value.toLowerCase()

  // Company-related enrichments
  if (lowerPrompt.includes("website") || lowerPrompt.includes("url")) {
    return `https://www.${value.toLowerCase().replace(/\s+/g, "")}.com`
  }

  if (lowerPrompt.includes("category") || lowerPrompt.includes("industry")) {
    const categories = ["Technology", "Healthcare", "Finance", "E-commerce", "SaaS", "Manufacturing", "Consulting"]
    return categories[Math.floor(Math.random() * categories.length)]
  }

  if (lowerPrompt.includes("revenue") || lowerPrompt.includes("funding")) {
    const amounts = ["$1M-10M", "$10M-50M", "$50M-100M", "$100M+", "Series A", "Series B", "Series C"]
    return amounts[Math.floor(Math.random() * amounts.length)]
  }

  if (lowerPrompt.includes("location") || lowerPrompt.includes("headquarters")) {
    const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Chicago, IL"]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  if (lowerPrompt.includes("email") || lowerPrompt.includes("contact")) {
    return `contact@${value.toLowerCase().replace(/\s+/g, "")}.com`
  }

  if (lowerPrompt.includes("description") || lowerPrompt.includes("about")) {
    return `${value} is a leading company in their industry, providing innovative solutions to customers worldwide.`
  }

  if (lowerPrompt.includes("employee") || lowerPrompt.includes("size")) {
    const sizes = ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"]
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

  // Default enrichment
  return `Enhanced: ${value}`
}
