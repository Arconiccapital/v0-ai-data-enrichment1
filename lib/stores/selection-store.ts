import { create } from 'zustand'

interface CellPosition {
  row: number
  col: number
}

interface SelectionState {
  selectedCells: Set<string>
  selectedRows: Set<number>
  selectedColumns: Set<number>
  selectedCell: CellPosition | null
  isSelecting: boolean
  selectionStart: CellPosition | null
  
  // Actions
  toggleCellSelection: (row: number, col: number) => void
  toggleRowSelection: (row: number) => void
  toggleColumnSelection: (col: number) => void
  selectAllRows: (totalRows: number) => void
  clearSelection: () => void
  setSelectedCell: (cell: CellPosition | null) => void
  startSelection: (cell: CellPosition) => void
  endSelection: () => void
  
  // Range selection
  selectRange: (start: CellPosition, end: CellPosition) => void
  
  // Getters
  isCellSelected: (row: number, col: number) => boolean
  isRowSelected: (row: number) => boolean
  isColumnSelected: (col: number) => boolean
  getSelectedData: (data: string[][]) => string[][]
  getSelectedCellsCount: () => number
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedCells: new Set(),
  selectedRows: new Set(),
  selectedColumns: new Set(),
  selectedCell: null,
  isSelecting: false,
  selectionStart: null,
  
  toggleCellSelection: (row, col) =>
    set((state) => {
      const key = `${row}-${col}`
      const newSelectedCells = new Set(state.selectedCells)
      
      if (newSelectedCells.has(key)) {
        newSelectedCells.delete(key)
      } else {
        newSelectedCells.add(key)
      }
      
      return { selectedCells: newSelectedCells }
    }),
  
  toggleRowSelection: (row) =>
    set((state) => {
      const newSelectedRows = new Set(state.selectedRows)
      
      if (newSelectedRows.has(row)) {
        newSelectedRows.delete(row)
      } else {
        newSelectedRows.add(row)
      }
      
      return { selectedRows: newSelectedRows }
    }),
  
  toggleColumnSelection: (col) =>
    set((state) => {
      const newSelectedColumns = new Set(state.selectedColumns)
      
      if (newSelectedColumns.has(col)) {
        newSelectedColumns.delete(col)
      } else {
        newSelectedColumns.add(col)
      }
      
      return { selectedColumns: newSelectedColumns }
    }),
  
  selectAllRows: (totalRows) =>
    set(() => ({
      selectedRows: new Set(Array.from({ length: totalRows }, (_, i) => i))
    })),
  
  clearSelection: () =>
    set({
      selectedCells: new Set(),
      selectedRows: new Set(),
      selectedColumns: new Set(),
      selectedCell: null,
      isSelecting: false,
      selectionStart: null
    }),
  
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  
  startSelection: (cell) =>
    set({
      isSelecting: true,
      selectionStart: cell,
      selectedCells: new Set([`${cell.row}-${cell.col}`])
    }),
  
  endSelection: () =>
    set({
      isSelecting: false,
      selectionStart: null
    }),
  
  selectRange: (start, end) =>
    set(() => {
      const newSelectedCells = new Set<string>()
      const minRow = Math.min(start.row, end.row)
      const maxRow = Math.max(start.row, end.row)
      const minCol = Math.min(start.col, end.col)
      const maxCol = Math.max(start.col, end.col)
      
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          newSelectedCells.add(`${row}-${col}`)
        }
      }
      
      return { selectedCells: newSelectedCells }
    }),
  
  isCellSelected: (row, col) => {
    const state = get()
    return state.selectedCells.has(`${row}-${col}`) ||
           state.selectedRows.has(row) ||
           state.selectedColumns.has(col)
  },
  
  isRowSelected: (row) => {
    const state = get()
    return state.selectedRows.has(row)
  },
  
  isColumnSelected: (col) => {
    const state = get()
    return state.selectedColumns.has(col)
  },
  
  getSelectedData: (data) => {
    const state = get()
    const selectedData: string[][] = []
    
    if (state.selectedRows.size > 0) {
      state.selectedRows.forEach(row => {
        if (data[row]) {
          selectedData.push([...data[row]])
        }
      })
    } else if (state.selectedCells.size > 0) {
      const cellsByRow = new Map<number, number[]>()
      
      state.selectedCells.forEach(cellKey => {
        const [row, col] = cellKey.split('-').map(Number)
        if (!cellsByRow.has(row)) {
          cellsByRow.set(row, [])
        }
        cellsByRow.get(row)!.push(col)
      })
      
      Array.from(cellsByRow.entries())
        .sort(([a], [b]) => a - b)
        .forEach(([row, cols]) => {
          const rowData = cols.sort((a, b) => a - b)
            .map(col => data[row]?.[col] || '')
          selectedData.push(rowData)
        })
    }
    
    return selectedData
  },
  
  getSelectedCellsCount: () => {
    const state = get()
    return state.selectedCells.size
  }
}))