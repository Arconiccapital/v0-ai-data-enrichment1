import { ContentCalendarGenerator } from "@/components/content-calendar-generator"

interface PageProps {
  params: Promise<{
    templateId: string
  }>
}

export default async function ContentCalendarPage({ params }: PageProps) {
  const { templateId } = await params
  return <ContentCalendarGenerator templateId="content_calendar" />
}