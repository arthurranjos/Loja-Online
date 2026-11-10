import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminPanel.css'

type Category = { id: string; name: string; slug: string; active: boolean }
type Product = { id: string; category_id: string; name: string; slug: string; description: string; price_cents: number; active: boolean }
type Variant = { id: string; product_id: string; size: string; color: string; sku: string; stock_on_hand: number; active: boolean }
type Order = { id: string; user_id: string; status: string; created_at: string; total_cents: number; shipping_address_snapshot: Record<string, string> }
type Customer = { user_id: string; email: string; full_name: string; role: string; created_at: string }
type Review = { id: string; user_id: string; product_id: string; rating: number; comment: string; status: 'visible' | 'hidden'; created_at: string }
type SalesReport = { order_count: number | string; product_net_cents: string; shipping_cents: string }
type AfterSalesLine = { order_item_id: string; quantity: number; replacement_variant_id: string | null; order_items: { product_name: string; size: string; color: string }[] | { product_name: string; size: string; color: string } | null }
type AfterSalesRequest = { id: string; order_id: string; user_id: string; request_type: 'cancellation' | 'regret' | 'exchange'; reason: string | null; status: string; admin_note: string | null; created_at: string; after_sales_request_items: AfterSalesLine[] }
type Promotion = { id: string; product_id: string; discount_type: 'percentage' | 'fixed'; percentage: number | null; fixed_discount_cents: number | null; starts_at: string; ends_at: string; active: boolean }

const nextStatus: Record<string, string> = {
  pagamento_aprovado: 'em_preparacao',
  em_preparacao: 'enviado',
  enviado: 'entregue',
}
const statusLabels: Record<string, string> = {
  pedido_realizado: 'Pedido realizado', pagamento_aprovado: 'Pagamento aprovado',
  pagamento_recusado: 'Pagamento recusado', em_preparacao: 'Em preparação',
  enviado: 'Enviado', entregue: 'Entregue', pedido_cancelado: 'Cancelado',
}
const cents = (value: number | string) => `R$ ${(Number(value) / 100).toFixed(2).replace('.', ',')}`
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const localDateTimeInput = (value: string) => { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) }

