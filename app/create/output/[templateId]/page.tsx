import { SocialMediaTemplateGenerator } from "@/components/social-media-template-generator"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generate Social Media Content - Lighthouse AI",
  description: "Create platform-optimized social media posts from your data",
}

interface PageProps {
  params: Promise<{
    templateId: string
  }>
}

export default async function TemplatePage({ params }: PageProps) {
  const { templateId } = await params
  return <SocialMediaTemplateGenerator templateId={templateId} />
}