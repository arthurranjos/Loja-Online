import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import AdminPanel from '../admin/AdminPanel'

type View = 'login' | 'register' | 'forgot' | 'reset' | 'account'

const authRedirectBase = import.meta.env.DEV
  ? 'http://localhost:5173'
  : window.location.origin

type Address = {
  id: string
  user_id: string
  recipient_name: string
  postal_code: string
  street: string
  street_number: string
  complement: string | null
  district: string
  city: string
  state: string
  is_default: boolean
}

type AddressDraft = Omit<Address, 'id' | 'user_id' | 'is_default'>
type OrderItem = {
  id: string
  variant_id: string
  quantity: number
  product_name: string
  sku: string
  size: string
  color: string
  unit_price_cents: string | number
  discount_cents: string | number
  product_variants: { product_id: string } | null
}
type CustomerReview = { product_id: string; rating: number; comment: string; status: 'visible' | 'hidden'; moderated_at: string | null; created_at: string }
type AfterSalesRequestItem = { order_item_id: string; quantity: number; replacement_variant_id: string | null }
type AfterSalesRequest = { id: string; order_id: string; request_type: 'cancellation' | 'regret' | 'exchange'; reason: string | null; status: string; admin_note: string | null; created_at: string; completed_at: string | null; after_sales_request_items: AfterSalesRequestItem[] }
type ReplacementVariant = { id: string; product_id: string; size: string; color: string; available: boolean }
type OrderEvent = { id: string; previous_status: string | null; new_status: string; reason: string | null; created_at: string }
type CustomerOrder = {
  id: string
  status: string
  created_at: string
  payment_approved_at: string | null
  subtotal_cents: string | number
  discount_cents: string | number
  shipping_cents: string | number
  total_cents: string | number
  shipping_address_snapshot: Record<string, string | null>
  order_items: OrderItem[]
  simulated_payments: { outcome: 'approved' | 'declined'; reason: string | null; processed_at: string }[]
  order_status_history: OrderEvent[]
}

const orderStatusLabels: Record<string, string> = {
  pedido_realizado: 'Pedido realizado',
  pagamento_aprovado: 'Pagamento aprovado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  pagamento_recusado: 'Pagamento recusado',
  pedido_cancelado: 'Pedido cancelado',
}
const afterSalesTypeLabels: Record<AfterSalesRequest['request_type'], string> = {
  cancellation: 'Cancelar pedido', regret: 'Arrependimento / devolução', exchange: 'Solicitar troca',
}
const afterSalesStatusLabels: Record<string, string> = {
  submitted: 'Recebida', processing: 'Em processamento', approved: 'Aprovada', rejected: 'Recusada', completed: 'Concluída',
}

function formatCents(value: string | number | bigint): string {
  const cents = BigInt(value)
  const reais = cents / 100n
  const centavos = (cents % 100n).toString().padStart(2, '0')
  return `R$ ${new Intl.NumberFormat('pt-BR').format(reais)},${centavos}`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const emptyAddress: AddressDraft = {
  recipient_name: '',
  postal_code: '',
  street: '',
  street_number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
}

const brazilianStates = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
]

