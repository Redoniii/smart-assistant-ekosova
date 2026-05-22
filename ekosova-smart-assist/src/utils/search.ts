import type { Service, SearchResult } from '../types'
import { services } from '../data/services'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim()
}

function scoreService(service: Service, query: string): number {
  const q = normalize(query)
  const words = q.split(/\s+/).filter(Boolean)
  let score = 0

  const title = normalize(service.title)
  const category = normalize(service.category)
  const shortDesc = normalize(service.shortDescription)
  const simpleDesc = normalize(service.simpleDescription)
  const keywords = service.keywords.map(normalize)

  // Exact title match
  if (title.includes(q)) score += 100

  // Word-by-word matching
  for (const word of words) {
    if (word.length < 3) continue

    // Title match
    if (title.includes(word)) score += 30

    // Keyword match (highest weight)
    for (const kw of keywords) {
      if (kw.includes(word) || word.includes(kw)) score += 25
    }

    // Description match
    if (shortDesc.includes(word)) score += 10
    if (simpleDesc.includes(word)) score += 8

    // Category match
    if (category.includes(word)) score += 5
  }

  return score
}

function getConfidence(score: number): 'high' | 'medium' | 'low' {
  if (score >= 60) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

export function searchServices(query: string): SearchResult[] {
  if (!query.trim()) return []

  const results = services
    .map((service) => ({
      service,
      score: scoreService(service, query),
      confidence: getConfidence(scoreService(service, query)),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  return results.slice(0, 3)
}

export function getBestMatch(query: string): SearchResult | null {
  const results = searchServices(query)
  return results.length > 0 ? results[0] : null
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export function getServicesByCategory(category: string): Service[] {
  return services.filter((s) => s.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(services.map((s) => s.category))]
}