export default function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [afterSalesRequests, setAfterSalesRequests] = useState<AfterSalesRequest[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [reportStart, setReportStart] = useState('')
  const [reportEnd, setReportEnd] = useState('')
  const [report, setReport] = useState<SalesReport | null>(null)
  const [reportBusy, setReportBusy] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [promotionType, setPromotionType] = useState<'percentage' | 'fixed'>('percentage')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    const [categoryResult, productResult, variantResult, orderResult, customerResult, reviewResult, afterSalesResult, promotionResult] = await Promise.all([
      supabase.from('categories').select('id,name,slug,active').order('name'),
      supabase.from('products').select('id,category_id,name,slug,description,price_cents,active').order('name'),
      supabase.from('product_variants').select('id,product_id,size,color,sku,stock_on_hand,active').order('sku'),
      supabase.from('orders').select('id,user_id,status,created_at,total_cents,shipping_address_snapshot').order('created_at', { ascending: false }).limit(100),
      supabase.rpc('admin_list_customers'),
      supabase.from('reviews').select('id,user_id,product_id,rating,comment,status,created_at').order('created_at', { ascending: false }),
      supabase.from('after_sales_requests').select('id,order_id,user_id,request_type,reason,status,admin_note,created_at,after_sales_request_items(order_item_id,quantity,replacement_variant_id,order_items(product_name,size,color))').order('created_at', { ascending: false }),
      supabase.from('promotions').select('id,product_id,discount_type,percentage,fixed_discount_cents,starts_at,ends_at,active').order('starts_at', { ascending: false }),
    ])
    const failure = categoryResult.error || productResult.error || variantResult.error || orderResult.error || customerResult.error || reviewResult.error || afterSalesResult.error || promotionResult.error
    if (failure) setError('Não foi possível carregar algumas informações administrativas. Confira a migração e suas permissões.')
    setCategories((categoryResult.data ?? []) as Category[])
    setProducts((productResult.data ?? []) as Product[])
    setVariants((variantResult.data ?? []) as Variant[])
    setOrders((orderResult.data ?? []) as Order[])
    setCustomers((customerResult.data ?? []) as Customer[])
    setReviews((reviewResult.data ?? []) as Review[])
    setAfterSalesRequests((afterSalesResult.data ?? []) as AfterSalesRequest[])
    setPromotions((promotionResult.data ?? []) as Promotion[])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  async function runAction(action: () => Promise<{ error: { message: string } | null }>, success: string) {
    setBusy(true); setError(''); setNotice('')
    const result = await action()
    setBusy(false)
    if (result.error) { setError(result.error.message || 'A operação não foi concluída.'); return false }
    setNotice(success)
    await refresh()
    return true
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const slug = slugify(String(data.get('slug') ?? '') || name)
    const editingId = editingCategory?.id
    const result = await runAction(async () => editingId
      ? supabase.from('categories').update({ name, slug }).eq('id', editingId)
      : supabase.from('categories').insert({ name, slug }), editingId ? 'Categoria atualizada.' : 'Categoria criada.')
    if (result) setEditingCategory(null)
    form.reset()
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const price = Number(data.get('price') ?? 0)
    const values = {
      category_id: String(data.get('category_id')), name,
      slug: slugify(String(data.get('slug') ?? '') || name),
      description: String(data.get('description') ?? '').trim(),
      price_cents: Math.round(price * 100),
    }
    const editingId = editingProduct?.id
    const result = await runAction(async () => editingId
      ? supabase.from('products').update(values).eq('id', editingId)
      : supabase.from('products').insert(values), editingId ? 'Produto atualizado.' : 'Produto criado.')
    if (result) setEditingProduct(null)
    form.reset()
  }

  async function saveVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    await runAction(async () => supabase.from('product_variants').insert({
      product_id: String(data.get('product_id')), size: String(data.get('size')).trim(),
      color: String(data.get('color')).trim(), sku: String(data.get('sku')).trim(),
      stock_on_hand: 0,
    }), 'Variação criada com estoque inicial zero.')
    form.reset()
  }

  async function savePromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const startLocal = String(data.get('starts_at') ?? '')
    const endLocal = String(data.get('ends_at') ?? '')
    if (!startLocal || !endLocal || startLocal >= endLocal) { setError('A data e hora inicial deve ser anterior à final.'); return }
    const discountType = String(data.get('discount_type')) as Promotion['discount_type']
    const formValues = {
      product_id: String(data.get('product_id')),
      discount_type: discountType,
      percentage: discountType === 'percentage' ? Number(data.get('percentage')) : null,
      fixed_discount_cents: discountType === 'fixed' ? Math.round(Number(data.get('fixed_amount')) * 100) : null,
      starts_at: new Date(startLocal).toISOString(),
      ends_at: new Date(endLocal).toISOString(),
    }
    const editingId = editingPromotion?.id
    const result = await runAction(async () => editingId
      ? supabase.from('promotions').update(formValues).eq('id', editingId)
      : supabase.from('promotions').insert(formValues), editingId ? 'Promoção atualizada.' : 'Promoção criada.')
    if (result) setEditingPromotion(null)
    form.reset()
  }

  function startPromotionEdit(promotion: Promotion) {
    setEditingPromotion(promotion)
    setPromotionType(promotion.discount_type)
  }

  async function changeStock(variant: Variant, raw: string) {
    const amount = Number(raw)
    if (!Number.isInteger(amount) || amount < 0) { setError('Informe um estoque inteiro igual ou maior que zero.'); return }
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc('admin_set_variant_stock', { p_variant_id: variant.id, p_stock_on_hand: amount })
      return { error: rpcError }
    }, `Estoque de ${variant.sku} atualizado.`)
  }

  async function transition(order: Order) {
    const status = nextStatus[order.status]
    if (!status) return
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc('admin_transition_order', { p_order_id: order.id, p_new_status: status })
      return { error: rpcError }
    }, `Pedido avançou para ${statusLabels[status]}.`)
  }

  async function moderateReview(review: Review, status: 'visible' | 'hidden') {
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc('admin_moderate_review', { p_review_id: review.id, p_status: status })
      return { error: rpcError }
    }, status === 'visible' ? 'Avaliação publicada.' : 'Avaliação ocultada.')
  }

  async function loadSalesReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(''); setNotice('')
    if (!reportStart || !reportEnd || reportStart > reportEnd) {
      setError('Informe datas válidas; a data inicial deve ser anterior ou igual à final.')
      return
    }
    setReportBusy(true)
    const { data, error: reportError } = await supabase.rpc('admin_sales_report', {
      p_start_date: reportStart,
      p_end_date: reportEnd,
    })
    setReportBusy(false)
    if (reportError) { setError('Não foi possível gerar o relatório para esse período.'); return }
    const rows = (data ?? []) as unknown as SalesReport[]
    setReport(rows[0] ?? { order_count: 0, product_net_cents: '0', shipping_cents: '0' })
  }

  async function processAfterSales(request: AfterSalesRequest, action: 'processing' | 'approve' | 'reject' | 'complete') {
    const needsNote = action === 'reject' || action === 'complete'
    const adminNote = window.prompt(
      action === 'complete' ? 'Confirme que recebeu e conferiu a peça. Registre uma observação:' : action === 'reject' ? 'Informe o motivo da recusa:' : 'Observação administrativa (opcional):',
      '',
    )
    if (adminNote === null) return
    if (needsNote && adminNote.trim().length < 5) { setError('Registre uma observação de pelo menos 5 caracteres.'); return }
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc('admin_process_after_sales_request', {
        p_request_id: request.id, p_action: action, p_admin_note: adminNote.trim() || null,
      })
      return { error: rpcError }
    }, action === 'complete' ? 'Retorno recebido e conferido; solicitação concluída.' : action === 'approve' ? 'Solicitação aprovada.' : action === 'reject' ? 'Solicitação recusada.' : 'Solicitação encaminhada para processamento.')
  }

  return (
    <section className="account-section admin-panel" aria-labelledby="admin-title">
      <div className="admin-heading">
        <div><p className="eyebrow">Operação</p><h3 id="admin-title">Painel administrativo</h3></div>
        <button className="address-action" type="button" onClick={() => void refresh()} disabled={loading || busy}>Atualizar dados</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-message" role="status">{notice}</p>}
      {loading ? <p className="muted-note" role="status">Carregando dados administrativos…</p> : <>
        <section className="admin-block" aria-labelledby="admin-catalog-title">
          <h4 id="admin-catalog-title">Catálogo e estoque</h4>
          <div className="admin-forms">
            <form className="auth-form admin-form" key={editingCategory?.id ?? 'new-category'} onSubmit={saveCategory}>
              <strong>{editingCategory ? `Editar ${editingCategory.name}` : 'Nova categoria'}</strong>
              <label className="field">Nome<input name="name" required minLength={2} maxLength={80} defaultValue={editingCategory?.name ?? ''} /></label>
              <label className="field">Slug (opcional)<input name="slug" maxLength={80} placeholder="gerado pelo nome" defaultValue={editingCategory?.slug ?? ''} /></label>
              <button className="primary-button" type="submit" disabled={busy}>{editingCategory ? 'Salvar categoria' : 'Criar categoria'}</button>
              {editingCategory && <button className="text-button" type="button" onClick={() => setEditingCategory(null)}>Cancelar edição</button>}
            </form>
            <form className="auth-form admin-form" key={editingProduct?.id ?? 'new-product'} onSubmit={saveProduct}>
              <strong>{editingProduct ? `Editar ${editingProduct.name}` : 'Novo produto'}</strong>
              <label className="field">Categoria<select name="category_id" required defaultValue={editingProduct?.category_id ?? ''}><option value="" disabled>Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="field">Nome<input name="name" required minLength={2} maxLength={120} defaultValue={editingProduct?.name ?? ''} /></label>
              <label className="field">Slug (opcional)<input name="slug" maxLength={120} placeholder="gerado pelo nome" defaultValue={editingProduct?.slug ?? ''} /></label>
              <label className="field">Preço em reais<input name="price" type="number" min="0" step="0.01" required defaultValue={editingProduct ? (editingProduct.price_cents / 100).toFixed(2) : ''} /></label>
              <label className="field">Descrição<textarea name="description" maxLength={4000} rows={3} defaultValue={editingProduct?.description ?? ''} /></label>
              <button className="primary-button" type="submit" disabled={busy || categories.length === 0}>{editingProduct ? 'Salvar produto' : 'Criar produto'}</button>
              {editingProduct && <button className="text-button" type="button" onClick={() => setEditingProduct(null)}>Cancelar edição</button>}
            </form>
            <form className="auth-form admin-form" onSubmit={saveVariant}>
              <strong>Nova variação</strong>
              <label className="field">Produto<select name="product_id" required defaultValue=""><option value="" disabled>Selecione</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
              <div className="field-grid"><label className="field">Tamanho<input name="size" required maxLength={30} /></label><label className="field">Cor<input name="color" required maxLength={50} /></label></div>
              <label className="field">SKU<input name="sku" required maxLength={64} /></label>
              <button className="primary-button" type="submit" disabled={busy || products.length === 0}>Criar variação</button>
            </form>
          </div>
          <div className="admin-entity-lists">
            <section aria-label="Categorias cadastradas"><h5>Categorias</h5>{categories.map((category) => <div className="admin-entity-row" key={category.id}><span>{category.name}{category.active ? '' : ' · inativa'}</span><button className="address-action" type="button" onClick={() => setEditingCategory(category)}>Editar</button><button className="address-action" type="button" disabled={busy} onClick={() => void runAction(async () => supabase.from('categories').update({ active: !category.active }).eq('id', category.id), category.active ? 'Categoria desativada.' : 'Categoria ativada.')}>{category.active ? 'Desativar' : 'Ativar'}</button></div>)}</section>
            <section aria-label="Produtos cadastrados"><h5>Produtos</h5>{products.map((product) => <div className="admin-entity-row" key={product.id}><span>{product.name}{product.active ? '' : ' · inativo'}</span><button className="address-action" type="button" onClick={() => setEditingProduct(product)}>Editar</button><button className="address-action" type="button" disabled={busy} onClick={() => void runAction(async () => supabase.from('products').update({ active: !product.active }).eq('id', product.id), product.active ? 'Produto desativado.' : 'Produto ativado.')}>{product.active ? 'Desativar' : 'Ativar'}</button></div>)}</section>
          </div>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Variações e saldo físico</caption><thead><tr><th>Produto</th><th>SKU</th><th>Tamanho / cor</th><th>Estoque físico</th><th>Disponibilidade</th><th>Ação</th></tr></thead><tbody>
            {variants.map((variant) => <tr key={variant.id}><td>{products.find((product) => product.id === variant.product_id)?.name ?? 'Produto'}</td><td>{variant.sku}</td><td>{variant.size} / {variant.color}</td><td>{variant.stock_on_hand}</td><td>{variant.active ? 'Ativa' : 'Inativa'}</td><td><form className="stock-edit" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('stock'); void changeStock(variant, String(value ?? '')) }}><label className="sr-only" htmlFor={`stock-${variant.id}`}>Novo estoque para {variant.sku}</label><input id={`stock-${variant.id}`} name="stock" type="number" min="0" step="1" defaultValue={variant.stock_on_hand} /><button className="address-action" type="submit" disabled={busy}>Salvar</button><button className="address-action" type="button" disabled={busy} onClick={() => void runAction(async () => supabase.from('product_variants').update({ active: !variant.active }).eq('id', variant.id), variant.active ? 'Variação desativada.' : 'Variação ativada.')}>{variant.active ? 'Desativar' : 'Ativar'}</button></form></td></tr>)}
            {variants.length === 0 && <tr><td colSpan={6}>Nenhuma variação cadastrada.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="admin-block" aria-labelledby="admin-orders-title">
          <h4 id="admin-orders-title">Pedidos</h4>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Até 100 pedidos mais recentes</caption><thead><tr><th>Pedido</th><th>Data</th><th>Status</th><th>Total</th><th>Atualização</th></tr></thead><tbody>
            {orders.map((order) => <tr key={order.id}><td><code>{order.id.slice(0, 8)}</code></td><td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(order.created_at))}</td><td>{statusLabels[order.status] ?? order.status}</td><td>{cents(order.total_cents)}</td><td>{nextStatus[order.status] ? <button className="address-action" type="button" onClick={() => void transition(order)} disabled={busy}>Avançar para {statusLabels[nextStatus[order.status]]}</button> : '—'}</td></tr>)}
            {orders.length === 0 && <tr><td colSpan={5}>Nenhum pedido cadastrado.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="admin-block" aria-labelledby="admin-after-sales-title">
          <h4 id="admin-after-sales-title">Solicitações de pós-venda</h4>
          <p className="muted-note">A loja paga o frete de retorno. Devolução/troca só repõe estoque após recebimento e conferência. Pagamentos permanecem simulados; não há estorno financeiro real.</p>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Solicitações dos clientes</caption><thead><tr><th>Pedido</th><th>Cliente</th><th>Tipo / situação</th><th>Motivo e detalhes</th><th>Observação</th><th>Ação</th></tr></thead><tbody>
            {afterSalesRequests.map((request) => {
              const nextActions: ('processing' | 'approve' | 'reject' | 'complete')[] = request.status === 'submitted'
                ? request.request_type === 'cancellation' ? ['approve', 'reject'] : ['processing']
                : request.status === 'processing'
                  ? request.request_type === 'regret' ? ['complete'] : request.request_type === 'exchange' ? ['approve', 'reject'] : []
                  : request.status === 'approved' && request.request_type === 'exchange' ? ['complete'] : []
              const labels: Record<string, string> = { processing: 'Iniciar processamento', approve: request.request_type === 'cancellation' ? 'Aprovar e cancelar' : 'Aprovar troca', reject: 'Recusar', complete: 'Concluir após receber e conferir' }
              return <tr key={request.id}><td><code>{request.order_id.slice(0, 8)}</code></td><td>{customers.find((customer) => customer.user_id === request.user_id)?.email ?? 'Conta'}</td><td>{({ cancellation: 'Cancelamento', regret: 'Arrependimento / devolução', exchange: 'Troca' } as const)[request.request_type]} · {({ submitted: 'Recebida', processing: 'Em processamento', approved: 'Aprovada', rejected: 'Recusada', completed: 'Concluída' } as Record<string, string>)[request.status] ?? request.status}</td><td>{request.reason ?? 'Sem justificativa (arrependimento legal)'}{request.after_sales_request_items.map((line) => { const replacement = line.replacement_variant_id ? variants.find((variant) => variant.id === line.replacement_variant_id) : undefined; const original = Array.isArray(line.order_items) ? line.order_items[0] : line.order_items; return <p key={line.order_item_id}>{line.quantity} un. · {original?.product_name} ({original?.size}/{original?.color}){replacement && <> → reposição {replacement.size}/{replacement.color} · {replacement.sku}</>}</p> })}</td><td>{request.admin_note ?? '—'}</td><td>{nextActions.map((action) => <button key={action} className="address-action" type="button" disabled={busy} onClick={() => void processAfterSales(request, action)}>{labels[action]}</button>)}</td></tr>
            })}
            {afterSalesRequests.length === 0 && <tr><td colSpan={6}>Nenhuma solicitação recebida.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="admin-block" aria-labelledby="admin-users-title">
          <h4 id="admin-users-title">Contas cadastradas</h4>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Lista de clientes e administradores, sem alteração de permissões</caption><thead><tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Cadastro</th></tr></thead><tbody>
            {customers.map((customer) => <tr key={customer.user_id}><td>{customer.full_name}</td><td>{customer.email}</td><td>{customer.role === 'admin' ? 'Administrador' : 'Cliente'}</td><td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(customer.created_at))}</td></tr>)}
            {customers.length === 0 && <tr><td colSpan={4}>Nenhuma conta cadastrada.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="admin-block" aria-labelledby="admin-reviews-title">
          <h4 id="admin-reviews-title">Moderação de avaliações</h4>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Novas avaliações começam ocultas e só ficam públicas após aprovação</caption><thead><tr><th>Produto</th><th>Cliente</th><th>Nota</th><th>Comentário</th><th>Estado</th><th>Ação</th></tr></thead><tbody>
            {reviews.map((review) => <tr key={review.id}><td>{products.find((product) => product.id === review.product_id)?.name ?? 'Produto removido'}</td><td>{customers.find((customer) => customer.user_id === review.user_id)?.email ?? 'Conta'}</td><td>{review.rating}/5</td><td className="admin-review-comment">{review.comment}</td><td>{review.status === 'visible' ? 'Publicada' : 'Oculta'}</td><td><button className="address-action" type="button" disabled={busy || review.status === 'visible'} onClick={() => void moderateReview(review, 'visible')}>Aprovar</button> <button className="address-action" type="button" disabled={busy || review.status === 'hidden'} onClick={() => void moderateReview(review, 'hidden')}>Ocultar</button></td></tr>)}
            {reviews.length === 0 && <tr><td colSpan={6}>Nenhuma avaliação recebida.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="admin-block" aria-labelledby="admin-sales-title">
          <h4 id="admin-sales-title">Relatório de vendas</h4>
          <p className="muted-note">Período baseado na data de aprovação do pagamento, no fuso de Brasília (America/Sao_Paulo). Pedidos cancelados não entram; frete aparece separado.</p>
          <form className="sales-report-form" onSubmit={(event) => void loadSalesReport(event)}>
            <label className="field" htmlFor="report-start">Data inicial<input id="report-start" type="date" required value={reportStart} onChange={(event) => setReportStart(event.currentTarget.value)} /></label>
            <label className="field" htmlFor="report-end">Data final<input id="report-end" type="date" required value={reportEnd} onChange={(event) => setReportEnd(event.currentTarget.value)} /></label>
            <button className="primary-button" type="submit" disabled={reportBusy}>{reportBusy ? 'Consultando…' : 'Gerar relatório'}</button>
          </form>
          {report && <dl className="sales-report-results" aria-live="polite">
            <div><dt>Pedidos aprovados não cancelados</dt><dd>{new Intl.NumberFormat('pt-BR').format(Number(report.order_count))}</dd></div>
            <div><dt>Produtos líquidos de descontos</dt><dd>{cents(report.product_net_cents)}</dd></div>
            <div><dt>Frete total</dt><dd>{cents(report.shipping_cents)}</dd></div>
          </dl>}
        </section>
        <section className="admin-block" aria-labelledby="admin-promotions-title">
          <h4 id="admin-promotions-title">Promoções de produtos</h4>
          <p className="muted-note">Promoções usam o horário local deste navegador. Só vale o maior desconto; em empate, vence a que começou mais recentemente. Descontos não se acumulam.</p>
          <form className="auth-form promotion-form" key={editingPromotion?.id ?? 'new-promotion'} onSubmit={savePromotion}>
            <strong>{editingPromotion ? 'Editar promoção' : 'Nova promoção'}</strong>
            <label className="field">Produto<select name={editingPromotion ? undefined : 'product_id'} required disabled={Boolean(editingPromotion)} defaultValue={editingPromotion?.product_id ?? ''}><option value="" disabled>Selecione um produto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>{editingPromotion && <small>Para outro produto, crie uma nova promoção.</small>}</label>
            <label className="field">Tipo de desconto<select name="discount_type" value={promotionType} onChange={(event) => setPromotionType(event.currentTarget.value as Promotion['discount_type'])}><option value="percentage">Percentual</option><option value="fixed">Valor fixo em reais</option></select></label>
            {promotionType === 'percentage'
              ? <label className="field">Percentual<input name="percentage" type="number" min="0.01" max="100" step="0.01" required defaultValue={editingPromotion?.discount_type === 'percentage' ? editingPromotion.percentage ?? '' : ''} /></label>
              : <label className="field">Desconto em reais<input name="fixed_amount" type="number" min="0.01" step="0.01" required defaultValue={editingPromotion?.discount_type === 'fixed' ? ((editingPromotion.fixed_discount_cents ?? 0) / 100).toFixed(2) : ''} /></label>}
            <div className="field-grid"><label className="field">Início<input name="starts_at" type="datetime-local" required defaultValue={editingPromotion ? localDateTimeInput(editingPromotion.starts_at) : ''} /></label><label className="field">Término<input name="ends_at" type="datetime-local" required defaultValue={editingPromotion ? localDateTimeInput(editingPromotion.ends_at) : ''} /></label></div>
            <button className="primary-button" type="submit" disabled={busy || products.length === 0}>{editingPromotion ? 'Salvar promoção' : 'Criar promoção'}</button>
            {editingPromotion && <button className="text-button" type="button" onClick={() => setEditingPromotion(null)}>Cancelar edição</button>}
          </form>
          <div className="admin-table-wrap"><table className="admin-table"><caption>Promoções cadastradas</caption><thead><tr><th>Produto</th><th>Desconto</th><th>Período</th><th>Estado</th><th>Ações</th></tr></thead><tbody>
            {promotions.map((promotion) => <tr key={promotion.id}><td>{products.find((product) => product.id === promotion.product_id)?.name ?? 'Produto'}</td><td>{promotion.discount_type === 'percentage' ? `${promotion.percentage}%` : cents(promotion.fixed_discount_cents ?? 0)}</td><td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(promotion.starts_at))} – {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(promotion.ends_at))}</td><td>{promotion.active ? 'Ativa' : 'Inativa'}</td><td><button className="address-action" type="button" onClick={() => startPromotionEdit(promotion)}>Editar</button> <button className="address-action" type="button" disabled={busy} onClick={() => void runAction(async () => supabase.from('promotions').update({ active: !promotion.active }).eq('id', promotion.id), promotion.active ? 'Promoção desativada.' : 'Promoção ativada.')}>{promotion.active ? 'Desativar' : 'Ativar'}</button></td></tr>)}
            {promotions.length === 0 && <tr><td colSpan={5}>Nenhuma promoção cadastrada.</td></tr>}
          </tbody></table></div>
        </section>
      </>}
    </section>
  )
}
