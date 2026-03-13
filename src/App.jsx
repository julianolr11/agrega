import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import emailjs from '@emailjs/browser'
import { QRCode } from 'react-qr-code'
import { compressToEncodedURIComponent } from 'lz-string'
import './App.css'

const defaultCategoriesByLang = {
  'pt-BR': ['Compras', 'Desenhos', 'Vídeos', 'Comprovante', 'Receita'],
  'en-US': ['Shopping', 'Sketches', 'Videos', 'Receipt', 'Recipe'],
}

const getDefaultCategories = (lang) => defaultCategoriesByLang[lang] || defaultCategoriesByLang['pt-BR']

const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}

const translations = {
  'pt-BR': {
    linksLabel: 'links',
    close: 'Fechar',
    settings: 'Configurações',
    pairingButton: 'QR de pareamento',
    pairingTitle: 'Sincronizar com o celular',
    pairingSubtitle: 'Escaneie no app mobile para juntar os links. O PIN deve bater.',
    pairingPinLabel: 'PIN',
    pairingPayloadLabel: 'Código',
    pairingCopy: 'Copiar código',
    pairingCopied: 'Código copiado',
    pairingScanHint: 'No app mobile, toque em Escanear QR e confirme o PIN exibido aqui.',
    captureEyebrow: 'Cole o link, imagem, texto ou escreva o que quiser guardar',
    captureTitle: 'Capture links sem atrito',
    captureSubtitle: 'Cole, clique no "+" e dê um nome rápido. Nós guardamos na categoria certa.',
    inputPlaceholder: 'https://...',
    addLinkErrorEmpty: 'Cole um link antes de adicionar.',
    addLinkErrorInvalid: 'Digite um link válido ou escreva algo para salvar.',
    dashboardEyebrow: 'Dashboard',
    dashboardTitle: 'Seus links guardados',
    searchPlaceholder: 'Buscar por nome, categoria ou link',
    filterTooltip: 'Filtros',
    filterDateDesc: 'Data (mais recentes)',
    filterDateAsc: 'Data (mais antigos)',
    filterAlphaAsc: 'A–Z',
    filterAlphaDesc: 'Z–A',
    filterSortTitle: 'Ordenar',
    filterCategoryTitle: 'Categorias',
    editModeEnter: 'Entrar no modo edição',
    editModeExit: 'Sair do modo edição',
    emptyDashboard: 'Adicione o primeiro link para preencher seu painel.',
    sidebarHome: 'Início',
    sidebarNewReminder: 'Criar lembrete',
    sidebarViewReminders: 'Ver lembretes',
    sidebarCategories: 'Categorias',
    sidebarHint: 'clique para filtrar',
    sidebarAddHint: 'Adicione um link para vê-lo aqui.',
    all: 'Todas',
    openTooltip: 'Abrir no navegador',
    copyTooltip: 'Copiar',
    editTooltip: 'Editar link',
    deleteTooltip: 'Excluir link',
    badgeImage: 'Imagem',
    badgeText: 'Texto',
    cardCopied: 'Link copiado',
    cardCopyFail: 'Não foi possível copiar',
    cardImageCopied: 'Imagem copiada',
    cardTextCopied: 'Texto copiado',
    cardOpening: 'Abrindo no navegador',
    cardViewingImage: 'Visualizando imagem',
    cardViewingText: 'Visualizando texto',
    deleteConfirm: 'Excluir link',
    deleteQuestion: 'Tem certeza que deseja excluir?',
    cancel: 'Cancelar',
    delete: 'Excluir',
    defaultCategory: 'Sem categoria',
    defaultLinkTitle: 'Link sem nome',
    defaultImageTitle: 'Imagem colada',
    defaultTextTitle: 'Texto colado',
    modalLinkDetected: 'Identificamos um link',
    modalLinkTitle: 'Dê um nome e uma categoria',
    nameLabel: 'Nome',
    namePlaceholder: 'Ex: Lista de compras',
    imageNamePlaceholder: 'Ex: Screenshot',
    textNamePlaceholder: 'Ex: Nota rápida',
    existingCategory: 'Categoria existente',
    newCategory: 'Ou crie uma nova',
    newCategoryPlaceholder: 'Nova categoria',
    linkLabel: 'Link',
    add: 'Adicionar',
    editLink: 'Editar link',
    editLinkDesc: 'Atualize o título, link ou categoria',
    editNamePlaceholder: 'Ex: Referências',
    save: 'Salvar',
    reminderNew: 'Novo lembrete',
    reminderSubtitle: 'Defina assunto, data e vínculo',
    subjectLabel: 'Assunto',
    subjectPlaceholder: 'Ex: Revisar artigo',
    dateLabel: 'Data',
    reminderSave: 'Salvar lembrete',
    reminderCreated: 'Lembrete criado',
    reminderUpdated: 'Lembrete atualizado',
    reminderRemoved: 'Lembrete removido',
    reminderMoved: 'Lembrete movido',
    reminderLinkLabel: 'Escolha um link',
    reminderNone: 'Nenhum link cadastrado.',
    backupTitle: 'Backup e restauração',
    backupDescription: 'Exporte um .json com links, categorias e lembretes ou restaure um arquivo existente.',
    backupExport: 'Exportar backup',
    backupImport: 'Restaurar backup',
    backupExported: 'Backup gerado',
    backupRestored: 'Backup restaurado',
    backupRestoreFail: 'Não foi possível restaurar o backup',
    remindersTitle: 'Lembretes',
    remindersSubtitle: 'Calendário expandido',
    remindersHint: 'Arraste um lembrete para outra data direto no calendário.',
    back: 'Voltar',
    newReminder: 'Novo lembrete',
    monthPrev: 'Mês anterior',
    monthNext: 'Próximo mês',
    calendarEmpty: '—',
    weekdaysShort: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    calendarPlus: 'Novo lembrete neste dia',
    imageDetected: 'Imagem detectada',
    imageTitle: 'Defina um nome e uma categoria',
    imageEditInfo: 'Este item é uma imagem colada. O link interno é gerado automaticamente.',
    imagePreviewAria: 'Pré-visualização da imagem colada',
    pastedImageAlt: 'Imagem colada',
    imageMissing: 'Nenhuma imagem disponível para salvar.',
    saveImage: 'Salvar imagem',
    textDetected: 'Texto detectado',
    textTitle: 'Salve o texto colado',
    textPreview: 'Pré-visualização',
    textLabel: 'Texto',
    textPreviewAria: 'Pré-visualização do texto colado',
    textMissing: 'Nenhum texto disponível para salvar.',
    saveText: 'Salvar texto',
    viewerTitle: 'Visualização',
    viewerContent: 'Conteúdo',
    zoomLabel: 'Zoom',
    zoomOut: 'Diminuir zoom',
    zoomIn: 'Aumentar zoom',
    resetZoom: 'Resetar zoom',
    copy: 'Copiar',
    emailSetupEyebrow: 'Vamos configurar',
    emailSetupTitle: 'Receba seus lembretes por e-mail',
    emailSetupHint: 'Informe um e-mail. Usaremos para enviar cada lembrete criado.',
    later: 'Depois',
    saveEmail: 'Salvar e-mail',
    settingsEyebrow: 'Configurações',
    settingsTitle: 'Preferências da conta',
    languageLabel: 'Idioma',
    langPt: 'Português (PT-BR)',
    langEn: 'English (US)',
    emailLabel: 'E-mail para lembretes',
    emailPlaceholder: 'voce@exemplo.com',
    settingsSaved: 'Configurações salvas',
    emailSaved: 'E-mail configurado',
    linkRemoved: 'Link removido',
    linkUpdated: 'Link atualizado',
    linkUpdatedError: 'Escolha ou crie uma categoria.',
    reminderSubjectRequired: 'Informe um assunto',
    reminderDateRequired: 'Escolha uma data',
    emailInvalid: 'Informe um e-mail válido',
    imageReadFail: 'Não conseguimos ler a imagem do clipboard.',
    imageCopyFail: 'Não foi possível copiar',
    sendEmailFail: 'Não foi possível enviar o e-mail do lembrete',
    sendEmailMissingConfig: 'Configure os IDs do EmailJS para enviar e-mail',
    remindEmailSent: 'Lembrete enviado por e-mail',
    viewerCopied: 'Copiado',
    viewerCopyFail: 'Não foi possível copiar',
    badgeLinksHint: 'links',
    reminderLinkToggle: 'Vincular',
  },
  'en-US': {
    linksLabel: 'links',
    close: 'Close',
    settings: 'Settings',
    pairingButton: 'Pair via QR',
    pairingTitle: 'Sync with mobile',
    pairingSubtitle: 'Scan from the mobile app to merge links. PIN must match.',
    pairingPinLabel: 'PIN',
    pairingPayloadLabel: 'Code',
    pairingCopy: 'Copy code',
    pairingCopied: 'Code copied',
    pairingScanHint: 'On mobile, tap Scan QR and confirm the PIN shown here.',
    captureEyebrow: 'Paste link, image, text, or type what you want to save',
    captureTitle: 'Capture links effortlessly',
    captureSubtitle: 'Paste, hit "+" and name it quickly. We store it in the right category.',
    inputPlaceholder: 'https://...',
    addLinkErrorEmpty: 'Paste a link before adding.',
    addLinkErrorInvalid: 'Enter a valid link or type something to save.',
    dashboardEyebrow: 'Dashboard',
    dashboardTitle: 'Your saved links',
    searchPlaceholder: 'Search by name, category or link',
    filterTooltip: 'Filters',
    filterDateDesc: 'Date (newest)',
    filterDateAsc: 'Date (oldest)',
    filterAlphaAsc: 'A–Z',
    filterAlphaDesc: 'Z–A',
    filterSortTitle: 'Sort',
    filterCategoryTitle: 'Categories',
    editModeEnter: 'Enter edit mode',
    editModeExit: 'Exit edit mode',
    emptyDashboard: 'Add the first link to fill your dashboard.',
    sidebarHome: 'Home',
    sidebarNewReminder: 'Create reminder',
    sidebarViewReminders: 'View reminders',
    sidebarCategories: 'Categories',
    sidebarHint: 'click to filter',
    sidebarAddHint: 'Add a link to see it here.',
    all: 'All',
    openTooltip: 'Open in browser',
    copyTooltip: 'Copy',
    editTooltip: 'Edit link',
    deleteTooltip: 'Delete link',
    badgeImage: 'Image',
    badgeText: 'Text',
    cardCopied: 'Link copied',
    cardCopyFail: 'Could not copy',
    cardImageCopied: 'Image copied',
    cardTextCopied: 'Text copied',
    cardOpening: 'Opening in browser',
    cardViewingImage: 'Viewing image',
    cardViewingText: 'Viewing text',
    deleteConfirm: 'Delete link',
    deleteQuestion: 'Are you sure you want to delete?',
    cancel: 'Cancel',
    delete: 'Delete',
    defaultCategory: 'No category',
    defaultLinkTitle: 'Untitled link',
    defaultImageTitle: 'Pasted image',
    defaultTextTitle: 'Pasted text',
    modalLinkDetected: 'We found a link',
    modalLinkTitle: 'Give it a name and category',
    nameLabel: 'Name',
    namePlaceholder: 'e.g.: Shopping list',
    imageNamePlaceholder: 'e.g.: Screenshot',
    textNamePlaceholder: 'e.g.: Quick note',
    existingCategory: 'Existing category',
    newCategory: 'Or create a new one',
    newCategoryPlaceholder: 'New category',
    linkLabel: 'Link',
    add: 'Add',
    editLink: 'Edit link',
    editLinkDesc: 'Update title, link or category',
    editNamePlaceholder: 'e.g.: References',
    save: 'Save',
    reminderNew: 'New reminder',
    reminderSubtitle: 'Set subject, date and link',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'e.g.: Review article',
    dateLabel: 'Date',
    reminderSave: 'Save reminder',
    reminderCreated: 'Reminder created',
    reminderUpdated: 'Reminder updated',
    reminderRemoved: 'Reminder removed',
    reminderMoved: 'Reminder moved',
    reminderLinkLabel: 'Choose a link',
    reminderNone: 'No links saved.',
    backupTitle: 'Backup and restore',
    backupDescription: 'Export a .json with links, categories, and reminders or restore an existing file.',
    backupExport: 'Export backup',
    backupImport: 'Restore backup',
    backupExported: 'Backup generated',
    backupRestored: 'Backup restored',
    backupRestoreFail: 'Could not restore backup',
    remindersTitle: 'Reminders',
    remindersSubtitle: 'Expanded calendar',
    remindersHint: 'Drag a reminder to another date directly on the calendar.',
    back: 'Back',
    newReminder: 'New reminder',
    monthPrev: 'Previous month',
    monthNext: 'Next month',
    calendarEmpty: '—',
    weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    calendarPlus: 'New reminder for this day',
    imageDetected: 'Image detected',
    imageTitle: 'Set a name and category',
    imageEditInfo: 'This item is a pasted image. The internal link is generated automatically.',
    imagePreviewAria: 'Pasted image preview',
    pastedImageAlt: 'Pasted image',
    imageMissing: 'No image available to save.',
    saveImage: 'Save image',
    textDetected: 'Text detected',
    textTitle: 'Save the pasted text',
    textPreview: 'Preview',
    textLabel: 'Text',
    textPreviewAria: 'Pasted text preview',
    textMissing: 'No text available to save.',
    saveText: 'Save text',
    viewerTitle: 'Viewer',
    viewerContent: 'Content',
    zoomLabel: 'Zoom',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    resetZoom: 'Reset zoom',
    copy: 'Copy',
    emailSetupEyebrow: "Let's configure",
    emailSetupTitle: 'Get your reminders by e-mail',
    emailSetupHint: 'Provide an e-mail. We will send each created reminder to it.',
    later: 'Later',
    saveEmail: 'Save e-mail',
    settingsEyebrow: 'Settings',
    settingsTitle: 'Account preferences',
    languageLabel: 'Language',
    langPt: 'Portuguese (PT-BR)',
    langEn: 'English (US)',
    emailLabel: 'Reminder e-mail',
    emailPlaceholder: 'you@example.com',
    settingsSaved: 'Settings saved',
    emailSaved: 'E-mail saved',
    linkRemoved: 'Link removed',
    linkUpdated: 'Link updated',
    linkUpdatedError: 'Choose or create a category.',
    reminderSubjectRequired: 'Provide a subject',
    reminderDateRequired: 'Choose a date',
    emailInvalid: 'Provide a valid e-mail',
    imageReadFail: 'Could not read image from clipboard.',
    imageCopyFail: 'Could not copy',
    sendEmailFail: 'Could not send reminder e-mail',
    sendEmailMissingConfig: 'Configure EmailJS IDs to send e-mail',
    remindEmailSent: 'Reminder e-mailed',
    viewerCopied: 'Copied',
    viewerCopyFail: 'Could not copy',
    badgeLinksHint: 'links',
    reminderLinkToggle: 'Link it',
  },
}