function AuthPage() {
  const [view, setView] = useState<View>(
    new URLSearchParams(window.location.search).get('flow') === 'recovery' ? 'reset' : 'login',
  )
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [afterSalesRequests, setAfterSalesRequests] = useState<AfterSalesRequest[]>([])
  const [replacementVariants, setReplacementVariants] = useState<ReplacementVariant[]>([])
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddress)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadAccount = useCallback(async (currentUser: User) => {
    setAccountLoading(true)
    const [profileResult, addressResult, orderResult, reviewResult, afterSalesResult] = await Promise.all([
      supabase.from('profiles').select('full_name,role').eq('id', currentUser.id).maybeSingle(),
      supabase.from('addresses').select('*').eq('user_id', currentUser.id).order('created_at'),
      supabase.from('orders')
        .select('id,status,created_at,payment_approved_at,subtotal_cents,discount_cents,shipping_cents,total_cents,shipping_address_snapshot,order_items(id,variant_id,quantity,product_name,sku,size,color,unit_price_cents,discount_cents,product_variants(product_id)),simulated_payments(outcome,reason,processed_at),order_status_history(id,previous_status,new_status,reason,created_at)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false }),
      supabase.from('reviews').select('product_id,rating,comment,status,moderated_at,created_at').eq('user_id', currentUser.id),
      supabase.from('after_sales_requests').select('id,order_id,request_type,reason,status,admin_note,created_at,completed_at,after_sales_request_items(order_item_id,quantity,replacement_variant_id)').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ])

    if (profileResult.error || addressResult.error || orderResult.error || reviewResult.error || afterSalesResult.error || !profileResult.data) {
      setError('Não foi possível carregar os dados da conta. Tente sair e entrar novamente.')
      setAccountLoading(false)
      return
    }

    setFullName(profileResult.data.full_name)
    setIsAdmin(profileResult.data.role === 'admin')
    setAddresses((addressResult.data ?? []) as Address[])
    setOrders((orderResult.data ?? []) as unknown as CustomerOrder[])
    setReviews((reviewResult.data ?? []) as CustomerReview[])
    setAfterSalesRequests((afterSalesResult.data ?? []) as AfterSalesRequest[])
    const loadedOrders = (orderResult.data ?? []) as unknown as CustomerOrder[]
    const productIds = [...new Set(loadedOrders.flatMap((order) => (order.order_items ?? []).map((item) => item.product_variants?.product_id).filter((id): id is string => Boolean(id))))]
    const replacementResult = productIds.length
      ? await supabase.from('catalog_product_variants').select('id,product_id,size,color,available').in('product_id', productIds)
      : { data: [], error: null }
    setReplacementVariants((replacementResult.data ?? []) as ReplacementVariant[])
    setCurrentTime(Date.now())
    setAccountLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    const recoveryRequested = new URLSearchParams(window.location.search).get('flow') === 'recovery'

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        setUser(session.user)
        if (!recoveryRequested) setView('account')
      } else if (recoveryRequested) {
        setNotice('Use o link de recuperação enviado ao seu e-mail para escolher uma nova senha.')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setError('')
        setNotice('Escolha uma nova senha para sua conta.')
        setView('reset')
      } else if (event === 'SIGNED_IN' && session) {
        setError('')
        setNotice('')
        setView('account')
      } else if (event === 'SIGNED_OUT') {
        setFullName('')
        setIsAdmin(false)
        setAddresses([])
        setOrders([])
        setReviews([])
        setAfterSalesRequests([])
        setReplacementVariants([])
        setView('login')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user || view !== 'account') return
    const timer = window.setTimeout(() => void loadAccount(user), 0)
    return () => window.clearTimeout(timer)
  }, [loadAccount, user, view])

  function changeView(nextView: View) {
    setError('')
    setNotice('')
    setView(nextView)
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    const form = new FormData(event.currentTarget)
    const name = String(form.get('full_name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    const newAddress: AddressDraft = {
      recipient_name: String(form.get('recipient_name') ?? '').trim() || name,
      postal_code: String(form.get('postal_code') ?? '').replace(/\D/g, ''),
      street: String(form.get('street') ?? '').trim(),
      street_number: String(form.get('street_number') ?? '').trim(),
      complement: String(form.get('complement') ?? '').trim(),
      district: String(form.get('district') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      state: String(form.get('state') ?? '').toUpperCase(),
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authRedirectBase,
        data: { full_name: name, address: newAddress },
      },
    })

    setBusy(false)
    if (signUpError) {
      setError('Não foi possível criar a conta. Confira os dados e tente novamente.')
      return
    }

    if (data.session) {
      setUser(data.session.user)
      setNotice('Conta criada. Você já pode acessar seu perfil.')
      setView('account')
      return
    }

    setNotice('Cadastro recebido. Confirme seu e-mail para ativar a conta. Na demonstração local, a mensagem está no Mailpit.')
    setView('login')
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (loginError || !data.user) {
      setError('Não foi possível entrar. Confira o e-mail, a senha e a confirmação do e-mail.')
      return
    }
    setUser(data.user)
    setView('account')
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${authRedirectBase}/?flow=recovery`,
    })
    setBusy(false)
    setNotice(resetError
      ? 'Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.'
      : 'Se houver uma conta para esse e-mail, enviaremos um link de recuperação. Confira sua caixa de entrada ou o Mailpit local.')
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    const confirmation = String(form.get('password_confirmation') ?? '')
    if (password !== confirmation) {
      setBusy(false)
      setError('As senhas não coincidem.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) {
      setError('Não foi possível atualizar a senha. Solicite um novo link de recuperação.')
      return
    }

    await supabase.auth.signOut()
    setNotice('Senha atualizada. Entre com a nova senha.')
    setView('login')
    window.history.replaceState({}, '', window.location.pathname)
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('full_name') ?? '').trim()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', user.id)
    setBusy(false)
    if (updateError) {
      setError('Não foi possível atualizar o nome. Confira o preenchimento e tente novamente.')
      return
    }
    setFullName(name)
    setNotice('Nome atualizado.')
  }

  async function submitReview(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault()
    if (!user) return
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true); setError(''); setNotice('')
    const { error: reviewError } = await supabase.rpc('submit_product_review', {
      p_product_id: productId,
      p_rating: Number(data.get('rating')),
      p_comment: String(data.get('comment') ?? '').trim(),
    })
    setBusy(false)
    if (reviewError) { setError(reviewError.message.includes('já enviou') ? 'Você já avaliou este produto.' : 'Não foi possível enviar a avaliação. Confira a elegibilidade e tente novamente.'); return }
    setNotice('Avaliação enviada para moderação. Ela ficará pública após a aprovação do administrador.')
    await loadAccount(user)
  }

  async function submitAfterSales(event: FormEvent<HTMLFormElement>, orderId: string, requestType: AfterSalesRequest['request_type'], orderItemId?: string) {
    event.preventDefault()
    if (!user) return
    const data = new FormData(event.currentTarget)
    const items = orderItemId ? [{
      order_item_id: orderItemId,
      quantity: Number(data.get('quantity')),
      ...(requestType === 'exchange' ? { replacement_variant_id: String(data.get('replacement_variant_id') ?? '') } : {}),
    }] : []
    setBusy(true); setError(''); setNotice('')
    const { error: requestError } = await supabase.rpc('submit_after_sales_request', {
      p_order_id: orderId,
      p_request_type: requestType,
      p_reason: String(data.get('reason') ?? '').trim() || null,
      p_items: items,
    })
    setBusy(false)
    if (requestError) { setError(requestError.message.includes('prazo') ? requestError.message : 'Não foi possível registrar a solicitação. Confira o prazo e o estado do pedido.'); return }
    setNotice('Solicitação registrada. A loja custeia o frete de retorno; itens devolvidos voltam ao estoque depois de recebidos e conferidos.')
    await loadAccount(user)
  }

  async function handleAddressSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const address: AddressDraft = {
      recipient_name: String(form.get('recipient_name') ?? '').trim(),
      postal_code: String(form.get('postal_code') ?? '').replace(/\D/g, ''),
      street: String(form.get('street') ?? '').trim(),
      street_number: String(form.get('street_number') ?? '').trim(),
      complement: String(form.get('complement') ?? '').trim(),
      district: String(form.get('district') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      state: String(form.get('state') ?? '').toUpperCase(),
    }

    const result = editingAddressId
      ? await supabase.from('addresses').update(address).eq('id', editingAddressId)
      : await supabase.from('addresses').insert({ ...address, user_id: user.id })
    setBusy(false)

    if (result.error) {
      setError('Não foi possível salvar o endereço. Confira os dados e tente novamente.')
      return
    }
    setAddressDraft(emptyAddress)
    setEditingAddressId(null)
    setShowAddressForm(false)
    setNotice(editingAddressId ? 'Endereço atualizado.' : 'Endereço adicionado.')
    await loadAccount(user)
  }

  async function handleAddressDelete(addressId: string) {
    if (!user || !window.confirm('Deseja remover este endereço?')) return
    setError('')
    const { error: deleteError } = await supabase.from('addresses').delete().eq('id', addressId)
    if (deleteError) {
      setError('Não foi possível remover o endereço. Tente novamente.')
      return
    }
    setAddresses((current) => current.filter((address) => address.id !== addressId))
    setNotice('Endereço removido.')
  }

  async function handleSignOut() {
    setBusy(true)
    const { error: signOutError } = await supabase.auth.signOut()
    setBusy(false)
    if (signOutError) setError('Não foi possível encerrar a sessão. Tente novamente.')
  }

  function editAddress(address: Address) {
    setAddressDraft({
      recipient_name: address.recipient_name,
      postal_code: address.postal_code,
      street: address.street,
      street_number: address.street_number,
      complement: address.complement ?? '',
      district: address.district,
      city: address.city,
      state: address.state,
    })
    setEditingAddressId(address.id)
    setShowAddressForm(true)
    setError('')
    setNotice('')
  }

  function startNewAddress() {
    setAddressDraft({ ...emptyAddress, recipient_name: fullName })
    setEditingAddressId(null)
    setShowAddressForm(true)
    setError('')
    setNotice('')
  }

  const reviewableProducts = [...new Map(
    orders.filter((order) => order.status === 'entregue')
      .flatMap((order) => order.order_items ?? [])
      .filter((item) => item.product_variants?.product_id)
      .map((item) => [item.product_variants!.product_id, item.product_name] as const),
  ).entries()]

  return (
    <main className="store-shell">
      <aside className="brand-panel" aria-label="Sobre a loja">
        <a className="brand-mark" href="/" aria-label="Loja Online, início">LOJA ONLINE</a>
        <div className="brand-copy">
          <p className="eyebrow">Vista o seu momento</p>
          <h1>Peças feitas para acompanhar você.</h1>
          <p>Uma seleção especial de roupas e acessórios, com cuidado em cada detalhe.</p>
        </div>
        <p className="brand-footer">Moda para todos os dias, do seu jeito.</p>
      </aside>

      <section className="auth-panel" aria-label="Área da conta">
        {view === 'account' ? (
          <section className={`auth-card account-card${isAdmin ? ' admin-account-card' : ''}`} aria-labelledby="account-title">
            <div className="account-heading">
              <div>
                <p className="eyebrow">Minha conta</p>
                <h2 id="account-title">Olá, {fullName || 'cliente'}.</h2>
                <p className="auth-intro">{user?.email}</p>
              </div>
              <button className="secondary-button" type="button" onClick={handleSignOut} disabled={busy}>
                Sair
              </button>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-message" role="status">{notice}</p>}
            {accountLoading ? <p className="muted-note" role="status">Carregando seus dados…</p> : (
              <>
                <section className="account-section" aria-labelledby="profile-title">
                  <h3 id="profile-title">Seus dados</h3>
                  <form className="auth-form" onSubmit={handleProfileSave}>
                    <label className="field" htmlFor="profile-name">
                      Nome completo
                      <input id="profile-name" name="full_name" required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.currentTarget.value)} autoComplete="name" />
                    </label>
                    <button className="secondary-button" type="submit" disabled={busy}>Salvar nome</button>
                  </form>
                  <p className="muted-note">E-mail confirmado: {user?.email}</p>
                </section>

                <section className="account-section" aria-labelledby="orders-title">
                  <div className="orders-heading">
                    <h3 id="orders-title">Seus pedidos</h3>
                    <button className="address-action" type="button" onClick={() => { if (user) void loadAccount(user) }} disabled={accountLoading}>Atualizar</button>
                  </div>
                  {orders.length ? (
                    <div className="order-list">
                      {orders.map((order) => {
                        const address = order.shipping_address_snapshot ?? {}
                        const payment = order.simulated_payments?.[0]
                        const statusHistory = [...(order.order_status_history ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at))
                        const orderRequests = afterSalesRequests.filter((request) => request.order_id === order.id)
                        const cancellationRequest = orderRequests.find((request) => request.request_type === 'cancellation')
                        const hasActiveCancellation = Boolean(cancellationRequest && cancellationRequest.status !== 'rejected')
                        const deliveredAt = statusHistory.filter((event) => event.new_status === 'entregue').at(-1)?.created_at
                        const deliveredAge = deliveredAt && currentTime ? currentTime - new Date(deliveredAt).getTime() : Number.POSITIVE_INFINITY
                        const canCancel = ['pedido_realizado', 'pagamento_aprovado', 'em_preparacao'].includes(order.status)
                        return (
                          <article className="order-card" key={order.id}>
                            <header className="order-card-heading">
                              <div>
                                <h4>Pedido <code>{order.id.slice(0, 8).toUpperCase()}</code></h4>
                                <p>{formatDate(order.created_at)}</p>
                              </div>
                              <span className="order-status">{orderStatusLabels[order.status] ?? order.status}</span>
                              <strong className="order-total">{formatCents(order.total_cents)}</strong>
                            </header>
                            <details className="order-details">
                              <summary>Ver itens, entrega e atualizações</summary>
                              <p className="order-address"><strong>Entrega:</strong> {address.recipient_name}, {address.street}, {address.street_number}{address.complement ? `, ${address.complement}` : ''} · {address.district} · {address.city}/{address.state} · CEP {address.postal_code}</p>
                              <ul className="order-items-list">
                                {(order.order_items ?? []).map((item) => {
                                  const lineTotal = BigInt(item.unit_price_cents) * BigInt(item.quantity) - BigInt(item.discount_cents)
                                  const lineRequests = orderRequests.filter((request) => request.after_sales_request_items?.some((line) => line.order_item_id === item.id))
                                  const priorQuantity = lineRequests.filter((request) => request.status !== 'rejected').reduce((sum, request) => sum + (request.after_sales_request_items.find((line) => line.order_item_id === item.id)?.quantity ?? 0), 0)
                                  const remainingQuantity = Math.max(0, item.quantity - priorQuantity)
                                  const productId = item.product_variants?.product_id
                                  const choices = replacementVariants.filter((variant) => variant.product_id === productId && variant.available && variant.id !== item.variant_id)
                                  const canRegret = order.status === 'entregue' && deliveredAt && deliveredAge <= 7 * 24 * 60 * 60 * 1000
                                  const canExchange = order.status === 'entregue' && deliveredAt && deliveredAge <= 30 * 24 * 60 * 60 * 1000
                                  return <li className="order-item-with-returns" key={item.id}><div className="order-item-main"><span><strong>{item.product_name}</strong><small>{item.size} · {item.color} · Qtd. {item.quantity}</small></span><span>{formatCents(lineTotal)}</span></div>
                                    {lineRequests.map((request) => {
                                      const line = request.after_sales_request_items.find((entry) => entry.order_item_id === item.id)
                                      const replacement = line?.replacement_variant_id ? replacementVariants.find((variant) => variant.id === line.replacement_variant_id) : undefined
                                      return <div className={`after-sales-state after-sales-${request.status}`} key={request.id}><strong>{afterSalesTypeLabels[request.request_type]} · {afterSalesStatusLabels[request.status] ?? request.status} · {line?.quantity ?? 0} un.</strong>{replacement && <p>Reposição escolhida: {replacement.size} · {replacement.color}</p>}{request.reason && <p>{request.reason}</p>}{request.admin_note && <p>Atualização da loja: {request.admin_note}</p>}</div>
                                    })}
                                    {!hasActiveCancellation && remainingQuantity > 0 && order.status === 'entregue' && <div className="after-sales-options">
                                      {canRegret && <form className="auth-form after-sales-form" onSubmit={(event) => void submitAfterSales(event, order.id, 'regret', item.id)}><strong>Devolver este item · até 7 dias</strong><label className="field">Quantidade<input name="quantity" type="number" min="1" max={remainingQuantity} defaultValue="1" required /></label><p className="muted-note">Arrependimento sem justificativa. A loja paga o frete de retorno.</p><button className="address-action" type="submit" disabled={busy}>Solicitar devolução</button></form>}
                                      {canExchange && <form className="auth-form after-sales-form" onSubmit={(event) => void submitAfterSales(event, order.id, 'exchange', item.id)}><strong>Trocar este item · até 30 dias</strong><label className="field">Quantidade<input name="quantity" type="number" min="1" max={remainingQuantity} defaultValue="1" required /></label><label className="field">Tamanho e cor desejados<select name="replacement_variant_id" required defaultValue=""><option value="" disabled>Selecione uma variação disponível</option>{choices.map((variant) => <option key={variant.id} value={variant.id}>{variant.size} · {variant.color}</option>)}</select></label><label className="field">Motivo<textarea name="reason" required minLength={5} maxLength={1000} rows={2} /></label><p className="muted-note">A loja paga o frete de retorno. O estoque é conferido ao aprovar a troca.</p><button className="address-action" type="submit" disabled={busy || choices.length === 0}>Solicitar troca</button>{choices.length === 0 && <p className="muted-note">Não há outra variação disponível deste produto neste momento.</p>}</form>}
                                    </div>}
                                    {order.status === 'entregue' && remainingQuantity === 0 && <p className="muted-note">Toda a quantidade deste item já está em uma solicitação não recusada ou concluída.</p>}
                                  </li>
                                })}
                              </ul>
                              <div className="order-totals">
                                <p><span>Produtos</span><strong>{formatCents(order.subtotal_cents)}</strong></p>
                                <p><span>Descontos</span><strong>− {formatCents(order.discount_cents)}</strong></p>
                                <p><span>Frete</span><strong>{formatCents(order.shipping_cents)}</strong></p>
                                <p className="order-total-row"><span>Total</span><strong>{formatCents(order.total_cents)}</strong></p>
                              </div>
                              {payment?.reason && <p className="order-payment-reason"><strong>Pagamento:</strong> {payment.reason}</p>}
                              {order.payment_approved_at && <p className="muted-note">Pagamento aprovado em {formatDate(order.payment_approved_at)}.</p>}
                              <div className="order-history">
                                <h5>Atualizações</h5>
                                {statusHistory.length ? <ol>{statusHistory.map((event) => <li key={event.id}><strong>{orderStatusLabels[event.new_status] ?? event.new_status}</strong><time dateTime={event.created_at}>{formatDate(event.created_at)}</time>{event.reason && <span>{event.reason}</span>}</li>)}</ol> : <p className="muted-note">Nenhuma atualização registrada.</p>}
                              </div>
                              <div className="order-after-sales">
                                <h5>Cancelamento, devolução e troca</h5>
                                {cancellationRequest && <div className={`after-sales-state after-sales-${cancellationRequest.status}`}><strong>Cancelar pedido · {afterSalesStatusLabels[cancellationRequest.status] ?? cancellationRequest.status}</strong>{cancellationRequest.reason && <p>{cancellationRequest.reason}</p>}{cancellationRequest.admin_note && <p>Atualização da loja: {cancellationRequest.admin_note}</p>}</div>}
                                {canCancel && !cancellationRequest && !orderRequests.some((request) => request.status !== 'rejected') && <form className="auth-form after-sales-form" onSubmit={(event) => void submitAfterSales(event, order.id, 'cancellation')}><strong>Cancelar o pedido inteiro antes do envio</strong><label className="field">Motivo<textarea name="reason" required minLength={5} maxLength={1000} rows={2} /></label><p className="muted-note">A solicitação será analisada pela loja. Se aprovada, o estoque retorna imediatamente.</p><button className="address-action" type="submit" disabled={busy}>Solicitar cancelamento</button></form>}
                                {order.status === 'enviado' && <p className="muted-note">O pedido já foi enviado; aguarde a entrega para solicitar devolução ou troca dentro dos prazos.</p>}
                                {order.status === 'entregue' && <p className="muted-note">Solicitações de devolução e troca são por item e quantidade. A loja paga o frete de retorno; o estoque só retorna após recebimento e conferência. O pagamento é simulado e não há estorno financeiro real.</p>}
                              </div>
                            </details>
                          </article>
                        )
                      })}
                    </div>
                  ) : <p className="muted-note">Você ainda não tem pedidos.</p>}
                </section>

                <section className="account-section" aria-labelledby="reviews-title">
                  <h3 id="reviews-title">Avaliações de produtos entregues</h3>
                  {reviewableProducts.length ? <ul className="review-account-list">{reviewableProducts.map(([productId, productName]) => {
                    const review = reviews.find((item) => item.product_id === productId)
                    return <li className="review-account-item" key={productId}><div className="review-account-heading"><strong>{productName}</strong>{review && <span className={review.status === 'visible' ? 'review-approved-label' : 'review-pending-label'}>{review.status === 'visible' ? 'Publicada' : review.moderated_at ? 'Ocultada pela moderação' : 'Aguardando moderação'}</span>}</div>
                      {review ? <p><span aria-label={`${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span> · {review.comment}</p> : <form className="auth-form review-form" onSubmit={(event) => void submitReview(event, productId)}>
                        <label className="field">Nota<select name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} de 5</option>)}</select></label>
                        <label className="field">Comentário<textarea name="comment" required minLength={5} maxLength={2000} rows={3} /></label>
                        <button className="secondary-button" type="submit" disabled={busy}>Enviar para moderação</button>
                      </form>}
                    </li>
                  })}</ul> : <p className="muted-note">As avaliações ficam disponíveis depois que o pedido for entregue.</p>}
                </section>

                <section className="account-section" aria-labelledby="addresses-title">
                  <h3 id="addresses-title">Endereços salvos</h3>
                  {addresses.length ? (
                    <ul className="address-list">
                      {addresses.map((address) => (
                        <li className="address-item" key={address.id}>
                          <div>
                            <strong>{address.recipient_name}{address.is_default ? ' · Principal' : ''}</strong>
                            <p>{address.street}, {address.street_number}{address.complement ? `, ${address.complement}` : ''}</p>
                            <p>{address.district} · {address.city}/{address.state} · CEP {address.postal_code}</p>
                          </div>
                          <div className="address-item-actions">
                            <button className="address-action" type="button" onClick={() => editAddress(address)}>Editar</button>
                            <button className="address-action" type="button" onClick={() => void handleAddressDelete(address.id)}>Remover</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="muted-note">Nenhum endereço foi encontrado.</p>}
                  {!showAddressForm && <button className="secondary-button" type="button" onClick={startNewAddress}>Adicionar endereço</button>}

                  {showAddressForm && (
                    <form className="address-form" onSubmit={handleAddressSave}>
                      <div className="field-grid">
                        <label className="field" htmlFor="address-recipient">Destinatário
                          <input id="address-recipient" name="recipient_name" required minLength={2} maxLength={120} defaultValue={addressDraft.recipient_name} autoComplete="name" />
                        </label>
                        <label className="field" htmlFor="address-cep">CEP
                          <input id="address-cep" name="postal_code" required inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} defaultValue={addressDraft.postal_code} autoComplete="postal-code" placeholder="00000-000" />
                        </label>
                      </div>
                      <label className="field" htmlFor="address-street">Logradouro
                        <input id="address-street" name="street" required minLength={2} maxLength={160} defaultValue={addressDraft.street} autoComplete="street-address" />
                      </label>
                      <div className="field-grid">
                        <label className="field" htmlFor="address-number">Número
                          <input id="address-number" name="street_number" required maxLength={30} defaultValue={addressDraft.street_number} />
                        </label>
                        <label className="field" htmlFor="address-complement">Complemento (opcional)
                          <input id="address-complement" name="complement" maxLength={120} defaultValue={addressDraft.complement ?? ''} />
                        </label>
                      </div>
                      <label className="field" htmlFor="address-district">Bairro
                        <input id="address-district" name="district" required minLength={2} maxLength={100} defaultValue={addressDraft.district} autoComplete="address-level3" />
                      </label>
                      <div className="field-grid">
                        <label className="field" htmlFor="address-city">Cidade
                          <input id="address-city" name="city" required minLength={2} maxLength={100} defaultValue={addressDraft.city} autoComplete="address-level2" />
                        </label>
                        <label className="field" htmlFor="address-state">Estado
                          <select id="address-state" name="state" required defaultValue={addressDraft.state} autoComplete="address-level1">
                            <option value="">Selecione</option>
                            {brazilianStates.map(([code, stateName]) => <option key={code} value={code}>{stateName}</option>)}
                          </select>
                        </label>
                      </div>
                      <button className="primary-button" type="submit" disabled={busy}>{editingAddressId ? 'Salvar alterações' : 'Salvar endereço'}</button>
                      <button className="text-button" type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); setAddressDraft(emptyAddress) }}>Cancelar</button>
                    </form>
                  )}
                </section>
                {isAdmin && <AdminPanel />}
              </>
            )}
          </section>
        ) : (
          <section className="auth-card" aria-labelledby="auth-title">
            <p className="eyebrow">Loja Online · sua conta</p>
            <h2 id="auth-title">
              {view === 'register' ? 'Crie sua conta' : view === 'forgot' ? 'Recuperar senha' : view === 'reset' ? 'Nova senha' : 'Boas-vindas de volta'}
            </h2>
            <p className="auth-intro">
              {view === 'register' ? 'Cadastre seus dados e um endereço de entrega para começar.' : view === 'forgot' ? 'Informe seu e-mail para receber um link de recuperação.' : view === 'reset' ? 'Escolha uma senha nova para acessar sua conta.' : 'Entre para acompanhar seus pedidos, sua conta e seus endereços.'}
            </p>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-message" role="status">{notice}{notice.includes('Mailpit') && <> {' '}<a href="http://127.0.0.1:54324" target="_blank" rel="noreferrer">Abrir Mailpit</a></>}</p>}

            {view === 'register' && (
              <form className="auth-form" onSubmit={handleRegister}>
                <label className="field" htmlFor="register-name">Nome completo
                  <input id="register-name" name="full_name" required minLength={2} maxLength={120} autoComplete="name" />
                </label>
                <label className="field" htmlFor="register-email">E-mail
                  <input id="register-email" name="email" type="email" required maxLength={254} autoComplete="email" />
                </label>
                <label className="field" htmlFor="register-password">Senha
                  <input id="register-password" name="password" type="password" required minLength={6} autoComplete="new-password" />
                </label>
                <p className="eyebrow">Endereço inicial</p>
                <div className="field-grid">
                  <label className="field" htmlFor="register-cep">CEP
                    <input id="register-cep" name="postal_code" required inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} autoComplete="postal-code" placeholder="00000-000" />
                  </label>
                  <label className="field" htmlFor="register-number">Número
                    <input id="register-number" name="street_number" required maxLength={30} />
                  </label>
                </div>
                <label className="field" htmlFor="register-street">Logradouro
                  <input id="register-street" name="street" required minLength={2} maxLength={160} autoComplete="street-address" />
                </label>
                <label className="field" htmlFor="register-complement">Complemento (opcional)
                  <input id="register-complement" name="complement" maxLength={120} />
                </label>
                <div className="field-grid">
                  <label className="field" htmlFor="register-district">Bairro
                    <input id="register-district" name="district" required minLength={2} maxLength={100} autoComplete="address-level3" />
                  </label>
                  <label className="field" htmlFor="register-city">Cidade
                    <input id="register-city" name="city" required minLength={2} maxLength={100} autoComplete="address-level2" />
                  </label>
                </div>
                <label className="field" htmlFor="register-state">Estado
                  <select id="register-state" name="state" required defaultValue="" autoComplete="address-level1">
                    <option value="">Selecione</option>
                    {brazilianStates.map(([code, stateName]) => <option key={code} value={code}>{stateName}</option>)}
                  </select>
                </label>
                <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Criando conta…' : 'Criar conta e enviar confirmação'}</button>
              </form>
            )}

            {view === 'login' && (
              <form className="auth-form" onSubmit={handleLogin}>
                <label className="field" htmlFor="login-email">E-mail
                  <input id="login-email" name="email" type="email" required autoComplete="email" />
                </label>
                <label className="field" htmlFor="login-password">Senha
                  <input id="login-password" name="password" type="password" required autoComplete="current-password" />
                </label>
                <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
              </form>
            )}

            {view === 'forgot' && (
              <form className="auth-form" onSubmit={handleForgotPassword}>
                <label className="field" htmlFor="forgot-email">E-mail
                  <input id="forgot-email" name="email" type="email" required autoComplete="email" />
                </label>
                <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar link de recuperação'}</button>
              </form>
            )}

            {view === 'reset' && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <label className="field" htmlFor="new-password">Nova senha
                  <input id="new-password" name="password" type="password" required minLength={6} autoComplete="new-password" />
                </label>
                <label className="field" htmlFor="confirm-password">Confirme a nova senha
                  <input id="confirm-password" name="password_confirmation" type="password" required minLength={6} autoComplete="new-password" />
                </label>
                <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Atualizar senha'}</button>
              </form>
            )}

            <nav className="auth-links" aria-label="Opções da conta">
              {view === 'login' && <><span>Não tem conta? <button className="text-button" type="button" onClick={() => changeView('register')}>Criar conta</button></span><button className="text-button" type="button" onClick={() => changeView('forgot')}>Esqueci minha senha</button></>}
              {view !== 'login' && <button className="text-button" type="button" onClick={() => changeView('login')}>Voltar para entrar</button>}
            </nav>
          </section>
        )}
      </section>
    </main>
  )
}

export default AuthPage
