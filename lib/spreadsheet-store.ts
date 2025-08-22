import { create } from "zustand"

interface EnrichmentStatus {
  enriching: boolean
  currentRow?: number
  prompt?: string
}

interface SpreadsheetStore {
  headers: string[]
  data: string[][]
  hasData: boolean
  enrichmentStatus: Record<number, EnrichmentStatus>
  setData: (headers: string[], rows: string[][]) => void
  updateCell: (rowIndex: number, colIndex: number, value: string) => void
  addColumn: (header: string) => void
  clearData: () => void
  enrichColumn: (columnIndex: number, prompt: string) => Promise<void>
  enrichColumnToNew: (sourceColumnIndex: number, newColumnName: string, prompt: string) => Promise<void>
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  headers: [],
  data: [],
  hasData: false,
  enrichmentStatus: {},

  setData: (headers, rows) =>
    set({
      headers,
      data: rows,
      hasData: true,
      enrichmentStatus: {},
    }),

  updateCell: (rowIndex, colIndex, value) =>
    set((state) => {
      const newData = [...state.data]
      newData[rowIndex] = [...newData[rowIndex]]
      newData[rowIndex][colIndex] = value
      return { data: newData }
    }),

  addColumn: (header) =>
    set((state) => ({
      headers: [...state.headers, header],
      data: state.data.map((row) => [...row, ""]),
    })),

  clearData: () =>
    set({
      headers: [],
      data: [],
      hasData: false,
      enrichmentStatus: {},
    }),

  enrichColumn: async (columnIndex, prompt) => {
    const { data, headers } = get()

    // Set enrichment status
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [columnIndex]: { enriching: true, prompt, currentRow: 0 },
      },
    }))

    try {
      // Process each row sequentially
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Update current row being processed
        set((state) => ({
          enrichmentStatus: {
            ...state.enrichmentStatus,
            [columnIndex]: { ...state.enrichmentStatus[columnIndex], currentRow: rowIndex },
          },
        }))

        const currentValue = data[rowIndex][columnIndex]
        const enrichedValue = await enrichCell(currentValue, prompt)

        // Update the cell with enriched value
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][columnIndex] = enrichedValue
          return { data: newData }
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [columnIndex]: { enriching: false },
        },
      }))
    }
  },

  enrichColumnToNew: async (sourceColumnIndex, newColumnName, prompt) => {
    const { data, headers, addColumn } = get()

    // First, add the new column
    addColumn(newColumnName)
    const newColumnIndex = headers.length // Will be the index after adding

    // Set enrichment status for the new column
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [newColumnIndex]: { enriching: true, prompt, currentRow: 0 },
      },
    }))

    try {
      // Process each row sequentially
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Update current row being processed
        set((state) => ({
          enrichmentStatus: {
            ...state.enrichmentStatus,
            [newColumnIndex]: { ...state.enrichmentStatus[newColumnIndex], currentRow: rowIndex },
          },
        }))

        // Get value from source column
        const sourceValue = data[rowIndex][sourceColumnIndex]
        const enrichedValue = await enrichCell(sourceValue, prompt)

        // Update the new column with enriched value
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][newColumnIndex] = enrichedValue
          return { data: newData }
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [newColumnIndex]: { enriching: false },
        },
      }))
    }
  },
}))

async function enrichCell(value: string, prompt: string): Promise<string> {
  try {
    console.log("[v0] Enriching cell with value:", value, "and prompt:", prompt)

    const response = await fetch("/api/enrich", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value,
        prompt,
      }),
    })

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] API error response:", errorText)
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API response data:", data)

    if (!data.enrichedValue) {
      throw new Error("No enriched value returned from API")
    }

    return data.enrichedValue
  } catch (error) {
    console.error("[v0] Error enriching cell:", error)
    throw new Error(`Failed to enrich cell: ${error.message}`)
  }
}