const getTranslator = (language) => translations[language] || translations['pt-BR']

const buildCollator = (language) => new Intl.Collator(language || 'pt-BR', { sensitivity: 'base', numeric: true })

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const logoSrc = `${baseUrl}/agrega-logo.png`

const IconExternal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16" />
    <path d="M6 8h12" />
    <path d="M8 12h8" />
    <path d="M10 16h4" />
    <path d="M12 20h0" />
  </svg>
)

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 3 21l.5-4.5Z" />
  </svg>
)

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const IconCog = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.4 1.3 1.01 1.57.23.11.49.17.75.17H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
)

const IconQr = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3z" />
    <path d="M17 17h3v3h-3z" />
    <path d="M21 14v3" />
    <path d="M14 21h3" />
  </svg>
)

const IconView = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)


const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (error) {
    return false
  }
}

const normalizeUrlInput = (value = '') => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (isValidUrl(trimmed)) return trimmed
  const withoutScheme = trimmed.replace(/^https?:\/\//i, '')
  const withHttps = `https://${withoutScheme}`
  if (isValidUrl(withHttps)) return withHttps
  return ''
}

const getHost = (url) => {
  try {
    return new URL(url).hostname
  } catch (error) {
    return ''
  }
}

const YT_ICON = 'https://icons.duckduckgo.com/ip3/youtube.com.ico'
const TIKTOK_ICON = 'https://www.tiktok.com/favicon.ico'
const IG_ICON = 'https://icons.duckduckgo.com/ip3/instagram.com.ico'

const getYouTubeThumbnail = (url) => {
  // Keep as icon fallback for YouTube hosts only
  if (!isYouTubeUrl(url)) return ''
  return YT_ICON
}

const isYouTubeUrl = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    return host.includes('youtube.com') || host.includes('youtu.be')
  } catch (error) {
    return false
  }
}

const getCategoryHue = (value = '') => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

const buildCategoryPalette = (categories = [], currentPalette = {}) => {
  const goldenAngle = 137.508
  const normalizeHue = (value) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return null
    const wrapped = number % 360
    return wrapped < 0 ? wrapped + 360 : wrapped
  }

  const palette = {}
  const usedHues = new Set()

  categories.forEach((category) => {
    const hue = normalizeHue(currentPalette[category])
    if (category && hue !== null && !usedHues.has(Math.round(hue))) {
      palette[category] = Math.round(hue)
      usedHues.add(Math.round(hue))
    }
  })

  categories.forEach((category, index) => {
    if (!category) return
    if (palette[category] !== undefined) return
    let candidate = (210 + index * goldenAngle) % 360
    let attempts = 0
    while (usedHues.has(Math.round(candidate)) && attempts < 720) {
      candidate = (candidate + goldenAngle) % 360
      attempts += 1
    }
    const hue = Math.round(candidate)
    palette[category] = hue
    usedHues.add(hue)
  })

  return palette
}

const isTikTokUrl = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    return host.includes('tiktok.com') || host.includes('vm.tiktok.com')
  } catch (error) {
    return false
  }
}

const isInstagramUrl = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    return host.includes('instagram.com') || host.includes('instagr.am')
  } catch (error) {
    return false
  }
}

const isMercadoLivreUrl = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    return host.includes('mercadolivre') || host.includes('mercadolibre')
  } catch (error) {
    return false
  }
}

const fetchTikTokThumbnail = async (url) => {
  if (!isTikTokUrl(url)) return ''

  const oembedEndpoints = [
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    `https://www.tiktok.com/api/oembed?url=${encodeURIComponent(url)}`,
  ]

  const targets = [
    ...oembedEndpoints,
    ...oembedEndpoints.map((endpoint) => `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`),
  ]

  for (const target of targets) {
    try {
      const response = await fetch(target)
      if (!response.ok) continue

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        data = JSON.parse(text)
      }

      const thumb = data?.thumbnail_url || data?.thumbnailUrl || ''
      if (thumb) return thumb
    } catch (error) {
      // ignore and try next target
    }
  }

  return ''
}

const fetchInstagramThumbnail = async (url) => {
  // Instagram aggressively rate-limits; fall back to the icon only
  if (!isInstagramUrl(url)) return ''
  return ''

}

const extractMercadoLivreId = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (!host.includes('mercadolivre') && !host.includes('mercadolibre')) return ''

    const parts = parsed.pathname.split('/').filter(Boolean)
    const candidates = []

    const itemParam = parsed.searchParams.get('item_id')
    if (itemParam) candidates.push(itemParam)

    const itemParamAlt = parsed.searchParams.get('itemId')
    if (itemParamAlt) candidates.push(itemParamAlt)

    parts.forEach((segment) => {
      const match = segment.match(/MLB-?\d+/i)
      if (match) {
        candidates.push(match[0].replace('-', '').toUpperCase())
      }

      const pMatch = segment.match(/p(roduto)?/i)
      if (pMatch) {
        const nextIndex = parts.indexOf(segment) + 1
        const next = parts[nextIndex]
        if (next) {
          const nextMatch = next.match(/MLB-?\d+/i)
          if (nextMatch) candidates.push(nextMatch[0].replace('-', '').toUpperCase())
        }
      }
    })

    const id = candidates.find((value) => /MLB\d+/i.test(value))
    return id || ''
  } catch (error) {
    return ''
  }
}

const fetchMercadoLivreThumbnail = async (url) => {
  const id = extractMercadoLivreId(url)
  if (!id) return ''

  const scrapeTargets = [
    `https://r.jina.ai/${url}`,
    `https://r.jina.ai/https://api.mercadolibre.com/items/${id}`,
  ]

  const ogImageRegex = /<meta\s+property="og:image"\s+content="(.*?)"/i

  for (const target of scrapeTargets) {
    try {
      const response = await fetch(target)
      if (!response.ok) continue
      const text = await response.text()
      const match = text.match(ogImageRegex)
      const img = match?.[1] || ''
      if (img) return img
    } catch (error) {
      // ignore and try next target
    }
  }

  return ''
}

const fetchOgImage = async (url) => {
  try {
    const target = `https://r.jina.ai/${url}`
    const response = await fetch(target)
    if (!response.ok) return ''
    const text = await response.text()
    const ogMatch = text.match(/<meta\s+property="og:image"\s+content="(.*?)"/i)
      || text.match(/<meta\s+name="twitter:image"\s+content="(.*?)"/i)
    return ogMatch?.[1] || ''
  } catch (error) {
    return ''
  }
}

const getThumbnailUrl = (url) => {
  if (isYouTubeUrl(url)) return getYouTubeThumbnail(url)
  if (isInstagramUrl(url)) return IG_ICON
  if (isTikTokUrl(url)) return TIKTOK_ICON
  if (isMercadoLivreUrl(url)) return 'https://icons.duckduckgo.com/ip3/mercadolivre.com.br.ico'
  try {
    const parsed = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`
  } catch (error) {
    return ''
  }
}

const getFaviconUrl = (url) => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (isTikTokUrl(url)) return TIKTOK_ICON
    if (isInstagramUrl(url)) return IG_ICON
    if (isYouTubeUrl(url)) return YT_ICON
    if (isMercadoLivreUrl(url)) return 'https://icons.duckduckgo.com/ip3/mercadolivre.com.br.ico'
    // DuckDuckGo icon service (ico) is lightweight and more permissive
    return `https://icons.duckduckgo.com/ip3/${host}.ico`
  } catch (error) {
    return ''
  }
}

const getDomain = (url) => {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace('www.', '')
  } catch (error) {
    return url
  }
}

const getLinkLabel = (link, t) => {
  if (link?.type === 'image') return t?.('badgeImage') || 'Imagem colada'
  if (link?.type === 'text') return t?.('badgeText') || 'Texto colado'
  if (isTikTokUrl(link?.url)) return 'tiktok.com'
  if (isYouTubeUrl(link?.url)) return 'youtube.com'
  if (isInstagramUrl(link?.url)) return 'instagram.com'
  return getDomain(link.url)
}

const getSafeThumbnail = (link) => {
  if (!link) return ''
  if (isInstagramUrl(link.url)) return IG_ICON
  if (link.thumbnail && link.thumbnail.includes('instagram')) return IG_ICON
  if (isTikTokUrl(link.url)) return TIKTOK_ICON
  if (isYouTubeUrl(link.url)) return YT_ICON
  if (link.thumbnail) return link.thumbnail
  return getThumbnailUrl(link.url)
}

