"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Sparkles } from "lucide-react"

interface AddColumnDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, type?: string) => void
}

export function AddColumnDialog({ open, onClose, onAdd }: AddColumnDialogProps) {
  const [columnName, setColumnName] = useState("")
  const [columnType, setColumnType] = useState("text")

  const handleSubmit = () => {
    if (columnName.trim()) {
      onAdd(columnName.trim(), columnType)
      setColumnName("")
      setColumnType("text")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Create a new column for your spreadsheet. You can enrich it later with AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Column Name</Label>
            <Input
              id="name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="e.g., Company Email"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Column Type (Optional)</Label>
            <Select value={columnType} onValueChange={setColumnType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!columnName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}