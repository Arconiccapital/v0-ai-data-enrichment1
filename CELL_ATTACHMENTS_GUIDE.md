# Cell-Level Attachments Feature Guide

## Overview
The attachment system now supports **both cell-level AND column-level attachments**, providing granular control over context for AI enrichment.

## Architecture Changes

### Two-Tier Attachment System:
1. **Cell Attachments** - Unique documents for specific cells (row/column intersection)
2. **Column Attachments** - Shared context for all cells in a column

### Priority System:
- Cell attachments take priority when available
- Falls back to column attachments if no cell attachments exist
- Can combine both for comprehensive context

## How to Test

### 1. Basic Setup
```bash
npm run dev
# Navigate to http://localhost:3000
```

### 2. Upload Test Data
Upload the provided `test-data.csv`:
```csv
Company,Industry,Revenue,Employees,CEO
Apple Inc,Technology,,,
Microsoft Corporation,Software,,,
Amazon.com Inc,E-commerce,,,
```

### 3. Test Cell-Level Attachments

#### Add Cell Attachment:
1. **Right-click on a specific cell** (e.g., Apple Inc's CEO cell)
2. Select **"Manage Attachments"**
3. You'll see two tabs:
   - **Cell Attachments** - Documents for this specific cell only
   - **Column Context** - Documents shared by all cells in the column
4. Upload a document specific to Apple (e.g., apple-leadership.txt)
5. Notice the paperclip indicator appears on that cell with count

#### Add Different Cell Attachment:
1. Right-click on Microsoft's CEO cell
2. Upload a different document (e.g., microsoft-executives.pdf)
3. Each cell now has its own unique context

### 4. Test Column-Level Attachments

1. Right-click on the column header "CEO"
2. Select "Manage Attachments"
3. Upload a general document (e.g., tech-ceo-database.txt)
4. This becomes fallback context for all cells without specific attachments

### 5. Test Enrichment with Context

#### Cell with Specific Attachment:
1. Right-click Apple's CEO cell
2. Select "Enrich This Cell"
3. The AI will use Apple-specific document as primary context

#### Cell without Attachment (uses column context):
1. Right-click Amazon's CEO cell (no cell attachment)
2. Select "Enrich This Cell"  
3. The AI will use the column-level attachment as context

## Use Cases

### 1. Research & Analysis
Each company row has its own research documents:
- Row 1: Apple → [apple-10k.pdf, apple-patents.docx]
- Row 2: Microsoft → [msft-financials.xlsx, msft-strategy.pptx]
- Row 3: Amazon → [amzn-warehouse-data.csv]

### 2. Generated Reports
AI generates reports that get stored with specific cells:
- Generate analysis → Auto-save as cell attachment
- Future enrichments use previous analysis as context

### 3. Hierarchical Context
- **Column**: General industry reports
- **Cell**: Company-specific documents
- AI uses both, prioritizing specific over general

## Visual Indicators

- **Paperclip with number**: Shows attachment count on cells
- **Blue info icon**: Indicates AI-enriched content
- **Both icons**: Cell has both attachments and enrichment

## File Storage Structure

```
.uploads/
├── cells/           # Cell-specific attachments
│   ├── 0-0/        # Column 0, Row 0
│   ├── 0-1/        # Column 0, Row 1
│   └── 1-0/        # Column 1, Row 0
└── columns/         # Column-level attachments
    ├── 0/          # Column 0 shared docs
    └── 1/          # Column 1 shared docs
```

## API Changes

### Upload Endpoint
```javascript
// Cell attachment
formData.append('rowIndex', '0')  // Specific cell
formData.append('columnIndex', '2')

// Column attachment (no rowIndex)
formData.append('columnIndex', '2')
```

### Context Priority in Enrichment
```javascript
1. Check for cell attachments
2. If none, check column attachments  
3. Combine with row context
4. Send to LLM for enrichment
```

## Benefits

1. **Granular Control**: Each cell can have unique supporting documents
2. **Efficient Defaults**: Column attachments provide baseline context
3. **Storage Optimization**: Share common docs at column level
4. **Better Accuracy**: More relevant context = better AI results
5. **Audit Trail**: Track which documents influenced each result

## Next Steps

Future enhancements could include:
- Row-level attachments (shared across all cells in a row)
- Automatic document generation and storage
- Attachment versioning and history
- Cross-reference between related cells
- Bulk attachment upload for multiple cells