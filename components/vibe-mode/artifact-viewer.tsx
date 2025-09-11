"use client"

import { useMemo } from 'react'

interface ArtifactViewerProps {
  html: string
  headers: string[]
  data: string[][] | Array<Record<string, string>>
}

export function ArtifactViewer({ html, headers, data }: ArtifactViewerProps) {
  const srcdoc = useMemo(() => {
    // Prepare window.__DATA__ for the artifact
    const rows = Array.isArray(data) && data.length > 0 && Array.isArray(data[0])
      ? (data as string[][]).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])))
      : (data as Array<Record<string, string>>)

    const bootstrap = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Inter,system-ui,Arial,sans-serif;} .container{padding:16px;}</style>
</head><body>
<script>window.__DATA__ = { headers: ${JSON.stringify(headers)}, rows: ${JSON.stringify(rows)} };</script>
${html}
</body></html>`
    return bootstrap
  }, [html, headers, data])

  return (
    <div className="w-full h-full">
      <iframe
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
        title="Artifact Viewer"
      />
    </div>
  )
}

