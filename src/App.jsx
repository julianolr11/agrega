import { useEffect, useMemo, useState } from 'react'
import './App.css'

const defaultCategories = ['Compras', 'Desenhos', 'Vídeos']

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


const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (error) {
    return false
  }
}

const getYouTubeThumbnail = (url) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }
  } catch (error) {
    return ''
  }
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

    parts.forEach((segment) => {
      const match = segment.match(/MLB-?\d+/i)
      if (match) {
        candidates.push(match[0].replace('-', '').toUpperCase())
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

  const targets = [
    `https://api.mercadolibre.com/items/${id}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.mercadolibre.com/items/${id}`)}`,
  ]

  for (const target of targets) {
    try {
      const response = await fetch(target)
      if (!response.ok) continue
      const data = await response.json()
      const image = data.pictures?.[0]?.secure_url || data.secure_thumbnail || ''
      if (image) return image
    } catch (error) {
      // ignore and try next target
    }
  }

  return ''
}

const getThumbnailUrl = (url) => {
  const yt = getYouTubeThumbnail(url)
  if (yt) return yt
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

const getMonthLabel = (date) => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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

function App() {
  const [linkInput, setLinkInput] = useState('')
  const [pendingUrl, setPendingUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: defaultCategories[0],
    newCategory: '',
  })
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState(defaultCategories)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOption, setFilterOption] = useState('date_desc')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('collect')
  const [actionMessage, setActionMessage] = useState('')
  const [cardMessage, setCardMessage] = useState({ id: '', text: '' })
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', url: '', category: '', newCategory: '' })
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

  const refreshMercadoLivreThumb = async (linkId, url) => {
    const mlThumb = await fetchMercadoLivreThumbnail(url)
    if (!mlThumb) return
    setLinks((prev) => prev.map((item) => (item.id === linkId ? { ...item, thumbnail: mlThumb } : item)))
  }

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
    if (!term) return filteredByCategory

    const filteredBySearch = filteredByCategory.filter((link) => {
      const haystack = `${link.title} ${link.category} ${link.url}`.toLowerCase()
      return haystack.includes(term)
    })

    const sorted = [...filteredBySearch]
    sorted.sort((a, b) => {
      if (filterOption === 'date_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (filterOption === 'date_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (filterOption === 'alpha_asc') {
        return a.title.localeCompare(b.title)
      }
      if (filterOption === 'alpha_desc') {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return sorted
  }, [links, selectedCategory, searchQuery, filterOption])

  const handleAddClick = () => {
    const trimmed = linkInput.trim()
    if (!trimmed) {
      setError('Cole um link antes de adicionar.')
      return
    }
    if (!isValidUrl(trimmed)) {
      setError('Formato de link inválido. Use http:// ou https://')
      return
    }

    beginLinkFlow(trimmed)
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
  }

  const handleSaveLink = (event) => {
    event.preventDefault()
    const chosenCategory = formData.newCategory.trim() || formData.category || 'Sem categoria'
    const normalizedCategory = chosenCategory.trim()
    const title = formData.title.trim() || 'Link sem nome'

    if (!normalizedCategory) {
      setError('Escolha ou crie uma categoria.')
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
      },
    ])

    refreshMercadoLivreThumb(id, pendingUrl)

    setLinkInput('')
    setPendingUrl('')
    setShowModal(false)
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

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link.url)
      showCardAction(link.id, 'Link copiado')
    } catch (copyError) {
      showCardAction(link.id, 'Não foi possível copiar')
    }
  }

  const handleOpen = (link) => {
    if (window?.agrega?.openExternal) {
      window.agrega.openExternal(link.url)
      showCardAction(link.id, 'Abrindo no navegador')
      return
    }
    window.open(link.url, '_blank', 'noopener,noreferrer')
    showCardAction(link.id, 'Abrindo no navegador')
  }

  const handleEdit = (link) => {
    setEditTarget(link)
    setEditForm({
      title: link.title,
      url: link.url,
      category: link.category,
      newCategory: '',
    })
  }

  const handleDelete = (link) => {
    setDeleteTarget(link)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setLinks((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    showAction('Link removido')
    setDeleteTarget(null)
  }

  const handleDeleteCancel = () => setDeleteTarget(null)

  const handleEditSubmit = (event) => {
    event.preventDefault()
    if (!editTarget) return
    const chosenCategory = editForm.newCategory.trim() || editForm.category || 'Sem categoria'
    const normalizedCategory = chosenCategory.trim()
    if (!normalizedCategory) {
      setError('Escolha ou crie uma categoria.')
      return
    }

    if (editForm.newCategory.trim() && !categories.includes(normalizedCategory)) {
      setCategories((prev) => [...prev, normalizedCategory])
    }

    const nextUrl = editForm.url.trim()

    setLinks((prev) => prev.map((item) => {
      if (item.id !== editTarget.id) return item
      return {
        ...item,
        title: editForm.title.trim() || 'Link sem nome',
        url: nextUrl,
        category: normalizedCategory,
        thumbnail: getThumbnailUrl(nextUrl),
        favicon: getFaviconUrl(nextUrl),
      }
    }))

    refreshMercadoLivreThumb(editTarget.id, nextUrl)

    setEditTarget(null)
    setEditForm({ title: '', url: '', category: '', newCategory: '' })
    setError('')
    showAction('Link atualizado')
  }

  const handleReminderSubmit = (event) => {
    event.preventDefault()
    if (!reminderForm.subject.trim()) {
      setReminderError('Informe um assunto')
      return
    }
    if (!reminderForm.date) {
      setReminderError('Escolha uma data')
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
      showAction('Lembrete atualizado')
    } else {
      setReminders((prev) => [...prev, payload])
      showAction('Lembrete criado')
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
    showAction('Lembrete movido')
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
    showAction('Lembrete removido')
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

  useEffect(() => {
    const onPaste = (event) => {
      if (showModal) return
      const text = event.clipboardData?.getData('text')?.trim()
      if (!text) return
      if (!isValidUrl(text)) return

      event.preventDefault()
      setLinkInput(text)
      beginLinkFlow(text)
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [showModal, categories])

  const handleCloseModal = () => {
    setShowModal(false)
    setPendingUrl('')
  }

  const handleCloseReminderModal = () => {
    setShowReminderModal(false)
    setReminderError('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Agrega</div>
        <div className="badge">{links.length} links</div>
      </header>

      {actionMessage && <div className="toast">{actionMessage}</div>}

      <div className="content">
        <aside className="sidebar">
          <button className="ghost-cta" onClick={() => setView('dashboard')}>
            Início
          </button>
          <button className="cta" onClick={() => openReminderForDate()}>
            Criar lembrete
          </button>
          <button className="ghost-cta" onClick={() => setView('reminders')}>
            Ver lembretes
          </button>
          <div className="sidebar-header">
            <p className="eyebrow">Categorias</p>
            <span className="mini">clique para filtrar</span>
          </div>
          <button
            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span>Todas</span>
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
            <p>Adicione um link para vê-lo aqui.</p>
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
            />
          ) : (
            <>
              <section className="capture-card">
                <div>
                  <p className="eyebrow">Cole o link</p>
                  <h1>Capture links sem atrito</h1>
                  <p className="muted">Cole, clique no "+" e dê um nome rápido. Nós guardamos na categoria certa.</p>
                </div>
                <div className="input-row">
                  <input
                    autoFocus
                    value={linkInput}
                    onChange={(event) => setLinkInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleAddClick()
                    }}
                    placeholder="https://..."
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
                    <p className="eyebrow">Dashboard</p>
                    <h2>Seus links guardados</h2>
                  </div>
                  <div className="dashboard-actions">
                    <input
                      className="search-input"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por nome, categoria ou link"
                    />
                    <div className="filter-wrapper">
                      <button
                        className="icon-button"
                        aria-label="Filtros"
                        data-tooltip="Filtros"
                        onClick={() => setFilterOpen((prev) => !prev)}
                      >
                        <IconFilter />
                      </button>
                      {filterOpen && (
                        <div className="filter-menu">
                          <label>
                            <input
                              type="radio"
                              name="filter"
                              value="date_desc"
                              checked={filterOption === 'date_desc'}
                              onChange={(event) => setFilterOption(event.target.value)}
                            />
                            Data (mais recentes)
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="filter"
                              value="date_asc"
                              checked={filterOption === 'date_asc'}
                              onChange={(event) => setFilterOption(event.target.value)}
                            />
                            Data (mais antigos)
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="filter"
                              value="alpha_asc"
                              checked={filterOption === 'alpha_asc'}
                              onChange={(event) => setFilterOption(event.target.value)}
                            />
                            A–Z
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="filter"
                              value="alpha_desc"
                              checked={filterOption === 'alpha_desc'}
                              onChange={(event) => setFilterOption(event.target.value)}
                            />
                            Z–A
                          </label>
                        </div>
                      )}
                    </div>
                    <button
                      className={`icon-button ${editMode ? 'active' : ''}`}
                      onClick={() => setEditMode((prev) => !prev)}
                      aria-label="Modo edição"
                      data-tooltip={editMode ? 'Sair do modo edição' : 'Entrar no modo edição'}
                    >
                      <IconEdit />
                    </button>
                  </div>
                </div>

                {links.length === 0 && view === 'collect' && (
                  <div className="empty">
                    <p>Adicione o primeiro link para preencher seu painel.</p>
                  </div>
                )}

                {links.length > 0 && (
                  <div className="link-grid">
                    {visibleLinks.map((link) => (
                      <article className={`link-card ${editMode ? 'editable' : ''}`} key={link.id}>
                        <div className="link-card__content">
                          <div className="link-card__top">
                            <span className="pill subtle">{link.category}</span>
                            <span className="timestamp">{new Date(link.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="link-card__body">
                            {link.thumbnail && (
                              <div className="thumb" aria-hidden="true">
                                <img src={link.thumbnail} alt="" />
                              </div>
                            )}
                            <div className="link-card__text">
                              <h3>
                                <a className="link-title" href={link.url} target="_blank" rel="noreferrer">
                                  {link.title}
                                </a>
                              </h3>
                              <div className="link-meta">
                                <span className="favicon-pill">
                                  {link.favicon && (
                                    <img
                                      src={link.favicon}
                                      alt=""
                                      onError={(event) => {
                                        event.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  )}
                                  {getDomain(link.url)}
                                </span>
                                <div className="card-actions">
                                  <button
                                    className="icon-button"
                                    onClick={() => handleOpen(link)}
                                    aria-label="Abrir no navegador"
                                    data-tooltip="Abrir no navegador"
                                  >
                                    <IconExternal />
                                  </button>
                                  <button
                                    className="icon-button"
                                    onClick={() => handleCopy(link)}
                                    aria-label="Copiar"
                                    data-tooltip="Copiar link"
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
                              aria-label="Editar link"
                              data-tooltip="Editar link"
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="icon-button small danger"
                              onClick={() => handleDelete(link)}
                              aria-label="Excluir link"
                              data-tooltip="Excluir link"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
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
          categories={categories}
          formData={formData}
          onChange={setFormData}
          onClose={handleCloseModal}
          onSubmit={handleSaveLink}
        />
      )}

      {editTarget && (
        <EditModal
          categories={categories}
          formData={editForm}
          onChange={setEditForm}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
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
        />
      )}

    </div>
  )
}

function Modal({ pendingUrl, categories, formData, onChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Identificamos um link</p>
            <h3>Dê um nome e uma categoria</h3>
          </div>
          <button className="close" onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex: Lista de compras"
            />
          </label>

          <label className="field">
            <span>Categoria existente</span>
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
            <span>Ou crie uma nova</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder="Nova categoria"
            />
          </label>

          <label className="field">
            <span>Link</span>
            <input value={pendingUrl} readOnly />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditModal({ categories, formData, onChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Editar link</p>
            <h3>Atualize o título, link ou categoria</h3>
          </div>
          <button className="close" onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form className="modal-body" onSubmit={onSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              value={formData.title}
              onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex: Referências"
            />
          </label>

          <label className="field">
            <span>Link</span>
            <input
              value={formData.url}
              onChange={(event) => onChange((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label className="field">
            <span>Categoria existente</span>
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
            <span>Ou crie uma nova</span>
            <input
              value={formData.newCategory}
              onChange={(event) => onChange((prev) => ({ ...prev, newCategory: event.target.value }))}
              placeholder="Nova categoria"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Excluir link</p>
            <h3>Tem certeza que deseja excluir?</h3>
          </div>
          <button className="close" onClick={onCancel} aria-label="Fechar">×</button>
        </header>

        <div className="modal-body">
          <p className="muted">{title}</p>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="primary danger" onClick={onConfirm}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReminderModal({ links, monthDate, formData, errorMessage, onMonthChange, onChange, onClose, onSubmit }) {
  const days = buildCalendar(monthDate)

  const handleDaySelect = (value) => {
    if (!value) return
    onChange((prev) => ({ ...prev, date: value }))
  }

  const selectedDate = formData.date
  const layoutClass = `reminder-layout ${formData.linkToggle ? 'with-links' : ''}`
  const modalClass = `modal ${formData.linkToggle ? 'modal-wide' : ''}`

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={modalClass}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Novo lembrete</p>
            <h3>Defina assunto, data e vínculo</h3>
          </div>
          <div className="reminder-header-actions">
            <button className="close" onClick={onClose} aria-label="Fechar">×</button>
            <div className="reminder-toggle-inline">
              <span className="muted">Vincular</span>
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
                <span>Assunto</span>
                <input
                  value={formData.subject}
                  onChange={(event) => onChange((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder="Ex: Revisar artigo"
                />
              </label>

              <div className="field">
                <span>Data</span>
                <div className="calendar">
                  <div className="calendar__header">
                    <button type="button" className="icon-button small" onClick={() => onMonthChange(-1)} aria-label="Mês anterior">‹</button>
                    <span>{getMonthLabel(monthDate)}</span>
                    <button type="button" className="icon-button small" onClick={() => onMonthChange(1)} aria-label="Próximo mês">›</button>
                  </div>
                  <div className="calendar__weekdays">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((w, index) => (
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
                <p className="eyebrow">Escolha um link</p>
                <div className="link-select">
                  {links.length === 0 && <p className="muted">Nenhum link cadastrado.</p>}
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
              Cancelar
            </button>
            <button type="submit" className="primary">
              Salvar lembrete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReminderPage({ reminders, monthDate, selectedDate, onMonthChange, onSelectDate, onMove, onNewReminder, onEdit, onBack }) {
  const days = buildCalendar(monthDate)

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
          <p className="eyebrow">Lembretes</p>
          <h2>Calendário expandido</h2>
          <p className="muted">Arraste um lembrete para outra data direto no calendário.</p>
        </div>
        <div className="reminder-page__actions">
          <button className="ghost" onClick={onBack}>Voltar</button>
          <button className="primary" onClick={() => onNewReminder(selectedDate)}>Novo lembrete</button>
        </div>
      </div>

      <div className="reminder-calendar">
        <div className="calendar__header">
          <button type="button" className="icon-button small" onClick={() => onMonthChange(-1)} aria-label="Mês anterior">‹</button>
          <span>{getMonthLabel(monthDate)}</span>
          <button type="button" className="icon-button small" onClick={() => onMonthChange(1)} aria-label="Próximo mês">›</button>
        </div>
        <div className="calendar__weekdays">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((w, index) => (
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
                      aria-label="Novo lembrete neste dia"
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
                  {dayReminders.length === 0 && !!day.value && <span className="calendar-day__empty">—</span>}
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