const sanitizeLinkBranding = (link) => {
  if (!link || link.type !== 'link') return link

  const host = getHost(link.url)
  let next = { ...link }

  if (isTikTokUrl(link.url)) {
    next.thumbnail = TIKTOK_ICON
    next.favicon = TIKTOK_ICON
    return next
  }

  if (isYouTubeUrl(link.url)) {
    next.thumbnail = YT_ICON
    next.favicon = YT_ICON
    return next
  }

  if (isInstagramUrl(link.url)) {
    next.thumbnail = IG_ICON
    next.favicon = IG_ICON
    return next
  }

  if (isMercadoLivreUrl(link.url)) {
    next.thumbnail = getThumbnailUrl(link.url) || next.thumbnail || 'https://icons.duckduckgo.com/ip3/mercadolivre.com.br.ico'
    next.favicon = getFaviconUrl(link.url) || next.favicon || 'https://icons.duckduckgo.com/ip3/mercadolivre.com.br.ico'
  }

  const foreignBrand = (value) => (next.thumbnail?.includes(value) || next.favicon?.includes(value))
  if (host && !isTikTokUrl(link.url) && foreignBrand('tiktok')) {
    next.thumbnail = getThumbnailUrl(link.url) || ''
    next.favicon = getFaviconUrl(link.url) || ''
  }
  if (host && !isYouTubeUrl(link.url) && foreignBrand('youtube')) {
    next.thumbnail = getThumbnailUrl(link.url) || ''
    next.favicon = getFaviconUrl(link.url) || ''
  }
  if (host && !isInstagramUrl(link.url) && foreignBrand('instagram')) {
    next.thumbnail = getThumbnailUrl(link.url) || ''
    next.favicon = getFaviconUrl(link.url) || ''
  }

  if (!next.thumbnail) next.thumbnail = getThumbnailUrl(link.url)
  if (!next.favicon) next.favicon = getFaviconUrl(link.url)

  return next
}

const getTextSnippet = (value = '') => {
  const limit = 50
  if (value.length <= limit) return value
  return `${value.slice(0, limit)}...`
}

const parseDateSafe = (value) => {
  const ts = Date.parse(value)
  return Number.isFinite(ts) ? ts : 0
}

const isValidEmail = (value = '') => {
  const email = value.trim()
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const getMonthLabel = (date, locale = 'pt-BR') => {
  const targetLocale = locale || 'pt-BR'
  return date.toLocaleDateString(targetLocale, { month: 'long', year: 'numeric' })
}

const compressImageData = (value) => {
  if (!value) return ''
  if (!value.startsWith('data:')) return value
  try {
    const compressed = compressToEncodedURIComponent(value)
    return compressed.length > 6000 ? '' : `data:lz:${compressed}`
  } catch (error) {
    return ''
  }
}

const buildCalendar = (monthDate) => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay() // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < startWeekday; i += 1) {
    days.push({ label: '', value: '' })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = new Date(year, month, day).toISOString().slice(0, 10)
    days.push({ label: String(day), value })
  }
  return days
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('read-failed'))
  reader.readAsDataURL(file)
})

