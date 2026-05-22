import type { Service, AgentTemplate } from '../types'

export const services: Service[] = [
  {
    id: 'certifikate-lindjes',
    title: 'Certifikatë e Lindjes',
    category: 'Dokumente personale',
    shortDescription: 'Dokument zyrtar që dëshmon të dhënat e lindjes së një personi.',
    simpleDescription: 'Ky dokument tregon kur dhe ku keni lindur. Mund ta shkarkoni online nga eKosova.',
    keywords: ['lindje', 'certifikatë', 'fëmijë', 'dokument', 'ekstrakt', 'lindja', 'datëlindja', 'birthday', 'birth certificate'],
    requiredDocuments: ['Numri personal', 'Llogaria aktive në eKosova'],
    steps: [
      'Kyçuni në llogarinë tuaj në eKosova',
      'Zgjidhni kategorinë "Dokumente personale"',
      'Klikoni "Certifikatë e Lindjes"',
      'Plotësoni të dhënat e kërkuara',
      'Dërgoni kërkesën',
      'Shkarkoni dokumentin kur të jetë gati',
    ],
    faqs: [
      {
        question: 'A mund ta marr online?',
        answer: 'Po, nëse shërbimi është i aktivizuar për komunën tuaj.',
      },
      {
        question: 'A më duhet të shkoj fizikisht në komunë?',
        answer: 'Jo gjithmonë. Varet nga lloji i kërkesës dhe verifikimi i të dhënave.',
      },
      {
        question: 'Sa kushton kjo certifikatë?',
        answer: 'Certifikata e lindjes zakonisht lëshohet pa pagesë ose me tarifë minimale administrative.',
      },
    ],
    estimatedTime: 'Disa minuta deri në 1 ditë pune',
    agentTemplate:
      'I/e nderuar, për certifikatën e lindjes ju lutem kyçuni në eKosova, zgjidhni "Dokumente personale" dhe pastaj "Certifikatë e Lindjes". Ndiqni hapat në platformë dhe shkarkoni dokumentin kur kërkesa të aprovohet.',
    relatedServices: ['certifikate-vendbanimit', 'dokument-personal'],
  },
  {
    id: 'certifikate-vendbanimit',
    title: 'Certifikatë e Vendbanimit',
    category: 'Dokumente personale',
    shortDescription: 'Dokument zyrtar që dëshmon adresën e vendbanimit të një personi.',
    simpleDescription: 'Ky dokument tregon adresën ku jetoni zyrtarisht. Mund të nevojitet për aplikime të ndryshme.',
    keywords: ['vendbanim', 'adresë', 'ku jetoj', 'banim', 'dokument banimi', 'residence', 'address', 'jeton', 'banojë'],
    requiredDocuments: ['Numri personal', 'Llogaria aktive në eKosova', 'Konfirmim i adresës së vendbanimit'],
    steps: [
      'Kyçuni në llogarinë tuaj në eKosova',
      'Zgjidhni kategorinë "Dokumente personale"',
      'Klikoni "Certifikatë e Vendbanimit"',
      'Verifikoni adresën tuaj aktuale',
      'Dërgoni kërkesën',
      'Shkarkoni certifikatën kur të jetë aprovuar',
    ],
    faqs: [
      {
        question: 'Sa kohë zgjat procesi?',
        answer: 'Zakonisht nga disa minuta deri në 1 ditë pune, varësisht nga komuna juaj.',
      },
      {
        question: 'Çfarë bëj nëse adresa ime nuk është e saktë?',
        answer: 'Duhet të bëni ndërrimin e adresës fillimisht. Shihni shërbimin "Ndërrimi i Adresës".',
      },
      {
        question: 'A vlen ky dokument jashtë vendit?',
        answer: 'Varet nga kërkesat e institucionit të huaj. Mund t\'ju nevojitet apostilë.',
      },
    ],
    estimatedTime: 'Disa minuta deri në 1 ditë pune',
    agentTemplate:
      'I/e nderuar, për të aplikuar për Certifikatë të Vendbanimit, ju lutem kyçuni në llogarinë tuaj në eKosova, zgjidhni kategorinë "Dokumente personale" dhe pastaj shërbimin "Certifikatë e Vendbanimit". Për këtë shërbim zakonisht ju nevojitet numri personal dhe llogaria aktive në eKosova. Nëse hasni problem gjatë aplikimit, ju lutem kontrolloni të dhënat personale ose kontaktoni institucionin përgjegjës.',
    relatedServices: ['certifikate-lindjes', 'nderrim-adrese'],
  },
  {
    id: 'nderrim-adrese',
    title: 'Ndërrimi i Adresës',
    category: 'Gjendja civile',
    shortDescription: 'Shërbim për ndërrimin zyrtar të adresës së vendbanimit.',
    simpleDescription: 'Ky shërbim ju ndihmon ta përditësoni adresën tuaj zyrtare kur ndërroni vendbanim.',
    keywords: ['adresë', 'ndërrimi', 'banim', 'vendbanim', 'shpërngulje', 'zhvendosje', 'change address', 'lëvizje'],
    requiredDocuments: [
      'Numri personal',
      'Dokument identifikimi (letërnjoftim ose pasaportë)',
      'Dokument proof i adresës së re (faturë, kontratë qiraje, etj.)',
    ],
    steps: [
      'Kyçuni në llogarinë tuaj në eKosova',
      'Shkoni te seksioni "Gjendja Civile"',
      'Zgjidhni "Ndërrimi i Adresës"',
      'Plotësoni adresën e re',
      'Ngarkoni dokumentet mbështetëse',
      'Dërgoni kërkesën për verifikim',
      'Prisni konfirmimin nga komuna',
    ],
    faqs: [
      {
        question: 'Sa kohë merr ndërrimi i adresës?',
        answer: 'Zakonisht 1-3 ditë pune pasi dokumentet verifikohen.',
      },
      {
        question: 'A duhet të paraqitem fizikisht?',
        answer: 'Jo gjithmonë, por disa komuna mund të kërkojnë prezencë fizike për verifikim.',
      },
    ],
    estimatedTime: '1-3 ditë pune',
    agentTemplate:
      'I/e nderuar, për të ndërruar adresën tuaj zyrtare, ju lutem kyçuni në eKosova dhe shkoni te "Gjendja Civile" > "Ndërrimi i Adresës". Ju nevojiten dokumenti i identifikimit dhe një dokument që dëshmon adresën e re (si faturë utilitare ose kontratë qiraje). Procesi zakonisht zgjat 1-3 ditë pune.',
    relatedServices: ['certifikate-vendbanimit', 'dokument-personal'],
  },
  {
    id: 'dokument-personal',
    title: 'Aplikim për Dokument Personal',
    category: 'Dokumente personale',
    shortDescription: 'Aplikim online për letërnjoftim, pasaportë ose dokument tjetër identifikimi.',
    simpleDescription: 'Ky shërbim ju ndihmon të aplikoni për dokument identifikimi si letërnjoftim ose pasaportë.',
    keywords: ['letërnjoftim', 'dokument', 'ID', 'kartë identiteti', 'pasaportë', 'personal', 'identity', 'lnj', 'passport'],
    requiredDocuments: [
      'Numri personal',
      'Certifikatë e lindjes',
      'Foto biometrike',
      'Tarifë administrative',
    ],
    steps: [
      'Kyçuni në llogarinë tuaj në eKosova',
      'Zgjidhni "Dokumente personale" > "Dokument Personal"',
      'Zgjidhni llojin e dokumentit (letërnjoftim/pasaportë)',
      'Plotësoni formularin e aplikimit',
      'Paguani tarifën administrative',
      'Paraqituni fizikisht në zyrën e gjendjes civile për marrjen e gjurmëve',
      'Pritni njoftimin për tërheqje të dokumentit',
    ],
    faqs: [
      {
        question: 'Sa kushton letërnjoftimi?',
        answer: 'Tarifa ndryshon sipas komunës, zakonisht rreth 5-10 euro.',
      },
      {
        question: 'Sa kohë zgjat lëshimi?',
        answer: 'Zakonisht 5-10 ditë pune pas dorëzimit të dokumenteve.',
      },
      {
        question: 'A mund ta bëj gjithçka online?',
        answer: 'Aplikimi bëhet online, por duhet të paraqiteni fizikisht për marrjen e gjurmëve biometrike.',
      },
    ],
    estimatedTime: '5-10 ditë pune',
    agentTemplate:
      'I/e nderuar, për të aplikuar për letërnjoftim ose pasaportë, kyçuni në eKosova te "Dokumente personale" > "Dokument Personal". Plotësoni formularin, paguani tarifën dhe paraqituni fizikisht në komunë për marrjen e gjurmëve. Dokumenti është gati zakonisht brenda 5-10 ditëve pune.',
    relatedServices: ['certifikate-lindjes', 'nderrim-adrese'],
  },
  {
    id: 'regjistrim-biznesi',
    title: 'Regjistrim i Biznesit',
    category: 'Biznes',
    shortDescription: 'Regjistrim i ndërmarrjes individuale ose kompanisë përmes ARBK.',
    simpleDescription: 'Ky shërbim ju ndihmon të filloni regjistrimin e biznesit tuaj dhe të merrni Numrin Unik të Identifikimit (NUI).',
    keywords: ['biznes', 'kompani', 'regjistrim', 'NUI', 'ARBK', 'ndërmarrje', 'business', 'company', 'firmë', 'OAV'],
    requiredDocuments: [
      'Letërnjoftim ose pasaportë',
      'Numri personal',
      'Adresa e biznesit',
      'Tarifë regjistrimi',
      'Statuti i kompanisë (për shoqëri)',
    ],
    steps: [
      'Kyçuni në eKosova ose vizitoni ARBK online',
      'Zgjidhni llojin e biznesit (NI, OAV, SH.P.K, etj.)',
      'Plotësoni emrin e propozuar të biznesit',
      'Plotësoni të dhënat e themeluesve',
      'Ngarkoni dokumentet e kërkuara',
      'Paguani tarifën e regjistrimit',
      'Merrni NUI-n pas aprovimit',
    ],
    faqs: [
      {
        question: 'Sa kushton regjistrimi?',
        answer: 'Tarifa ndryshon sipas llojit të biznesit: NI rreth 5 euro, SH.P.K rreth 30 euro.',
      },
      {
        question: 'Sa kohë merr regjistrimi?',
        answer: 'Zakonisht 1-3 ditë pune nëse dokumentet janë të plota.',
      },
      {
        question: 'Çfarë është NUI?',
        answer: 'NUI (Numri Unik i Identifikimit) është numri identifikues i biznesit tuaj te autoritetet tatimore.',
      },
    ],
    estimatedTime: '1-3 ditë pune',
    agentTemplate:
      'I/e nderuar, për të regjistruar biznesin tuaj, mund ta bëni online përmes platformës ARBK (Agjencia për Regjistrim të Bizneseve të Kosovës). Zgjidhni llojin e biznesit, plotësoni të dhënat e kërkuara, paguani tarifën dhe merrni NUI-n. Procesi zakonisht zgjat 1-3 ditë pune.',
    relatedServices: ['tatimi-prone'],
  },
  {
    id: 'tatimi-prone',
    title: 'Tatimi në Pronë',
    category: 'Financa publike',
    shortDescription: 'Kontrollimi dhe pagesa e tatimit vjetor për pronën tuaj.',
    simpleDescription: 'Ky shërbim ju ndihmon të kontrolloni ose paguani tatimin për pronën tuaj. Tatimi paguhet çdo vit.',
    keywords: ['tatim', 'pronë', 'pagesë', 'faturë', 'komunë', 'property tax', 'taksë', 'taksa', 'borxh', 'detyrim'],
    requiredDocuments: [
      'Numri personal ose NUI',
      'Numri kadastral i pronës',
      'Llogaria aktive në eKosova',
    ],
    steps: [
      'Kyçuni në llogarinë tuaj në eKosova',
      'Shkoni te "Financa publike" > "Tatimi në Pronë"',
      'Kontrolloni detajet e pronës suaj',
      'Shihni shumën e tatimit të dueëshëm',
      'Zgjidhni metodën e pagesës',
      'Kryeni pagesën',
      'Ruani konfirmimin e pagesës',
    ],
    faqs: [
      {
        question: 'Kur duhet paguar tatimi i pronës?',
        answer: 'Zakonisht deri në fund të qershorit për vitin aktual. Kontrolloni me komunën tuaj.',
      },
      {
        question: 'Si llogaritet tatimi?',
        answer: 'Llogaritet bazuar në vlerën e tregut të pronës dhe zonën ku ndodhet.',
      },
      {
        question: 'Çfarë ndodh nëse nuk paguaj?',
        answer: 'Mund të aplikohen gjoba dhe kamatë për vonesë. Kontaktoni komunën nëse keni vështirësi pagese.',
      },
    ],
    estimatedTime: 'Menjëherë (pagesë online)',
    agentTemplate:
      'I/e nderuar, për të paguar tatimin e pronës, kyçuni në eKosova dhe shkoni te "Financa publike" > "Tatimi në Pronë". Kontrolloni shumën e tatimit dhe kryeni pagesën online. Mos harroni të ruani konfirmimin e pagesës.',
    relatedServices: ['regjistrim-biznesi'],
  },
  {
    id: 'ndihma-sociale',
    title: 'Aplikim për Ndihmë Sociale',
    category: 'Mirëqenie sociale',
    shortDescription: 'Aplikim për skemën e asistencës sociale për familjet në nevojë.',
    simpleDescription: 'Ky shërbim ju ndihmon të aplikoni për përkrahje sociale nëse i plotësoni kushtet. Ndihma sociale jepet çdo muaj.',
    keywords: ['ndihmë sociale', 'asistencë', 'familje', 'përkrahje', 'pagesë sociale', 'social assistance', 'asistencë sociale', 'ndihmë'],
    requiredDocuments: [
      'Dokument identifikimi për të gjithë anëtarët e familjes',
      'Vërtetim i të ardhurave (ose mungesës)',
      'Vërtetim i pronës',
      'Llogaria bankare',
      'Certifikatë familjare',
    ],
    steps: [
      'Kyçuni në eKosova ose vizitoni Qendrën për Punë Sociale',
      'Zgjidhni "Mirëqenie sociale" > "Ndihmë Sociale"',
      'Plotësoni formularin e aplikimit',
      'Ngarkoni dokumentet e kërkuara',
      'Dërgoni aplikimin',
      'Prisni vizitën e inspektorit social (nëse kërkohet)',
      'Merrni vendimin brenda 30 ditëve',
    ],
    faqs: [
      {
        question: 'Kush ka të drejtë për ndihmë sociale?',
        answer: 'Familjet me të ardhura shumë të ulëta ose pa të ardhura, sipas kritereve të MPMS.',
      },
      {
        question: 'Sa është shuma e ndihmës?',
        answer: 'Shuma ndryshon sipas numrit të anëtarëve të familjes dhe situatës.',
      },
      {
        question: 'Sa shpesh duhet riaplikuar?',
        answer: 'Zakonisht çdo 6 muaj ose çdo vit, varësisht nga rrethanat.',
      },
    ],
    estimatedTime: 'Deri në 30 ditë pune',
    agentTemplate:
      'I/e nderuar, për të aplikuar për ndihmë sociale, mund ta bëni online përmes eKosova ose duke vizituar Qendrën për Punë Sociale të komunës tuaj. Ju nevojiten dokumente identifikimi për gjithë familjen dhe vërtetim të gjendjes financiare. Procesi zakonisht zgjat deri në 30 ditë.',
    relatedServices: ['certifikate-lindjes', 'dokument-personal'],
  },
]

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'greeting',
    title: 'Përshëndetje',
    content:
      'Përshëndetje, faleminderit që kontaktuat eKosova. Do t\'ju ndihmoj me informacionin e nevojshëm për shërbimin tuaj.',
    category: 'Komunikim',
  },
  {
    id: 'missing-docs',
    title: 'Dokumente mungojnë',
    content:
      'Për të vazhduar me këtë shërbim, ju lutem sigurohuni që i keni dokumentet e nevojshme të përgatitura. Kontrolloni listën e dokumenteve të kërkuara dhe provoni përsëri.',
    category: 'Dokumentacion',
  },
  {
    id: 'technical-issue',
    title: 'Problem teknik',
    content:
      'Nëse platforma nuk po hapet ose shërbimi nuk po shfaqet, ju lutem provoni të rifreskoni faqen, të kontrolloni kyçjen tuaj ose të provoni përsëri më vonë. Nëse problemi vazhdon, kontaktoni mbështetjen teknike.',
    category: 'Teknik',
  },
  {
    id: 'escalation',
    title: 'Eskalim i rastit',
    content:
      'Rasti juaj kërkon verifikim shtesë. Do të përcillet te institucioni përgjegjës për trajtim të mëtejshëm. Do të kontaktoheni brenda 2-3 ditëve pune.',
    category: 'Eskalim',
  },
  {
    id: 'closing',
    title: 'Mbyllje e bisedës',
    content:
      'Faleminderit që kontaktuat eKosova. Shpresoj që kam mundur t\'ju ndihmoj. Nëse keni nevojë për ndihmë shtesë, mos hezitoni të na kontaktoni. Ju urojmë një ditë të mirë!',
    category: 'Komunikim',
  },
]

export const popularServiceIds = [
  'certifikate-lindjes',
  'certifikate-vendbanimit',
  'dokument-personal',
  'regjistrim-biznesi',
]

export const demoRequests = [
  {
    id: 'demo-001',
    citizenQuestion: 'Më duhet dokument që tregon ku jetoj',
    matchedServiceId: 'certifikate-vendbanimit',
    matchedServiceTitle: 'Certifikatë e Vendbanimit',
    searchQuery: 'Më duhet dokument që tregon ku jetoj',
    simpleMode: true,
    helpRequested: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'new' as const,
    confidence: 'high' as const,
  },
  {
    id: 'demo-002',
    citizenQuestion: 'Dua të regjistroj biznesin tim',
    matchedServiceId: 'regjistrim-biznesi',
    matchedServiceTitle: 'Regjistrim i Biznesit',
    searchQuery: 'Dua të regjistroj biznesin tim',
    simpleMode: false,
    helpRequested: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'in_progress' as const,
    confidence: 'high' as const,
  },
]
