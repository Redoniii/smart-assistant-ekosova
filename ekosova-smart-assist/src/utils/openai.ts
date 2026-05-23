import type { Service } from '../types'

export async function streamCitizenAnswer(
  question: string,
  service: Service,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!apiKey || apiKey === 'sk-...') {
    onError('Çelësi API nuk është vendosur. Shto VITE_OPENAI_API_KEY në .env.local')
    return
  }

  const prompt = `Qytetari pyet: "${question}"
Shërbimi: ${service.title}
Portali zyrtar: ${service.portalUrl}
Hapat konkretë në portal:
${service.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
Dokumentet: ${service.requiredDocuments.join(', ')}
Koha e pritjes: ${service.estimatedTime}

Shkruaj një përgjigje të shkurtër drejtpërdrejt tek qytetari, në shqip. Udhëzoje të shkojë në ${service.portalUrl} dhe jepi hapat kryesorë se çfarë të klikojë dhe çfarë t'i duhet gati. Ji i qartë dhe konkret. Pa tituj — vetëm tekst i natyrshëm.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Je Smart Assist i eKosova. Ndihmon qytetarët të gjejnë shërbime publike. Gjithmonë përgjigju VETËM në gjuhën shqipe — shkurt, qartë dhe me mirësi.' },
        { role: 'user', content: prompt },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 280,
    }),
  })

  if (!response.ok) {
    onError(`Gabim API: ${response.status}`)
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') { onDone(accumulated); return }
      try {
        const c = JSON.parse(data).choices?.[0]?.delta?.content ?? ''
        if (c) { accumulated += c; onChunk(c) }
      } catch { /* skip incomplete chunk */ }
    }
  }
  onDone(accumulated)
}

export interface CoPilotAnalysis {
  situation: string
  situationType: 'routine' | 'sensitive' | 'urgent' | 'redirect' | 'complex'
  opening: string
  coaching: string[]
  suggestedAnswer: string
  watchOut: string[]
  verification: string[]
}

function buildPrompt(citizenQuestion: string, service: Service): string {
  return `Ti je Co-Pilot i eKosova — asistent situacional për agjentët e call center. Analizon LLOJIN e thirrjes dhe udhëzon agjentin se si ta menaxhojë atë hap-pas-hapi. Gjithmonë VETËM në shqip.

PYETJA E QYTETARIT: "${citizenQuestion}"
SHËRBIMI: ${service.title} (${service.category})
PORTALI ZYRTAR: ${service.portalUrl}
HAPAT NË PORTAL:
${service.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}
DOKUMENTET: ${service.requiredDocuments.join(', ')}
KOHA: ${service.estimatedTime}
FAQ: ${service.faqs.map(f => `[${f.question}: ${f.answer}]`).join(' ')}

RREGULL: Gjithmonë udhëzo qytetarin të përdorë portalin ONLINE (${service.portalUrl}). Kurrë mos sugjero zyrë fizike nëse shërbimi bëhet online.

Bëj analizën. Përgjigju SAKTËSISHT në këtë format:

## SITUATION
[1-2 fjali: çfarë situate është kjo thirrje? Çfarë dëshiron qytetari dhe a ka ndonjë kompleksitet apo ndjenjë që agjenti duhet ta ketë parasysh?]

## SITUATION_TYPE
[vetëm një fjalë nga lista: routine / sensitive / urgent / redirect / complex]

## OPENING
[Fjalia e parë SAKTË që agjenti duhet ta thotë — të ngrohtë, me emrin e shërbimit, konfirmim se është në vendin e duhur]

## COACHING
[5-6 hapa konkretë si ta menaxhojë agjenti thirrjen — jo skriptë, por udhëzim SE ÇKA TË BËJË: çfarë të pyesë, çfarë të konfirmojë, si ta udhëzojë qytetarin nëpër portal, si ta mbyllë thirrjen]

## SUGGESTED_ANSWER
[Skripti i plotë i gatshëm — agjenti mund ta lexojë drejtpërdrejt. Fillo me "Mirëdita, faleminderit që kontaktuat eKosova!" dhe jepi URL-në e portalit me hapat konkretë. Mbaro me "A keni ndonjë pyetje tjetër?"]

## WATCH_OUT
[2-3 paralajmërime specifike: çfarë mund të shkojë keq, keqkuptime të mundshme, raste kur mund të duhet eskalim]