function App() {
  const [linkInput, setLinkInput] = useState('')
  const [pendingUrl, setPendingUrl] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [pendingText, setPendingText] = useState('')
  const [modalPreview, setModalPreview] = useState({ thumbnail: '', favicon: '' })
  const [userEmail, setUserEmail] = useState('')
  const [emailForm, setEmailForm] = useState({ email: '' })
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [language, setLanguage] = useState('pt-BR')
  const prevLanguage = useRef('pt-BR')
  const t = useCallback((key) => getTranslator(language)[key] || key, [language])
  const collator = useMemo(() => buildCollator(language), [language])
  const filterRef = useRef(null)
  const backupInputRef = useRef(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ email: '', language: 'pt-BR' })
  const [settingsError, setSettingsError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: getDefaultCategories('pt-BR')[0],
    newCategory: '',
  })
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState(getDefaultCategories('pt-BR'))
  const [categoryPalette, setCategoryPalette] = useState(() => buildCategoryPalette(getDefaultCategories('pt-BR')))
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOption, setFilterOption] = useState('date_desc')
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [viewerTarget, setViewerTarget] = useState(null)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('')
  const [textError, setTextError] = useState('')
  const [view, setView] = useState('collect')
  const [actionMessage, setActionMessage] = useState('')
  const [cardMessage, setCardMessage] = useState({ id: '', text: '' })
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', url: '', category: '', newCategory: '', type: 'link', content: '' })
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [reminders, setReminders] = useState([])
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderError, setReminderError] = useState('')
  const [reminderEditTarget, setReminderEditTarget] = useState(null)
  const [reminderForm, setReminderForm] = useState({
    subject: '',
    date: new Date().toISOString().slice(0, 10),
    linkId: '',
    linkToggle: false,
  })
  const [reminderMonth, setReminderMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [reminderViewMonth, setReminderViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [reminderViewDate, setReminderViewDate] = useState(new Date().toISOString().slice(0, 10))
  const [showPairingModal, setShowPairingModal] = useState(false)
  const [pairingInfo, setPairingInfo] = useState({ pin: '', host: '', port: '', payload: '', endpoint: '', oversize: false })
  const [pairingToast, setPairingToast] = useState('')
  const [syncHash, setSyncHash] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ active: false, total: 0, current: 0, label: '' })
  const startSyncProgress = useCallback((label, total) => {
    const safeTotal = Math.max(total || 0, 1)
    setSyncProgress({ active: true, total: safeTotal, current: 0, label })
  }, [])

  const updateSyncProgress = useCallback((current) => {
    setSyncProgress((prev) => {
      const capped = Math.min(current, prev.total || 1)
      return { ...prev, current: capped }
    })
  }, [])

  const finishSyncProgress = useCallback(() => {
    setSyncProgress((prev) => ({ ...prev, current: prev.total || 1 }))
    setTimeout(() => setSyncProgress({ active: false, total: 0, current: 0, label: '' }), 700)
  }, [])

  const pushCurrentSnapshot = useCallback(async () => {
    if (!window?.agrega?.syncPush) return null
    const payload = {
      type: 'agrega-sync',
      version: 1,
      generatedAt: new Date().toISOString(),
      pin: pairingInfo.pin,
      language,
      categories,
      links,
      reminders,
      categoryPalette,
    }
    const response = await window.agrega.syncPush({ pin: pairingInfo.pin, payload })
    return response
  }, [categories, language, links, pairingInfo.pin, reminders])

  useEffect(() => {
    const savedEmail = localStorage.getItem('agrega_email') || ''
    if (savedEmail) {
      setUserEmail(savedEmail)
      setEmailForm({ email: savedEmail })
      setSettingsForm((prev) => ({ ...prev, email: savedEmail }))
    } else {
      setShowEmailModal(true)
    }

    const savedLang = localStorage.getItem('agrega_lang') || 'pt-BR'
    const defaultCategories = getDefaultCategories(savedLang)
    setLanguage(savedLang)
    setSettingsForm((prev) => ({ ...prev, language: savedLang }))
    setCategories(defaultCategories)
    setCategoryPalette((prev) => buildCategoryPalette(defaultCategories, prev))
    setFormData((prev) => ({ ...prev, category: defaultCategories[0] || '' }))

    const savedDataRaw = localStorage.getItem('agrega_data')
    if (savedDataRaw) {
      try {
        const parsed = JSON.parse(savedDataRaw)
        let hydratedLinks = []

        const importedCategories = Array.isArray(parsed.categories) ? parsed.categories.filter(Boolean) : []

        if (Array.isArray(parsed.links)) {
          hydratedLinks = parsed.links.map((item) => normalizeLink(item))
          setLinks(hydratedLinks)
        }

        const linkCategories = hydratedLinks.map((link) => link.category).filter(Boolean)
        const derivedCategories = Array.from(new Set([
          ...defaultCategories,
          ...importedCategories,
          ...linkCategories,
        ]))

        setCategories(derivedCategories)
        setCategoryPalette((prev) => buildCategoryPalette(derivedCategories, parsed.categoryPalette || prev))
        setFormData((prev) => ({ ...prev, category: derivedCategories[0] || prev.category }))

        if (Array.isArray(parsed.reminders)) {
          const linkById = new Map(hydratedLinks.map((link) => [link.id, link]))
          setReminders(parsed.reminders.map((item) => ({
            id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
            subject: item.subject || '',
            date: item.date || new Date().toISOString().slice(0, 10),
            link: item.link?.id ? (linkById.get(item.link.id) || null) : null,
          })))
        }
      } catch (error) {
        // ignore corrupted stored backup
      }
    }

    if (emailConfig.publicKey) {
      emailjs.init({ publicKey: emailConfig.publicKey })
    }
  }, [])

  useEffect(() => {
    if (prevLanguage.current === language) return

    const oldDefaults = getDefaultCategories(prevLanguage.current)
    const newDefaults = getDefaultCategories(language)

    setCategories((prev) => {
      const mapped = prev.map((category) => {
        const index = oldDefaults.indexOf(category)
        if (index !== -1 && newDefaults[index]) return newDefaults[index]
        return category
      })

      const withDefaults = [...newDefaults, ...mapped]
      return Array.from(new Set(withDefaults))
    })

    setLinks((prev) => prev.map((link) => {
      const index = oldDefaults.indexOf(link.category)
      if (index !== -1 && newDefaults[index]) {
        return { ...link, category: newDefaults[index] }
      }
      return link
    }))

    setFormData((prev) => ({ ...prev, category: getDefaultCategories(language)[0] || prev.category }))
    prevLanguage.current = language
  }, [language, links])

  useEffect(() => {
    setCategoryPalette((prev) => buildCategoryPalette(categories, prev))
  }, [categories])

  useEffect(() => {
    const payload = {
      version: 1,
      categories,
      links,
      reminders,
      language,
      categoryPalette,
    }
    localStorage.setItem('agrega_data', JSON.stringify(payload))
  }, [categories, links, reminders, language, categoryPalette])

  useEffect(() => {
    if (!filterOpen) return undefined

    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [filterOpen])

  useEffect(() => {
    const hasAnyModal = showModal || showImageModal || showTextModal || showEmailModal || showSettingsModal
      || showReminderModal || viewerTarget || editTarget || deleteTarget

    if (!hasAnyModal) return undefined

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (viewerTarget) return handleCloseViewer()
      if (showModal) return handleCloseModal()
      if (showImageModal) return handleCloseImageModal()
      if (showTextModal) return handleCloseTextModal()
      if (showEmailModal) return handleCloseEmailModal()
      if (showSettingsModal) return handleCloseSettingsModal()
      if (showReminderModal) {
        handleCloseReminderModal()
        return
      }
      if (editTarget) return setEditTarget(null)
      if (deleteTarget) return handleDeleteCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showModal, showImageModal, showTextModal, showEmailModal, showSettingsModal, showReminderModal, viewerTarget, editTarget, deleteTarget])

  const refreshMercadoLivreThumb = useCallback(async (linkId, url) => {
    const mlThumb = await fetchMercadoLivreThumbnail(url)
    if (!mlThumb) return
    setLinks((prev) => prev.map((item) => {
      if (item.id !== linkId) return item
      if (item.thumbnail === mlThumb) return item
      return { ...item, thumbnail: mlThumb }
    }))
  }, [])

  const refreshTikTokThumb = useCallback(async (linkId, url) => {
    setLinks((prev) => prev.map((item) => {
      if (item.id !== linkId) return item
      if (item.thumbnail === TIKTOK_ICON && item.favicon === TIKTOK_ICON) return item
      return { ...item, thumbnail: TIKTOK_ICON, favicon: TIKTOK_ICON }
    }))
  }, [])

  const refreshYouTubeThumb = useCallback(async (linkId, url) => {
    setLinks((prev) => prev.map((item) => {
      if (item.id !== linkId) return item
      if (item.thumbnail === YT_ICON && item.favicon === YT_ICON) return item
      return { ...item, thumbnail: YT_ICON, favicon: YT_ICON }
    }))
  }, [])

  const refreshInstagramThumb = useCallback(async (linkId, url) => {
    const thumb = await fetchInstagramThumbnail(url)
    if (!thumb) return
    setLinks((prev) => prev.map((item) => {
      if (item.id !== linkId) return item
      if (item.thumbnail === thumb) return item
      return { ...item, thumbnail: thumb }
    }))
  }, [])

  const refreshGenericPreview = useCallback(async (linkId, url) => {
    if (isTikTokUrl(url) || isYouTubeUrl(url)) return
    const ogImage = await fetchOgImage(url)
    if (!ogImage) return
    setLinks((prev) => prev.map((item) => {
      if (item.id !== linkId) return item
      return {
        ...item,
        thumbnail: item.thumbnail || ogImage,
        favicon: item.favicon || getFaviconUrl(url),
      }
    }))
  }, [])

  useEffect(() => {
    links.forEach((link) => {
      if (link.type !== 'link') return
      if (isTikTokUrl(link.url)) {
        if (link.thumbnail === TIKTOK_ICON && link.favicon === TIKTOK_ICON) return
        refreshTikTokThumb(link.id, link.url)
        return
      }
      if (isYouTubeUrl(link.url)) {
        if (link.thumbnail === YT_ICON && link.favicon === YT_ICON) return
        refreshYouTubeThumb(link.id, link.url)
        return
      }
      if (link.thumbnail && link.favicon) return
      if (isMercadoLivreUrl(link.url)) {
        refreshMercadoLivreThumb(link.id, link.url)
        return
      }
      if (isInstagramUrl(link.url)) {
        refreshInstagramThumb(link.id, link.url)
        return
      }
      if (!link.thumbnail || !link.favicon) {
        refreshGenericPreview(link.id, link.url)
      }
    })
  }, [links, refreshMercadoLivreThumb, refreshInstagramThumb, refreshGenericPreview, refreshTikTokThumb, refreshYouTubeThumb])

  const categoryCounts = useMemo(() => {
    const counts = categories.reduce((acc, category) => {
      acc[category] = 0
      return acc
    }, {})
    links.forEach((link) => {
      counts[link.category] = (counts[link.category] || 0) + 1
    })
    return counts
  }, [categories, links])

  const visibleLinks = useMemo(() => {
    const filteredByCategory = selectedCategory === 'all'
      ? links
      : links.filter((link) => link.category === selectedCategory)

    const term = searchQuery.trim().toLowerCase()
    const filteredBySearch = !term
      ? filteredByCategory
      : filteredByCategory.filter((link) => {
        const urlPart = link.type === 'image'
          ? t('defaultImageTitle')
          : link.type === 'text'
            ? `${link.content || ''} ${t('defaultTextTitle')}`
            : link.url
        const haystack = `${link.title} ${link.category} ${urlPart}`.toLowerCase()
        return haystack.includes(term)
      })

    const sorted = [...filteredBySearch]
    sorted.sort((a, b) => {
      const categoryCompare = collator.compare(a.category || '', b.category || '')
      if (categoryCompare !== 0) return categoryCompare

      const aDate = parseDateSafe(a.createdAt)
      const bDate = parseDateSafe(b.createdAt)
      const titleCompare = collator.compare(a.title || '', b.title || '')

      if (filterOption === 'date_desc') {
        if (bDate !== aDate) return bDate - aDate
        if (titleCompare !== 0) return titleCompare
        return (a.id || '').localeCompare(b.id || '')
      }

      if (filterOption === 'date_asc') {
        if (aDate !== bDate) return aDate - bDate
        if (titleCompare !== 0) return titleCompare
        return (a.id || '').localeCompare(b.id || '')
      }

      if (filterOption === 'alpha_desc') {
        if (titleCompare !== 0) return -titleCompare
        if (bDate !== aDate) return bDate - aDate
        return (a.id || '').localeCompare(b.id || '')
      }

      // default alpha_asc
      if (titleCompare !== 0) return titleCompare
      if (bDate !== aDate) return bDate - aDate
      return (a.id || '').localeCompare(b.id || '')
    })

    return sorted
  }, [links, selectedCategory, searchQuery, filterOption, collator, t])

  const handleAddClick = () => {
    const trimmed = linkInput.trim()
    if (!trimmed) {
      setError(t('addLinkErrorEmpty'))
      return
    }
    const normalizedUrl = normalizeUrlInput(trimmed)
    if (normalizedUrl) {
      beginLinkFlow(normalizedUrl)
    } else {
      beginTextFlow(trimmed)
    }
    setError('')
  }

  const handleSaveEmailConfig = (event) => {
    event.preventDefault()
    const email = emailForm.email.trim()
    if (!isValidEmail(email)) {
      setEmailError(t('emailInvalid'))
      return
    }
    setUserEmail(email)
    localStorage.setItem('agrega_email', email)
    setShowEmailModal(false)
    setEmailError('')
    showAction(t('emailSaved'))
  }

  const handleCloseEmailModal = () => {
    setShowEmailModal(false)
    setEmailError('')
  }

  const openSettings = () => {
    setSettingsForm({ email: userEmail, language })
    setSettingsError('')
    setShowSettingsModal(true)
  }

  const handleSaveSettings = (event) => {
    event.preventDefault()
    const emailValue = settingsForm.email.trim()
    if (!isValidEmail(emailValue)) {
      setSettingsError(t('emailInvalid'))
      return
    }
    const langValue = settingsForm.language || 'pt-BR'
    setUserEmail(emailValue)
    setLanguage(langValue)
    localStorage.setItem('agrega_email', emailValue)
    localStorage.setItem('agrega_lang', langValue)
    setShowSettingsModal(false)
    setSettingsError('')
    showAction(t('settingsSaved'))
  }

  const handleExportBackup = () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        language,
        categories,
        links,
        reminders,
        categoryPalette,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `agrega-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      showAction(t('backupExported'))
      setSettingsError('')
    } catch (error) {
      setSettingsError(t('backupRestoreFail'))
    }
  }

  const handleImportBackupClick = () => {
    setSettingsError('')
    backupInputRef.current?.click()
  }

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      const targetLanguage = parsed.language || language
      if (parsed.language) {
        setLanguage(targetLanguage)
        setSettingsForm((prev) => ({ ...prev, language: targetLanguage }))
      }

      const importedCategories = Array.isArray(parsed.categories) ? parsed.categories.filter(Boolean) : []
      const importedLinks = Array.isArray(parsed.links) ? parsed.links.map((item) => normalizeLink(item)) : []
      const linkById = new Map(importedLinks.map((link) => [link.id, link]))
      const importedReminders = Array.isArray(parsed.reminders)
        ? parsed.reminders.map((item) => {
          const linkId = item.link?.id
          const linked = linkId ? linkById.get(linkId) : null
          return {
            id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
            subject: item.subject || '',
            date: item.date || new Date().toISOString().slice(0, 10),
            link: linked || null,
          }
        })
        : []

      const derivedCategories = Array.from(new Set([
        ...getDefaultCategories(targetLanguage),
        ...importedCategories,
        ...importedLinks.map((link) => link.category).filter(Boolean),
      ]))

      setCategories(derivedCategories)
      setCategoryPalette((prev) => buildCategoryPalette(derivedCategories, parsed.categoryPalette || prev))
      setLinks(importedLinks)
      setReminders(importedReminders)
      setFormData((prev) => ({ ...prev, category: derivedCategories[0] || prev.category }))

      setSelectedCategory('all')
      setView('dashboard')
      showAction(t('backupRestored'))
      setSettingsError('')
    } catch (error) {
      setSettingsError(t('backupRestoreFail'))
    } finally {
      event.target.value = ''
    }
  }

  const beginLinkFlow = (url) => {
    setPendingUrl(url)
    setShowModal(true)
    setError('')
    setFormData((prev) => ({
      ...prev,
      title: '',
      newCategory: '',
      category: categories[0] || '',
    }))
    hydrateModalPreview(url)
  }

  const handleSaveLink = (event) => {
    event.preventDefault()
    const chosenCategory = formData.newCategory.trim() || formData.category || t('defaultCategory')
    const normalizedCategory = chosenCategory.trim()
    const title = formData.title.trim() || t('defaultLinkTitle')

    if (!normalizedCategory) {
      setError(t('linkUpdatedError'))
      return
    }

    if (formData.newCategory.trim() && !categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())

    setLinks((prev) => [
      ...prev,
      {
        id,
        title,
        url: pendingUrl,
        category: normalizedCategory,
        createdAt: new Date().toISOString(),
        thumbnail: getThumbnailUrl(pendingUrl),
        favicon: getFaviconUrl(pendingUrl),
        type: 'link',
      },
    ])

    refreshMercadoLivreThumb(id, pendingUrl)
    refreshTikTokThumb(id, pendingUrl)
    refreshInstagramThumb(id, pendingUrl)

    setLinkInput('')
    setPendingUrl('')
    setShowModal(false)
    setSelectedCategory('all')
    setView('dashboard')
  }

  const beginImageFlow = (imagePayload) => {
    setPendingImage(imagePayload)
    setShowImageModal(true)
    setImageError('')
    setFormData((prev) => ({
      ...prev,
      title: '',
      newCategory: '',
      category: categories[0] || '',
    }))
  }

  const handleSaveImage = (event) => {
    event.preventDefault()
    if (!pendingImage?.dataUrl) {
      setImageError(t('imageMissing'))
      return
    }

    const chosenCategory = formData.newCategory.trim() || formData.category || t('defaultCategory')
    const normalizedCategory = chosenCategory.trim()
    const title = formData.title.trim() || t('defaultImageTitle')

    if (!normalizedCategory) {
      setImageError(t('linkUpdatedError'))
      return
    }

    if (formData.newCategory.trim() && !categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())

    setLinks((prev) => [
      ...prev,
      {
        id,
        title,
        url: pendingImage.dataUrl,
        category: normalizedCategory,
        createdAt: new Date().toISOString(),
        thumbnail: pendingImage.dataUrl,
        favicon: '',
        type: 'image',
        imageData: pendingImage.dataUrl,
        mimeType: pendingImage.mimeType || 'image/png',
      },
    ])

    setPendingImage(null)
    setShowImageModal(false)
    setSelectedCategory('all')
    setView('dashboard')
  }

  const beginTextFlow = (textValue) => {
    setPendingText(textValue)
    setShowTextModal(true)
    setTextError('')
    setFormData((prev) => ({
      ...prev,
      title: '',
      newCategory: '',
      category: categories[0] || '',
    }))
  }

  const handleSaveText = (event) => {
    event.preventDefault()
    const content = pendingText.trim()
    if (!content) {
      setTextError(t('textMissing'))
      return
    }

    const chosenCategory = formData.newCategory.trim() || formData.category || t('defaultCategory')
    const normalizedCategory = chosenCategory.trim()
    const title = formData.title.trim() || t('defaultTextTitle')

    if (!normalizedCategory) {
      setTextError(t('linkUpdatedError'))
      return
    }

    if (formData.newCategory.trim() && !categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())

    setLinks((prev) => [
      ...prev,
      {
        id,
        title,
        url: content,
        content,
        category: normalizedCategory,
        createdAt: new Date().toISOString(),
        thumbnail: '',
        favicon: '',
        type: 'text',
      },
    ])

    setPendingText('')
    setShowTextModal(false)
    setSelectedCategory('all')
    setView('dashboard')
  }

  const showAction = (message) => {
    setActionMessage(message)
    setTimeout(() => setActionMessage(''), 2000)
  }

  const showCardAction = (id, message) => {
    setCardMessage({ id, text: message })
    setTimeout(() => setCardMessage({ id: '', text: '' }), 1500)
  }

  const normalizeLink = (item) => {
    const targetType = item.type || 'link'
    const urlValue = targetType === 'text' ? (item.content || item.url || '') : (item.url || '')
    const defaultTitle = targetType === 'image'
      ? t('defaultImageTitle')
      : targetType === 'text'
        ? t('defaultTextTitle')
        : t('defaultLinkTitle')

    return {
      id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title: item.title || defaultTitle,
      url: urlValue,
      category: item.category || t('defaultCategory'),
      createdAt: item.createdAt || new Date().toISOString(),
      thumbnail: targetType === 'image'
        ? (item.imageData || item.thumbnail || urlValue)
        : targetType === 'text'
          ? ''
          : (item.thumbnail || (urlValue ? getThumbnailUrl(urlValue) : '')),
      favicon: targetType === 'image' || targetType === 'text'
        ? ''
        : (item.favicon || (urlValue ? getFaviconUrl(urlValue) : '')),
      type: targetType,
      content: targetType === 'text' ? (item.content || urlValue) : (item.content || ''),
      imageData: item.imageData || '',
      mimeType: item.mimeType || 'image/png',
    }
    return sanitizeLinkBranding(base)
  }

  const handleCopy = async (link) => {
    try {
      if (link.type === 'image' && link.imageData && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const response = await fetch(link.imageData)
        const blob = await response.blob()
        const mime = blob.type || link.mimeType || 'image/png'
        await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })])
        showCardAction(link.id, t('cardImageCopied'))
        return
      }
      if (link.type === 'text') {
        await navigator.clipboard.writeText(link.content || link.url)
        showCardAction(link.id, t('cardTextCopied'))
        return
      }
      await navigator.clipboard.writeText(link.url)
      showCardAction(link.id, t('cardCopied'))
    } catch (copyError) {
      showCardAction(link.id, t('cardCopyFail'))
    }
  }

  const handleOpen = (link) => {
    if (link.type === 'image') {
      setViewerTarget(link)
      showCardAction(link.id, t('cardViewingImage'))
      return
    }
    if (link.type === 'text') {
      setViewerTarget(link)
      showCardAction(link.id, t('cardViewingText'))
      return
    }
    if (window?.agrega?.openExternal) {
      window.agrega.openExternal(link.url)
      showCardAction(link.id, t('cardOpening'))
      return
    }
    window.open(link.url, '_blank', 'noopener,noreferrer')
    showCardAction(link.id, t('cardOpening'))
  }

  const handleEdit = (link) => {
    setEditTarget(link)
    setEditForm({
      title: link.title,
      url: link.url,
      category: link.category,
      newCategory: '',
      type: link.type || 'link',
      content: link.content || '',
    })
  }

  const handleDelete = (link) => {
    setDeleteTarget(link)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setLinks((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    showAction(t('linkRemoved'))
    setDeleteTarget(null)
  }

  const handleDeleteCancel = () => setDeleteTarget(null)

  const handleEditSubmit = (event) => {
    event.preventDefault()
    if (!editTarget) return
    const chosenCategory = editForm.newCategory.trim() || editForm.category || t('defaultCategory')
    const normalizedCategory = chosenCategory.trim()
    if (!normalizedCategory) {
      setError(t('linkUpdatedError'))
      return
    }

    if (editForm.newCategory.trim() && !categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }

    const targetType = editTarget?.type || editForm.type || 'link'
    const nextUrl = targetType === 'image' ? editTarget.url : editForm.url.trim()
    const normalizedUrl = targetType === 'image' ? nextUrl : (normalizeUrlInput(nextUrl) || nextUrl)
    const nextContent = targetType === 'text' ? (editForm.content || editTarget.content || '') : ''

    setLinks((prev) => prev.map((item) => {
      if (item.id !== editTarget.id) return item

      const base = {
        ...item,
        title: editForm.title.trim()
          || (targetType === 'image'
            ? t('defaultImageTitle')
            : targetType === 'text'
              ? t('defaultTextTitle')
              : t('defaultLinkTitle')),
        url: normalizedUrl,
        category: normalizedCategory,
        thumbnail: targetType === 'image' ? item.thumbnail : getThumbnailUrl(nextUrl),
        favicon: targetType === 'image' ? '' : getFaviconUrl(nextUrl),
        type: targetType,
      }

      if (targetType === 'image') {
        base.imageData = item.imageData
        base.mimeType = item.mimeType
      }

      if (targetType === 'text') {
        base.content = nextContent
        base.thumbnail = ''
        base.favicon = ''
        base.url = nextContent
      }

      return base
    }))

    if (targetType !== 'image') {
      refreshMercadoLivreThumb(editTarget.id, nextUrl)
      refreshTikTokThumb(editTarget.id, nextUrl)
      refreshInstagramThumb(editTarget.id, nextUrl)
    }

    setEditTarget(null)
    setEditForm({ title: '', url: '', category: '', newCategory: '', type: 'link', content: '' })
    setError('')
    showAction(t('linkUpdated'))
  }

  const sendReminderEmail = async (reminderPayload) => {
    if (!userEmail) return
    const { serviceId, templateId, publicKey } = emailConfig
    if (!serviceId || !templateId || !publicKey) {
      showAction(t('sendEmailMissingConfig'))
      return
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: userEmail,
          subject: reminderPayload.subject,
          date: reminderPayload.date,
          link_title: reminderPayload.link?.title || '',
          link_url: reminderPayload.link?.url || '',
          message: reminderPayload.subject,
        },
        { publicKey },
      )
      showAction(t('remindEmailSent'))
    } catch (emailError) {
      showAction(t('sendEmailFail'))
    }
  }

  const handleReminderSubmit = (event) => {
    event.preventDefault()
    if (!reminderForm.subject.trim()) {
      setReminderError(t('reminderSubjectRequired'))
      return
    }
    if (!reminderForm.date) {
      setReminderError(t('reminderDateRequired'))
      return
    }

    setReminderError('')

    const link = reminderForm.linkToggle
      ? links.find((item) => item.id === reminderForm.linkId)
      : null

    const payload = {
      id: reminderEditTarget?.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      subject: reminderForm.subject.trim(),
      date: reminderForm.date,
      link,
    }

    if (reminderEditTarget) {
      setReminders((prev) => prev.map((item) => (item.id === reminderEditTarget.id ? payload : item)))
      setReminderEditTarget(null)
      showAction(t('reminderUpdated'))
    } else {
      setReminders((prev) => [...prev, payload])
      showAction(t('reminderCreated'))
      sendReminderEmail(payload)
    }

    setShowReminderModal(false)
    setReminderForm({ subject: '', date: new Date().toISOString().slice(0, 10), linkId: '', linkToggle: false })
  }

  const handleReminderMonth = (direction) => {
    setReminderMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + direction)
      return new Date(next.getFullYear(), next.getMonth(), 1)
    })
  }

  const handleReminderViewMonth = (direction) => {
    setReminderViewMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + direction)
      const firstDay = new Date(next.getFullYear(), next.getMonth(), 1)
      setReminderViewDate(firstDay.toISOString().slice(0, 10))
      return firstDay
    })
  }

  const handleReminderDateSelect = (value) => {
    if (!value) return
    setReminderViewDate(value)
  }

  const handleReminderMove = (reminderId, newDate) => {
    if (!newDate) return
    setReminders((prev) => prev.map((item) => (item.id === reminderId ? { ...item, date: newDate } : item)))
    setReminderViewDate(newDate)
    showAction(t('reminderMoved'))
  }

  const openReminderForDate = (dateValue) => {
    const fallback = new Date().toISOString().slice(0, 10)
    const target = dateValue || fallback
    setReminderForm((prev) => ({ ...prev, date: target }))
    const parsed = new Date(target)
    setReminderMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
    setReminderError('')
    setShowReminderModal(true)
  }

  const handleReminderDelete = (reminderId) => {
    setReminders((prev) => prev.filter((item) => item.id !== reminderId))
    showAction(t('reminderRemoved'))
  }

  const handleReminderEdit = (reminder) => {
    setReminderEditTarget(reminder)
    setReminderForm({
      subject: reminder.subject,
      date: reminder.date,
      linkId: reminder.link?.id || '',
      linkToggle: Boolean(reminder.link),
    })
    const parsed = new Date(reminder.date)
    setReminderMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
    setReminderError('')
    setShowReminderModal(true)
  }

  const hydrateModalPreview = useCallback(async (url) => {
    const baseThumb = getThumbnailUrl(url)
    const baseFavicon = getFaviconUrl(url)
    setModalPreview({ thumbnail: baseThumb, favicon: baseFavicon })

    if (isMercadoLivreUrl(url)) {
      const ml = await fetchMercadoLivreThumbnail(url)
      if (ml) setModalPreview((prev) => ({ ...prev, thumbnail: ml }))
    }

    if (isInstagramUrl(url)) {
      const ig = await fetchInstagramThumbnail(url)
      if (ig) setModalPreview((prev) => ({ ...prev, thumbnail: ig }))
    }

    if (isTikTokUrl(url)) {
      const tk = await fetchTikTokThumbnail(url)
      if (tk) setModalPreview((prev) => ({ ...prev, thumbnail: tk }))
    }
  }, [])

  useEffect(() => {
    const onPaste = async (event) => {
      if (showModal || showImageModal || showTextModal) return

      const items = Array.from(event.clipboardData?.items || [])
      const imageItem = items.find((item) => item.type?.startsWith('image/'))
      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          event.preventDefault()
          try {
            const dataUrl = await fileToDataUrl(file)
            beginImageFlow({ dataUrl, mimeType: file.type || 'image/png' })
          } catch (readError) {
            setImageError(t('imageReadFail'))
          }
        }
        return
      }

      const text = event.clipboardData?.getData('text')?.trim()
      if (!text) return

      const normalizedUrl = normalizeUrlInput(text)
      if (normalizedUrl) {
        event.preventDefault()
        setLinkInput(normalizedUrl)
        beginLinkFlow(normalizedUrl)
        return
      }

      // plain text flow
      event.preventDefault()
      beginTextFlow(text)
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [showModal, showImageModal, showTextModal, showEmailModal, categories])

  const handleCloseModal = () => {
    setShowModal(false)
    setPendingUrl('')
    setModalPreview({ thumbnail: '', favicon: '' })
  }

  const handleCloseImageModal = () => {
    setShowImageModal(false)
    setPendingImage(null)
    setImageError('')
  }

  const handleCloseTextModal = () => {
    setShowTextModal(false)
    setPendingText('')
    setTextError('')
  }

  const handleCloseViewer = () => {
    setViewerTarget(null)
  }

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false)
    setSettingsError('')
  }

  const handleCloseReminderModal = () => {
    setShowReminderModal(false)
    setReminderError('')
  }

  const applyRemotePayload = useCallback((payload = {}, nextHash = '') => {
    const targetLanguage = payload.language || language

    if (payload.language) {
      setLanguage(targetLanguage)
      setSettingsForm((prev) => ({ ...prev, language: targetLanguage }))
    }

    const importedCategories = Array.isArray(payload.categories) ? payload.categories.filter(Boolean) : []
    const importedLinks = Array.isArray(payload.links) ? payload.links.map((item) => normalizeLink(item)) : []
    const linkById = new Map(importedLinks.map((link) => [link.id, link]))
    const importedReminders = Array.isArray(payload.reminders)
      ? payload.reminders.map((item) => {
        const linkId = item.link?.id
        const linked = linkId ? linkById.get(linkId) : null
        return {
          id: item.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
          subject: item.subject || '',
          date: item.date || new Date().toISOString().slice(0, 10),
          link: linked || null,
        }
      })
      : []

    // Derivar categorias mesmo que o payload não envie categories
    const derivedCategories = Array.from(new Set([
      ...getDefaultCategories(targetLanguage),
      ...importedCategories,
      ...importedLinks.map((link) => link.category).filter(Boolean),
    ])).sort((a, b) => a.localeCompare(b, targetLanguage, { sensitivity: 'base' }))

    setCategories(derivedCategories)
    setCategoryPalette((prev) => buildCategoryPalette(derivedCategories, payload.categoryPalette || prev))
    setLinks(importedLinks)
    setReminders(importedReminders)
    setSelectedCategory('all')
    setView('dashboard')
    if (nextHash) setSyncHash(nextHash)
  }, [language, normalizeLink])

  const getDesktopSyncInfo = useCallback(async () => {
    if (typeof window === 'undefined' || !window?.agrega?.syncGet) return null
    try {
      return await window.agrega.syncGet()
    } catch (error) {
      return null
    }
  }, [])

  const buildPairingPayload = useCallback(async () => {
    const desktopSync = await getDesktopSyncInfo()
    const pin = String(Math.floor(1000 + Math.random() * 9000))

    const capped = (value, limit) => (value || '').slice(0, limit)

    const sanitizeLink = (link, tight) => {
      const titleLimit = tight ? 40 : 60
      const urlLimit = tight ? 160 : 220
      const contentLimit = tight ? 60 : 100
      const categoryLimit = tight ? 25 : 35

      const remoteUrl = link.url?.startsWith('http') ? capped(link.url, urlLimit) : ''

      return {
        id: link.id,
        title: capped(link.title, titleLimit),
        url: link.type === 'image' ? remoteUrl : capped(link.url || '', urlLimit),
        category: capped(link.category, categoryLimit),
        type: link.type,
        content: link.type === 'text' ? capped(link.content || '', contentLimit) : '',
        createdAt: link.createdAt,
      }
    }

    const sortByDate = (list) => list.slice().sort((a, b) => parseDateSafe(b.createdAt) - parseDateSafe(a.createdAt))

    const baseLinks = sortByDate(links).map((link) => sanitizeLink(link, false)).slice(0, 20)
    const categoriesUsed = new Set(baseLinks.map((l) => l.category).filter(Boolean))
    const categoriesTrimmed = Array.from(categoriesUsed).map((c) => capped(c, 25))

    const endpoint = desktopSync?.host && desktopSync?.port ? `http://${desktopSync.host}:${desktopSync.port}/sync` : ''

    const snapshotBase = {
      type: 'agrega-sync',
      version: 1,
      generatedAt: new Date().toISOString(),
      pin,
      endpoint,
      hash: desktopSync?.hash || '',
      language,
      categories: categoriesTrimmed,
      categoryPalette: buildCategoryPalette(categoriesTrimmed, categoryPalette),
      links: baseLinks,
      reminders: [],
    }

    const minimalPayload = endpoint ? `agrega-sync:v1:${pin}:${desktopSync?.host || ''}:${desktopSync?.port || ''}` : `agrega-sync:v1:${pin}`
    const pairingInfo = { pin, host: desktopSync?.host || '', port: desktopSync?.port || '', payload: minimalPayload, oversize: false, endpoint }

    if (window?.agrega?.syncPush) {
      try {
        startSyncProgress('Enviando', baseLinks.length || 1)
        await window.agrega.syncPush({ pin, payload: snapshotBase })
        updateSyncProgress(baseLinks.length || 1)
        finishSyncProgress()
      } catch (error) {
        // ignore sync push errors; QR still works
        finishSyncProgress()
      }
    }

    return pairingInfo
  }, [categoryPalette, finishSyncProgress, getDesktopSyncInfo, language, links, startSyncProgress, updateSyncProgress])

  const pairingString = useMemo(() => pairingInfo?.payload || '', [pairingInfo])

  const pullRemoteSnapshot = useCallback(async (pin, endpoint) => {
    if (!pin || !endpoint) return
    if (syncing) return
    startSyncProgress('Recebendo', links.length || 1)
    setSyncing(true)
    let applied = false
    try {
      const url = `${endpoint}?pin=${encodeURIComponent(pin)}`
      const response = await fetch(url)
      if (!response.ok) return
      const data = await response.json()
      const remoteHash = data?.hash || ''
      if (remoteHash && syncHash && remoteHash === syncHash) return
      if (data?.payload) {
        const totalLinks = Array.isArray(data.payload?.links) ? data.payload.links.length : 0
        if (totalLinks > 0) {
          startSyncProgress('Recebendo', totalLinks)
          updateSyncProgress(Math.max(1, Math.floor(totalLinks * 0.4)))
        }
        applyRemotePayload(data.payload, remoteHash)
        updateSyncProgress(totalLinks || 1)
        applied = true
      }
    } catch (error) {
      // ignore fetch errors
    } finally {
      finishSyncProgress()
      setSyncing(false)
      if (applied && showPairingModal) {
        setShowPairingModal(false)
      }
    }
  }, [applyRemotePayload, finishSyncProgress, links.length, showPairingModal, startSyncProgress, syncHash, syncing, updateSyncProgress])

  const openPairing = async () => {
    const info = await buildPairingPayload()
    setPairingInfo(info)
    setShowPairingModal(true)
    setPairingToast('')
    pullRemoteSnapshot(info.pin, info.endpoint)
  }

  const syncNow = useCallback(async () => {
    if (!pairingInfo?.pin || !pairingInfo?.endpoint) {
      openPairing()
      return
    }
    startSyncProgress('Enviando', links.length || 1)
    setSyncing(true)
    try {
      await pushCurrentSnapshot()
      startSyncProgress('Recebendo', links.length || 1)
      await pullRemoteSnapshot(pairingInfo.pin, pairingInfo.endpoint)
    } catch (error) {
    } finally {
      finishSyncProgress()
      setSyncing(false)
    }
  }, [finishSyncProgress, links.length, openPairing, pairingInfo?.endpoint, pairingInfo?.pin, pullRemoteSnapshot, pushCurrentSnapshot, startSyncProgress])

  const handleCopyPairing = async () => {
    if (!pairingString) return
    try {
      await navigator.clipboard.writeText(pairingString)
      setPairingToast(t('pairingCopied'))
      setTimeout(() => setPairingToast(''), 1400)
    } catch (error) {
      setPairingToast('')
    }
  }

  useEffect(() => {
    if (!pairingInfo?.pin || !pairingInfo?.endpoint) return undefined
    // Poll even com modal fechado para capturar alterações do mobile
    const interval = setInterval(() => {
      pullRemoteSnapshot(pairingInfo.pin, pairingInfo.endpoint)
    }, 4000)
    return () => clearInterval(interval)
  }, [pairingInfo, pullRemoteSnapshot])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Agrega">
          <img
            src={logoSrc}
            alt="Agrega"
            style={{ width: '200px', paddingLeft: '40px' }}
          />
        </div>
        <div className="topbar-right">
          <div className="badge">{links.length} {t('linksLabel')}</div>
          <button
            className={`icon-button ${syncProgress.active || syncing ? 'is-spinning' : ''}`}
            aria-label="Sync agora"
            data-tooltip="Sync agora"
            onClick={syncNow}
          >
            <IconRefresh />
          </button>
          <button className="icon-button" aria-label={t('pairingButton')} data-tooltip={t('pairingButton')} onClick={openPairing}>
            <IconQr />
          </button>
          <button className="icon-button" aria-label={t('settings')} data-tooltip={t('settings')} onClick={openSettings}>
            <IconCog />
          </button>
        </div>
      </header>
      <div className="content">
        <aside className="sidebar">
          <button className="ghost-cta" onClick={() => setView('dashboard')}>
            {t('sidebarHome')}
          </button>
          <button className="cta" onClick={() => openReminderForDate()}>
            {t('sidebarNewReminder')}
          </button>
          <button className="ghost-cta" onClick={() => setView('reminders')}>
            {t('sidebarViewReminders')}
          </button>
          <div className="sidebar-header">
            <p className="eyebrow">{t('sidebarCategories')}</p>
            <span className="mini">{t('sidebarHint')}</span>
          </div>
          <button
            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span>{t('all')}</span>
            <span className="pill">{links.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category)
                setView('dashboard')
              }}
            >
              <span>{category}</span>
              <span className="pill">{categoryCounts[category] || 0}</span>
            </button>
          ))}
          <div className="sidebar-hint">
            <p>{t('sidebarAddHint')}</p>
          </div>
        </aside>

        <main className="main">
          {view === 'reminders' ? (
            <ReminderPage
              reminders={reminders}
              monthDate={reminderViewMonth}
              selectedDate={reminderViewDate}
              onMonthChange={handleReminderViewMonth}
              onSelectDate={handleReminderDateSelect}
              onMove={handleReminderMove}
              onNewReminder={openReminderForDate}
              onEdit={handleReminderEdit}
              onBack={() => setView('dashboard')}
              t={t}
              language={language}
            />
          ) : (
            <>
              <section className="capture-card">
                <div>
                  <p className="eyebrow">{t('captureEyebrow')}</p>
                  <h1>{t('captureTitle')}</h1>
                  <p className="muted">{t('captureSubtitle')}</p>
                </div>
                <div className="input-row">
                  <input
                    autoFocus
                    value={linkInput}
                    onChange={(event) => setLinkInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleAddClick()
                    }}
                    placeholder={t('inputPlaceholder')}
                  />
                  <button className="add-button" onClick={handleAddClick} aria-label="Adicionar link">
                    +
                  </button>
                </div>
                {error && <p className="error">{error}</p>}
              </section>

              <section className={`dashboard ${editMode ? 'editing' : ''}`}>
                <div className="dashboard-header">
                  <div>
                    <p className="eyebrow">{t('dashboardEyebrow')}</p>
                    <h2>{t('dashboardTitle')}</h2>
                  </div>
                  <div className="dashboard-actions">
                    <input
                      className="search-input"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={t('searchPlaceholder')}
                    />
                    <div className="filter-wrapper" ref={filterRef}>
                      <button
                        className="icon-button"
                        aria-label="Filtros"
                        data-tooltip={t('filterTooltip')}
                        onClick={() => setFilterOpen((prev) => !prev)}
                      >
                        <IconFilter />
                      </button>
                      {filterOpen && (
                        <div className="filter-menu">
                          <div className="filter-section">
                            <p className="filter-section__title">{t('filterSortTitle')}</p>
                            <label>
                              <input
                                type="radio"
                                name="filter"
                                value="date_desc"
                                checked={filterOption === 'date_desc'}
                                onChange={(event) => {
                                  setFilterOption(event.target.value)
                                  setFilterOpen(false)
                                }}
                              />
                              {t('filterDateDesc')}
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="filter"
                                value="date_asc"
                                checked={filterOption === 'date_asc'}
                                onChange={(event) => {
                                  setFilterOption(event.target.value)
                                  setFilterOpen(false)
                                }}
                              />
                              {t('filterDateAsc')}
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="filter"
                                value="alpha_asc"
                                checked={filterOption === 'alpha_asc'}
                                onChange={(event) => {
                                  setFilterOption(event.target.value)
                                  setFilterOpen(false)
                                }}
                              />
                              {t('filterAlphaAsc')}
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="filter"
                                value="alpha_desc"
                                checked={filterOption === 'alpha_desc'}
                                onChange={(event) => {
                                  setFilterOption(event.target.value)
                                  setFilterOpen(false)
                                }}
                              />
                              {t('filterAlphaDesc')}
                            </label>
                          </div>

                          <hr className="filter-divider" />

                          {/* Category filters removed per request */}
                        </div>
                      )}
                    </div>
                    <button
                      className={`icon-button ${editMode ? 'active' : ''}`}
                      onClick={() => setEditMode((prev) => !prev)}
                      aria-label={t('editModeEnter')}
                      data-tooltip={editMode ? t('editModeExit') : t('editModeEnter')}
                    >
                      <IconEdit />
                    </button>
                  </div>
                </div>

                {links.length === 0 && view === 'collect' && (
                  <div className="empty">
                    <p>{t('emptyDashboard')}</p>
                  </div>
                )}

                {links.length > 0 && (
                  <div className="link-grid">
                    {visibleLinks.map((link) => {
                      const displayThumb = link.type === 'link' ? getSafeThumbnail(link) : link.thumbnail
                      const bodyClass = displayThumb ? 'link-card__body' : 'link-card__body no-thumb'
                      const categoryHue = categoryPalette[link.category] ?? getCategoryHue(link.category || '')
                      return (
                        <article className={`link-card ${editMode ? 'editable' : ''}`} key={link.id}>
                        <div className="link-card__content">
                          <div className="link-card__top">
                            <span
                              className="pill subtle category-pill"
                              style={{ '--category-hue': categoryHue }}
                            >
                              {link.category}
                            </span>
                            <span className="timestamp">{new Date(link.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className={bodyClass}>
                            {displayThumb && (
                              <div className="thumb" aria-hidden="true">
                                <img
                                  src={displayThumb}
                                  alt=""
                                  loading="lazy"
                                  onError={(event) => {
                                    // Hide broken previews to avoid broken-image icon
                                    event.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            <div className="link-card__text">
                              <h3>
                                <a className="link-title" href={link.url} target="_blank" rel="noreferrer">
                                  {link.title}
                                </a>
                              </h3>
                              {link.type === 'text' && null}
                              <div className="link-meta">
                                <div className="link-meta__info">
                                  <span className="favicon-pill">
                                    {link.type !== 'image' && link.favicon && (
                                      <img
                                        src={link.favicon}
                                        alt=""
                                        loading="lazy"
                                        onError={(event) => {
                                          event.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    )}
                                    {getLinkLabel(link, t)}
                                  </span>
                                  {link.type === 'image' && <span className="pill subtle">{t('badgeImage')}</span>}
                                  {link.type === 'text' && <span className="pill subtle">{t('badgeText')}</span>}
                                </div>
                                <div className="card-actions">
                                  <button
                                    className="icon-button"
                                    onClick={() => (link.type === 'image' || link.type === 'text' ? handleOpen(link) : handleOpen(link))}
                                    aria-label={link.type === 'image' || link.type === 'text' ? t('viewerTitle') : t('openTooltip')}
                                    data-tooltip={link.type === 'image' || link.type === 'text' ? t('viewerTitle') : t('openTooltip')}
                                  >
                                    {link.type === 'image' || link.type === 'text' ? <IconView /> : <IconExternal />}
                                  </button>
                                  <button
                                    className="icon-button"
                                    onClick={() => handleCopy(link)}
                                    aria-label={t('copy')}
                                    data-tooltip={t('copyTooltip')}
                                  >
                                    <IconCopy />
                                  </button>
                                </div>
                              </div>
                              {cardMessage.id === link.id && (
                                <div className="card-toast">{cardMessage.text}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {editMode && (
                          <div className="card-edit-actions">
                            <button
                              className="icon-button small info"
                              onClick={() => handleEdit(link)}
                              aria-label={t('editTooltip')}
                              data-tooltip={t('editTooltip')}
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="icon-button small danger"
                              onClick={() => handleDelete(link)}
                              aria-label={t('deleteTooltip')}
                              data-tooltip={t('deleteTooltip')}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        )}
                      </article>
                    )})}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {showModal && (
        <Modal
          pendingUrl={pendingUrl}
          pendingPreview={modalPreview}
          categories={categories}
          formData={formData}
          onChange={setFormData}
          onClose={handleCloseModal}
          onSubmit={handleSaveLink}
          t={t}
        />
      )}

      {showImageModal && (
        <ImageModal
          pendingImage={pendingImage}
          categories={categories}
          formData={formData}
          errorMessage={imageError}
          onChange={setFormData}
          onClose={handleCloseImageModal}
          onSubmit={handleSaveImage}
          t={t}
        />
      )}

      {showTextModal && (
        <TextModal
          pendingText={pendingText}
          categories={categories}
          formData={formData}
          errorMessage={textError}
          onChange={setFormData}
          onTextChange={setPendingText}
          onClose={handleCloseTextModal}
          onSubmit={handleSaveText}
          t={t}
        />
      )}

      {viewerTarget && (
        <ViewerModal link={viewerTarget} onClose={handleCloseViewer} t={t} />
      )}

      {showEmailModal && (
        <EmailSetupModal
          formData={emailForm}
          errorMessage={emailError}
          onChange={setEmailForm}
          onClose={handleCloseEmailModal}
          onSubmit={handleSaveEmailConfig}
          t={t}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          formData={settingsForm}
          errorMessage={settingsError}
          onChange={setSettingsForm}
          onClose={handleCloseSettingsModal}
          onSubmit={handleSaveSettings}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackupClick}
          importInputRef={backupInputRef}
          onImportFile={handleImportBackup}
          t={t}
        />
      )}

      {editTarget && (
        <EditModal
          categories={categories}
          formData={editForm}
          onChange={setEditForm}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
          isImage={editTarget?.type === 'image'}
          t={t}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          t={t}
        />
      )}

      {showReminderModal && (
        <ReminderModal
          links={links}
          monthDate={reminderMonth}
          formData={reminderForm}
          errorMessage={reminderError}
          onMonthChange={handleReminderMonth}
          onChange={setReminderForm}
          onClose={handleCloseReminderModal}
          onSubmit={handleReminderSubmit}
          t={t}
          language={language}
        />
      )}

      {showPairingModal && (
        <PairingModal
          pin={pairingInfo.pin}
          host={pairingInfo.host}
          port={pairingInfo.port}
          dataString={pairingString}
          onClose={() => setShowPairingModal(false)}
          onCopy={handleCopyPairing}
          toast={pairingToast}
          t={t}
        />
      )}

    </div>
  )
}

function PairingModal({ pin, host, port, dataString, onClose, onCopy, toast, t }) {
  const qrMax = 23648
  const qrAvailable = Boolean(dataString) && dataString.length <= qrMax
  const qrValue = qrAvailable ? dataString.slice(0, qrMax) : ''
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('pairingButton')}</p>
            <h3>{t('pairingTitle')}</h3>
            <p className="muted">{t('pairingSubtitle')}</p>
          </div>
          <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>

        <div className="modal-body">
          <div className="qr-block">
            {qrAvailable ? (
              <div className="qr-box" aria-label="QR code">
                <QRCode value={qrValue || 'agrega-sync'} size={180} fgColor="#6ff3d6" bgColor="#0f1624" level="L" />
              </div>
            ) : (
              <div className="qr-box qr-box-placeholder" aria-label="QR unavailable">
                <p className="muted center">QR indisponível — use Copiar código</p>
              </div>
            )}
            <p className="qr-pin">{t('pairingPinLabel')}: <strong>{pin || '----'}</strong></p>
            <p className="muted center">{t('pairingScanHint')}</p>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('close')}
            </button>
            <button type="button" className="primary" onClick={onCopy}>
              {t('pairingCopy')}
            </button>
          </div>
          {toast && <div className="toast inline">{toast}</div>}
        </div>
      </div>
    </div>
  )
}

function Modal({ pendingUrl, pendingPreview, categories, formData, onChange, onClose, onSubmit, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('modalLinkDetected')}</p>
            <h3>{t('modalLinkTitle')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('cancel')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>{t('nameLabel')}</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('namePlaceholder')}
            />
          </label>

          <label className="field">
            <span>{t('existingCategory')}</span>
            <select
              value={formData.category}
              onChange={(event) => onChange((prev) => ({ ...prev, category: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('newCategory')}</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder={t('newCategoryPlaceholder')}
            />
          </label>

          <label className="field">
            <span>{t('linkLabel')}</span>
            <div className="input-with-icon">
              {pendingPreview?.favicon && (
                <img className="input-favicon" src={pendingPreview.favicon} alt="favicon" />
              )}
              <input value={pendingUrl} readOnly />
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ImageModal({ pendingImage, categories, formData, errorMessage, onChange, onClose, onSubmit, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('imageDetected')}</p>
            <h3>{t('imageTitle')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          {errorMessage && <p className="error">{errorMessage}</p>}

          {pendingImage?.dataUrl && (
            <div className="image-preview" aria-label={t('imagePreviewAria')}>
              <img src={pendingImage.dataUrl} alt={t('pastedImageAlt')} />
            </div>
          )}

          <label className="field">
            <span>{t('nameLabel')}</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('imageNamePlaceholder')}
            />
          </label>

          <label className="field">
            <span>{t('existingCategory')}</span>
            <select
              value={formData.category}
              onChange={(event) => onChange((prev) => ({ ...prev, category: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('newCategory')}</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder={t('newCategoryPlaceholder')}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('saveImage')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TextModal({ pendingText, categories, formData, errorMessage, onChange, onTextChange, onClose, onSubmit, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('textDetected')}</p>
            <h3>{t('textTitle')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          {errorMessage && <p className="error">{errorMessage}</p>}

          <label className="field">
            <span>{t('textPreview')}</span>
            <textarea
              value={pendingText}
              onChange={(event) => onTextChange(event.target.value)}
              rows={6}
              className="text-preview"
              aria-label={t('textPreviewAria')}
            />
          </label>

          <label className="field">
            <span>{t('nameLabel')}</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('textNamePlaceholder')}
            />
          </label>

          <label className="field">
            <span>{t('existingCategory')}</span>
            <select
              value={formData.category}
              onChange={(event) => onChange((prev) => ({ ...prev, category: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('newCategory')}</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder={t('newCategoryPlaceholder')}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('saveText')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmailSetupModal({ formData, errorMessage, onChange, onClose, onSubmit, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('emailSetupEyebrow')}</p>
            <h3>{t('emailSetupTitle')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          <p className="muted">{t('emailSetupHint')}</p>
          {errorMessage && <p className="error">{errorMessage}</p>}

          <label className="field">
            <span>{t('emailLabel')}</span>
            <input
              value={formData.email}
              onChange={(event) => onChange({ email: event.target.value })}
              placeholder={t('emailPlaceholder')}
              type="email"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('later')}
            </button>
            <button type="submit" className="primary">
              {t('saveEmail')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingsModal({ formData, errorMessage, onChange, onClose, onSubmit, onExportBackup, onImportBackup, importInputRef, onImportFile, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('settingsEyebrow')}</p>
            <h3>{t('settingsTitle')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          {errorMessage && <p className="error">{errorMessage}</p>}

          <label className="field">
            <span>{t('languageLabel')}</span>
            <select
              value={formData.language}
              onChange={(event) => onChange((prev) => ({ ...prev, language: event.target.value }))}
            >
              <option value="pt-BR">{t('langPt')}</option>
              <option value="en-US">{t('langEn')}</option>
            </select>
          </label>

          <label className="field">
            <span>{t('emailLabel')}</span>
            <input
              value={formData.email}
              onChange={(event) => onChange((prev) => ({ ...prev, email: event.target.value }))}
              placeholder={t('emailPlaceholder')}
              type="email"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('save')}
            </button>
          </div>

          <hr className="modal-divider" />

          <div className="backup-block">
            <div>
              <p className="eyebrow">{t('backupTitle')}</p>
              <p className="muted">{t('backupDescription')}</p>
            </div>
            <div className="backup-actions">
              <button type="button" className="ghost" onClick={onExportBackup}>
                {t('backupExport')}
              </button>
              <button type="button" className="primary" onClick={onImportBackup}>
                {t('backupImport')}
              </button>
              <input
                type="file"
                accept="application/json"
                ref={importInputRef}
                onChange={onImportFile}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function ViewerModal({ link, onClose, t }) {
  const isImage = link?.type === 'image'
  const isText = link?.type === 'text'
  const [zoom, setZoom] = useState(1)
  const [viewerCopyMsg, setViewerCopyMsg] = useState('')
  const viewerMediaRef = useRef(null)

  const changeZoom = useCallback((delta) => {
    setZoom((prev) => {
      const next = Math.min(3, Math.max(0.5, Math.round((prev + delta) * 10) / 10))
      return next
    })
  }, [])

  const resetZoom = () => setZoom(1)

  useEffect(() => {
    if (!isImage) return undefined
    const el = viewerMediaRef.current
    if (!el) return undefined

    const handleWheel = (event) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      changeZoom(delta)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [isImage, changeZoom])

  const handleViewerCopy = async () => {
    try {
      if (isImage && link.imageData && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const response = await fetch(link.imageData)
        const blob = await response.blob()
        const mime = blob.type || link.mimeType || 'image/png'
        await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })])
        setViewerCopyMsg(t('viewerCopied'))
        setTimeout(() => setViewerCopyMsg(''), 1600)
        return
      }

      if (isText) {
        await navigator.clipboard.writeText(link.content || link.url || '')
        setViewerCopyMsg(t('viewerCopied'))
        setTimeout(() => setViewerCopyMsg(''), 1600)
        return
      }

      await navigator.clipboard.writeText(link.url || '')
      setViewerCopyMsg(t('viewerCopied'))
      setTimeout(() => setViewerCopyMsg(''), 1600)
    } catch (copyError) {
      setViewerCopyMsg(t('viewerCopyFail'))
      setTimeout(() => setViewerCopyMsg(''), 1600)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal modal-wide">
        <header className="modal-header">
          <div className="viewer-title-block">
            <p className="eyebrow">{t('viewerTitle')}</p>
            <div className="viewer-title-row">
              <h3>{link?.title || (isImage ? t('defaultImageTitle') : t('viewerContent'))}</h3>
              <div className="viewer-title-actions">
                <button
                  className="icon-button"
                  onClick={handleViewerCopy}
                  aria-label={t('copy')}
                  data-tooltip={t('copy')}
                >
                  <IconCopy />
                </button>
                {viewerCopyMsg && <span className="pill subtle viewer-copy-inline fade-in-out">{viewerCopyMsg}</span>}
              </div>
            </div>
          </div>
          <div className="viewer-header-actions">
            <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
          </div>
        </header>

        <div className="modal-body">
          {isImage && (
            <div className="viewer-toolbar">
              <div className="pill subtle">{t('zoomLabel')}: {Math.round(zoom * 100)}%</div>
              <div className="viewer-toolbar__actions">
                <button type="button" className="icon-button small" onClick={() => changeZoom(-0.2)} aria-label={t('zoomOut')}>-</button>
                <button type="button" className="icon-button small" onClick={() => changeZoom(0.2)} aria-label={t('zoomIn')}>+</button>
                <button type="button" className="icon-button small" onClick={resetZoom} aria-label={t('resetZoom')}>1x</button>
              </div>
            </div>
          )}

          {isImage && (
            <div
              className="viewer-media"
              aria-label={t('imagePreviewAria')}
              ref={viewerMediaRef}
            >
              <img
                src={link.imageData || link.url}
                alt={link.title || t('pastedImageAlt')}
                style={{ transform: `scale(${zoom})` }}
                onDoubleClick={resetZoom}
              />
            </div>
          )}

          {isText && (
            <textarea readOnly value={link.content || link.url || ''} className="text-preview" rows={18} />
          )}
        </div>
      </div>
    </div>
  )
}

function EditModal({ categories, formData, onChange, onClose, onSubmit, isImage, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('editLink')}</p>
            <h3>{t('editLinkDesc')}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label={t('cancel')}>×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>{t('nameLabel')}</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('editNamePlaceholder')}
            />
          </label>

          {!isImage && (
            <label className="field">
              <span>{t('linkLabel')}</span>
              <input
                value={formData.url}
                onChange={(event) => onChange((prev) => ({ ...prev, url: event.target.value }))}
                placeholder={t('inputPlaceholder')}
              />
            </label>
          )}

          {isImage && <p className="muted">{t('imageEditInfo')}</p>}

          {formData.type === 'text' && (
            <label className="field">
              <span>{t('textLabel')}</span>
              <textarea
                value={formData.content}
                onChange={(event) => onChange((prev) => ({ ...prev, content: event.target.value }))}
                rows={5}
                className="text-preview editable"
              />
            </label>
          )}

          <label className="field">
            <span>{t('existingCategory')}</span>
            <select
              value={formData.category}
              onChange={(event) => onChange((prev) => ({ ...prev, category: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('newCategory')}</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder={t('newCategoryPlaceholder')}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ title, onConfirm, onCancel, t }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('deleteConfirm')}</p>
            <h3>{t('deleteQuestion')}</h3>
          </div>
          <button className="close" onClick={onCancel} aria-label={t('close')}>×</button>
        </header>

        <div className="modal-body">
          <p className="muted">{title}</p>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              {t('cancel')}
            </button>
            <button type="button" className="primary danger" onClick={onConfirm}>
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReminderModal({ links, monthDate, formData, errorMessage, onMonthChange, onChange, onClose, onSubmit, t, language }) {
  const days = buildCalendar(monthDate)
  const weekdays = t('weekdaysShort') || ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const handleDaySelect = (value) => {
    if (!value) return
    onChange((prev) => ({ ...prev, date: value }))
  }

  const selectedDate = formData.date
  const layoutClass = `reminder-layout ${formData.linkToggle ? 'with-links' : ''}`
  const modalClass = `modal ${formData.linkToggle ? 'modal-wide' : ''}`

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={modalClass}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('reminderNew')}</p>
            <h3>{t('reminderSubtitle')}</h3>
          </div>
          <div className="reminder-header-actions">
            <button className="close" onClick={onClose} aria-label={t('close')}>×</button>
            <div className="reminder-toggle-inline">
              <span className="muted">{t('reminderLinkToggle')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.linkToggle}
                  onChange={(event) => onChange((prev) => ({ ...prev, linkToggle: event.target.checked }))}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          {errorMessage && <div className="banner warning">{errorMessage}</div>}

          <div className={layoutClass}>
            <div className="reminder-main">
              <label className="field">
                <span>{t('subjectLabel')}</span>
                <input
                  value={formData.subject}
                  onChange={(event) => onChange((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder={t('subjectPlaceholder')}
                />
              </label>

              <div className="field">
                <span>{t('dateLabel')}</span>
                <div className="calendar">
                  <div className="calendar__header">
                    <button type="button" className="icon-button small" onClick={() => onMonthChange(-1)} aria-label={t('monthPrev')}>‹</button>
                    <span>{getMonthLabel(monthDate, language)}</span>
                    <button type="button" className="icon-button small" onClick={() => onMonthChange(1)} aria-label={t('monthNext')}>›</button>
                  </div>
                  <div className="calendar__weekdays">
                    {weekdays.map((w, index) => (
                      <span key={`${w}-${index}`}>{w}</span>
                    ))}
                  </div>
                  <div className="calendar__grid">
                    {days.map((day, index) => (
                      <button
                        key={`${day.value}-${index}`}
                        type="button"
                        className={`day ${day.value === selectedDate ? 'selected' : ''} ${!day.value ? 'empty' : ''}`}
                        onClick={() => handleDaySelect(day.value)}
                        disabled={!day.value}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formData.linkToggle && (
              <div className="reminder-links-panel">
                <p className="eyebrow">{t('reminderLinkLabel')}</p>
                <div className="link-select">
                  {links.length === 0 && <p className="muted">{t('reminderNone')}</p>}
                  {links.map((link) => (
                    <label key={link.id} className={`link-select__item ${formData.linkId === link.id ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="reminder-link"
                        value={link.id}
                        checked={formData.linkId === link.id}
                        onChange={(event) => onChange((prev) => ({ ...prev, linkId: event.target.value }))}
                      />
                      <div className="link-select__card">
                        {link.thumbnail && (
                          <div className="thumb small" aria-hidden="true">
                            <img src={link.thumbnail} alt="" />
                          </div>
                        )}
                        <div>
                          <strong>{link.title}</strong>
                          <p className="muted">{link.category}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary">
              {t('reminderSave')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReminderPage({ reminders, monthDate, selectedDate, onMonthChange, onSelectDate, onMove, onNewReminder, onEdit, onBack, t, language }) {
  const days = buildCalendar(monthDate)
  const weekdays = t('weekdaysShort') || ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const remindersByDate = reminders.reduce((acc, reminder) => {
    const key = reminder.date
    if (!acc[key]) acc[key] = []
    acc[key].push(reminder)
    return acc
  }, {})

  Object.values(remindersByDate).forEach((list) => list.sort((a, b) => a.subject.localeCompare(b.subject)))

  const handleDragStart = (event, reminderId) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', reminderId)
  }

  const handleDrop = (event, dayValue) => {
    event.preventDefault()
    const reminderId = event.dataTransfer.getData('text/plain')
    if (reminderId) {
      onMove(reminderId, dayValue)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDayClick = (event, value) => {
    if (!value) return
    onSelectDate(value)
    event.stopPropagation()
  }

  return (
    <section className="reminder-page">
      <div className="reminder-page__header">
        <div>
          <p className="eyebrow">{t('remindersTitle')}</p>
          <h2>{t('remindersSubtitle')}</h2>
          <p className="muted">{t('remindersHint')}</p>
        </div>
        <div className="reminder-page__actions">
          <button className="ghost" onClick={onBack}>{t('back')}</button>
          <button className="primary" onClick={() => onNewReminder(selectedDate)}>{t('newReminder')}</button>
        </div>
      </div>

      <div className="reminder-calendar">
        <div className="calendar__header">
          <button type="button" className="icon-button small" onClick={() => onMonthChange(-1)} aria-label={t('monthPrev')}>‹</button>
          <span>{getMonthLabel(monthDate, language)}</span>
          <button type="button" className="icon-button small" onClick={() => onMonthChange(1)} aria-label={t('monthNext')}>›</button>
        </div>
        <div className="calendar__weekdays">
          {weekdays.map((w, index) => (
            <span key={`${w}-${index}`}>{w}</span>
          ))}
        </div>
        <div className="reminder-calendar__grid">
          {days.map((day, index) => {
            const dayReminders = day.value ? remindersByDate[day.value] || [] : []
            return (
              <div
                key={`${day.value}-${index}`}
                className={`calendar-day ${day.value === selectedDate ? 'selected' : ''} ${!day.value ? 'empty' : ''}`}
                onClick={(event) => handleDayClick(event, day.value)}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, day.value)}
              >
                <div className="calendar-day__top">
                  <div className="calendar-day__date">{day.label}</div>
                  {!!day.value && (
                    <button
                      type="button"
                      className="icon-button small ghost calendar-plus"
                      aria-label={t('calendarPlus')}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectDate(day.value)
                        onNewReminder(day.value)
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="calendar-day__items">
                  {dayReminders.length === 0 && !!day.value && <span className="calendar-day__empty">{t('calendarEmpty')}</span>}
                  {dayReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="reminder-chip"
                      draggable
                      onDragStart={(event) => handleDragStart(event, reminder.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(reminder)
                      }}
                    >
                      <div className="reminder-chip__left">
                        {reminder.link?.thumbnail && (
                          <div className="reminder-chip__thumb" aria-hidden="true">
                            <img src={reminder.link.thumbnail} alt="" />
                          </div>
                        )}
                        <span>{reminder.subject}</span>
                      </div>
                      {reminder.link && <span className="pill subtle">{reminder.link.title}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default App
