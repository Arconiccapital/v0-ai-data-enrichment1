# Testing Column Attachments Feature

## How to Test

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Upload a CSV file**:
   - Go to http://localhost:3000
   - Upload a CSV with company names or any data you want to enrich

3. **Add attachments to a column**:
   - Right-click on any column header
   - Select "Manage Attachments" from the context menu
   - Upload PDF, Word, Excel, or text files containing relevant context
   - Toggle "Use attachments as enrichment context" to ON

4. **Enrich the column**:
   - Right-click the same column header
   - Select "Enrich Column"
   - Enter a prompt that could benefit from the attachment context
   - Example: "Find the CEO name" (if your attachment contains leadership info)

5. **Verify attachment context is used**:
   - Check the browser console for logs showing attachment context is included
   - The enrichment should use information from the attached documents

## Sample Test Data

Create a CSV file with this content:

```csv
Company,Industry,CEO
Apple Inc,,,
Microsoft,,,
Amazon,,,
```

## Sample Attachment Content

Create a text file with this content to use as attachment:

```
Company Leadership Information:

Apple Inc:
- CEO: Tim Cook
- Founded: 1976
- Headquarters: Cupertino, California

Microsoft:
- CEO: Satya Nadella
- Founded: 1975
- Headquarters: Redmond, Washington

Amazon:
- CEO: Andy Jassy
- Founded: 1994
- Headquarters: Seattle, Washington
```

## Expected Results

When you enrich the CEO column with the prompt "Find the CEO name" and have the attachment enabled:
- Apple Inc → Tim Cook
- Microsoft → Satya Nadella
- Amazon → Andy Jassy

The LLM will use both web search AND the attachment context to provide accurate results.