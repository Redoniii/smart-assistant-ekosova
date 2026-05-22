export interface Service {
  id: string
  title: string
  category: string
  shortDescription: string
  simpleDescription: string
  keywords: string[]
  requiredDocuments: string[]
  steps: string[]
  faqs: FAQ[]
  estimatedTime: string
  agentTemplate: string
  relatedServices: string[]
}

export interface FAQ {
  question: string
  answer: string
}

export interface SupportRequest {
  id: string
  citizenQuestion: string
  citizenPhone?: string
  matchedServiceId: string
  matchedServiceTitle: string
  searchQuery: string
  simpleMode: boolean
  helpRequested: boolean
  timestamp: string
  status: 'new' | 'in_progress' | 'resolved'
  confidence: 'high' | 'medium' | 'low'
}

export interface SearchResult {
  service: Service
  score: number
  confidence: 'high' | 'medium' | 'low'
}

export type Language = 'sq' | 'en' | 'sr'

export interface AccessibilitySettings {
  largText: boolean
  highContrast: boolean
  language: Language
}

export interface AgentTemplate {
  id: string
  title: string
  content: string
  category: string
}
