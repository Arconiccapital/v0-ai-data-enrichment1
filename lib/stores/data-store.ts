import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DataState {
  headers: string[]
  data: string[][]
  
  // Actions
  setHeaders: (headers: string[]) => void
  setData: (data: string[][]) => void
  updateCell: (row: number, col: number, value: string) => void
  addColumn: (name: string) => void
  insertColumnBefore: (index: number, name: string) => void
  insertColumnAfter: (index: number, name: string) => void
  deleteColumn: (index: number) => void
  renameColumn: (index: number, newName: string) => void
  addRow: () => void
  addRows: (count: number) => void
  insertRowBefore: (index: number) => void
  insertRowAfter: (index: number) => void
  deleteRow: (index: number) => void
  duplicateRow: (index: number) => void
  clearData: () => void
  
  // Getters
  getColumnData: (colIndex: number) => string[]
  getRowData: (rowIndex: number) => string[]
  getCellValue: (row: number, col: number) => string
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      headers: [],
      data: [],
      
      setHeaders: (headers) => set({ headers }),
      
      setData: (data) => set({ data }),
      
      updateCell: (row, col, value) =>
        set((state) => {
          const newData = [...state.data]
          if (!newData[row]) newData[row] = []
          newData[row][col] = value
          return { data: newData }
        }),
      
      addColumn: (name) =>
        set((state) => ({
          headers: [...state.headers, name],
          data: state.data.map(row => [...row, ''])
        })),
      
      insertColumnBefore: (index, name) =>
        set((state) => {
          const newHeaders = [...state.headers]
          newHeaders.splice(index, 0, name)
          
          const newData = state.data.map(row => {
            const newRow = [...row]
            newRow.splice(index, 0, '')
            return newRow
          })
          
          return { headers: newHeaders, data: newData }
        }),
      
      insertColumnAfter: (index, name) =>
        set((state) => {
          const newHeaders = [...state.headers]
          newHeaders.splice(index + 1, 0, name)
          
          const newData = state.data.map(row => {
            const newRow = [...row]
            newRow.splice(index + 1, 0, '')
            return newRow
          })
          
          return { headers: newHeaders, data: newData }
        }),
      
      deleteColumn: (index) =>
        set((state) => {
          const newHeaders = state.headers.filter((_, i) => i !== index)
          const newData = state.data.map(row =>
            row.filter((_, i) => i !== index)
          )
          return { headers: newHeaders, data: newData }
        }),
      
      renameColumn: (index, newName) =>
        set((state) => {
          const newHeaders = [...state.headers]
          newHeaders[index] = newName
          return { headers: newHeaders }
        }),
      
      addRow: () =>
        set((state) => ({
          data: [...state.data, new Array(state.headers.length).fill('')]
        })),
      
      addRows: (count) =>
        set((state) => {
          const newRows = Array(count).fill(null).map(() => 
            new Array(state.headers.length).fill('')
          )
          return { data: [...state.data, ...newRows] }
        }),
      
      insertRowBefore: (index) =>
        set((state) => {
          const newData = [...state.data]
          newData.splice(index, 0, new Array(state.headers.length).fill(''))
          return { data: newData }
        }),
      
      insertRowAfter: (index) =>
        set((state) => {
          const newData = [...state.data]
          newData.splice(index + 1, 0, new Array(state.headers.length).fill(''))
          return { data: newData }
        }),
      
      deleteRow: (index) =>
        set((state) => ({
          data: state.data.filter((_, i) => i !== index)
        })),
      
      duplicateRow: (index) =>
        set((state) => {
          const newData = [...state.data]
          const rowToDuplicate = [...state.data[index]]
          newData.splice(index + 1, 0, rowToDuplicate)
          return { data: newData }
        }),
      
      clearData: () => set({ headers: [], data: [] }),
      
      // Getters
      getColumnData: (colIndex) => {
        const state = get()
        return state.data.map(row => row[colIndex] || '')
      },
      
      getRowData: (rowIndex) => {
        const state = get()
        return state.data[rowIndex] || []
      },
      
      getCellValue: (row, col) => {
        const state = get()
        return state.data[row]?.[col] || ''
      }
    }),
    {
      name: 'spreadsheet-data'
    }
  )
)