## VERIFY
[3 pyetje kontrolli që agjenti t'i bëjë para se ta mbyllë thirrjen — si "A i keni dokumentet gati?", "A e keni hapur portalin?"]`
}

export async function streamCoPilotAnalysis(
  citizenQuestion: string,
  service: Service,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

  if (!apiKey || apiKey === 'sk-...') {
    onError('VITE_OPENAI_API_KEY nuk është vendosur. Shto çelësin në .env.local.')
    return
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ti je Co-Pilot i eKosova — asistent situacional i trajnuar për call center të shërbimeve publike të Kosovës. Rolin tënd nuk është vetëm të gjenerosh skriptë — por të analizosh situatën, të udhëzosh agjentin se ÇSI ta menaxhojë thirrjen, çfarë ta ketë parasysh dhe si ta mbyllë me sukses. Gjithmonë VETËM në shqip.',
        },
        {
          role: 'user',
          content: buildPrompt(citizenQuestion, service),
        },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    onError(`OpenAI API error ${response.status}: ${errText}`)
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') {
        onDone(accumulated)
        return
      }
      try {
        const parsed = JSON.parse(data)
        const content: string = parsed.choices?.[0]?.delta?.content ?? ''
        if (content) {
          accumulated += content
          onChunk(content)
        }
      } catch {
        // incomplete JSON chunk — skip
      }
    }
  }

  onDone(accumulated)
}

export interface FollowUpMessage {
  id: string
  question: string
  answer: string
  streaming: boolean
}

export async function streamFollowUp(
  citizenQuestion: string,
  service: Service,
  previousMessages: FollowUpMessage[],
  followUpQuestion: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

  if (!apiKey || apiKey === 'sk-...') {
    onError('VITE_OPENAI_API_KEY nuk është vendosur.')
    return
  }

  // Build conversation history as context
  const historyContext = previousMessages.length > 0
    ? '\n\nBISEDA E MËPARSHME:\n' + previousMessages.map(
        (m) => `Pyetja: ${m.question}\nPërgjigjja: ${m.answer}`
      ).join('\n\n')
    : ''

  const userContent =
    `Konteksti: Agjenti po ndihmon një qytetar me shërbimin "${service.title}".` +
    `\nPyetja origjinale e qytetarit: "${citizenQuestion}"` +
    historyContext +
    `\n\nPYETJA E RE: "${followUpQuestion}"` +
    `\n\nJep një përgjigje të shkurtër, të drejtpërdrejtë dhe profesionale në shqip që agjenti mund ta përdorë menjëherë. Mos përdor tituj ose seksione — vetëm përgjigja.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ti je Co-Pilot i eKosova. Gjithmonë përgjigju VETËM në gjuhën shqipe. Jep përgjigje koncize, profesionale dhe të gatshme për t\'u lexuar drejtpërdrejt te qytetari — si agjent i vërtetë call center.',
        },
        { role: 'user', content: userContent },
      ],
      stream: true,
      temperature: 0.35,
      max_tokens: 400,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    onError(`OpenAI error ${response.status}: ${errText}`)
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') { onDone(accumulated); return }
      try {
        const parsed = JSON.parse(data)
        const content: string = parsed.choices?.[0]?.delta?.content ?? ''
        if (content) { accumulated += content; onChunk(content) }
      } catch { /* skip */ }
    }
  }

  onDone(accumulated)
}

export function parseAnalysis(raw: string): CoPilotAnalysis {
  const get = (section: string): string => {
    const regex = new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n## |$)`)
    return (regex.exec(raw)?.[1] ?? '').trim()
  }

  const parseBullets = (text: string): string[] =>
    text
      .split('\n')
      .map((l) => l.replace(/^[\d]+\.\s*|^[•\-\*]\s*/, '').trim())
      .filter(Boolean)

  const rawType = get('SITUATION_TYPE').toLowerCase()
  const validTypes = ['routine', 'sensitive', 'urgent', 'redirect', 'complex'] as const
  const situationType = (validTypes.find((t) => rawType.includes(t)) ?? 'routine')

  return {
    situation: get('SITUATION'),
    situationType,
    opening: get('OPENING'),
    coaching: parseBullets(get('COACHING')),
    suggestedAnswer: get('SUGGESTED_ANSWER'),
    watchOut: parseBullets(get('WATCH_OUT')),
    verification: parseBullets(get('VERIFY')),
  }
}
