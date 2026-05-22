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
Shërbimi: ${service.title} (${service.category})
Përshkrimi: ${service.simpleDescription}
Dokumentet: ${service.requiredDocuments.join(', ')}
Hapat: ${service.steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}
Koha: ${service.estimatedTime}

Shkruaj një përgjigje 3–5 fjali drejtpërdrejt tek qytetari, në shqip. Ji miqësor dhe i qartë. Pa tituj, pa formatim — vetëm tekst i natyrshëm.`

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
  suggestedAnswer: string
  keyPoints: string[]
  followUpQuestions: string[]
  toneTips: string
}

function buildPrompt(citizenQuestion: string, service: Service): string {
  return `Ti je Co-Pilot i eKosova — ndihmon agjentët e call center të Kosovës të përgjigjen me profesionalizëm dhe mirësjellje ndaj qytetarëve, GJITHMONË në gjuhën shqipe.

PYETJA E QYTETARIT: "${citizenQuestion}"

SHËRBIMI I PËRPUTHUR: ${service.title} (${service.category})
PËRSHKRIMI: ${service.shortDescription}
DOKUMENTET E NEVOJSHME: ${service.requiredDocuments.join(', ')}
HAPAT: ${service.steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}
PYETJE TË SHPESHTA: ${service.faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join(' | ')}
KOHA E VLERËSUAR: ${service.estimatedTime}

Bëj një analizë Co-Pilot. Përgjigju SAKTËSISHT në këtë format:

## SUGGESTED_ANSWER
[Shkruaj përgjigjen e plotë që agjenti e lexon drejtpërdrejt te qytetari.
DUHET të fillojë me një përshëndetje profesionale si: "Mirëdita, faleminderit që kontaktuat eKosova! Jam këtu t'ju ndihmoj."
DUHET të mbulojë pyetjen qartë dhe plotësisht.
DUHET të mbarojë me: "A keni ndonjë pyetje tjetër? Jemi gjithmonë në dispozicion për ju." ose diçka të ngjashme.
Toni: i ngrohtë, profesional, miqësor — si agjent i vërtetë call center.]

## KEY_POINTS
[Rendit 3-5 pika kyçe që agjenti duhet të mbulojë, secila në rresht të ri me •]

## FOLLOW_UP_QUESTIONS
[Rendit 3 pyetje që qytetari mund t'i bëjë më pas, secila në rresht të ri me •]

## TONE_TIPS
[Shkruaj 2-3 fjali me këshilla specifike mbi tonin dhe komunikimin për këtë rast.]`
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
            'Ti je Co-Pilot i eKosova — asistent për agjentët e call center të shërbimeve publike të Kosovës. Gjithmonë përgjigju VETËM në gjuhën shqipe. Sugjero përgjigje profesionale, të ngrohta dhe miqësore që fillojnë me përshëndetje si "Mirëdita, faleminderit që kontaktuat eKosova!" dhe mbarojnë me ofertë ndihme të mëtejshme.',
        },
        {
          role: 'user',
          content: buildPrompt(citizenQuestion, service),
        },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 900,
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
      .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean)

  return {
    suggestedAnswer: get('SUGGESTED_ANSWER'),
    keyPoints: parseBullets(get('KEY_POINTS')),
    followUpQuestions: parseBullets(get('FOLLOW_UP_QUESTIONS')),
    toneTips: get('TONE_TIPS'),
  }
}
