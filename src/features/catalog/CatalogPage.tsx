import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import './CatalogPage.css'

type Category = { id: string; name: string; slug: string }
type ProductImage = { image_path: string; alt_text: string; position: number }
type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price_cents: string | number
  categories: Category | null
  product_images: ProductImage[]
}
type ProductVariant = {
  id: string
  product_id: string
  size: string
  color: string
  available: boolean
}
type ProductPrice = { product_id: string; list_price_cents: string | number; discount_cents: string | number; final_price_cents: string | number; promotion_id: string | null }
type ProductReview = { id: string; rating: number; comment: string; created_at: string }
type SavedAddress = { id: string; recipient_name: string; postal_code: string; city: string; state: string; is_default: boolean }
type CartLine = { variantId: string; quantity: number; size: string; color: string; productName: string; priceCents: string | number; listPriceCents: string | number; discountCents: string | number; imagePath: string }
type CheckoutOrder = { id: string; subtotalCents: string; discountCents: string; shippingCents: string; totalCents: string; expiresAt: string; deliveryAddress: string }
type PaymentResult = { outcome: 'approved' | 'declined'; reason: string | null; status: string }

const placeholderImage = '/products/placeholder.svg'

function parsePriceCents(value: string): bigint | null {
  const normalized = value.trim()
  if (!normalized) return null
  const match = normalized.match(/^(\d+)(?:\.(\d{0,2}))?$/)
  if (!match) return null
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'))
}

function formatPrice(value: string | number | bigint): string {
  const cents = BigInt(value)
  const wholeReais = cents / 100n
  const centsPart = (cents % 100n).toString().padStart(2, '0')
  return `R$ ${new Intl.NumberFormat('pt-BR').format(wholeReais)},${centsPart}`
}

function CatalogPage({ onAccount }: { onAccount: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([])
  const [productReviews, setProductReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [minimumPrice, setMinimumPrice] = useState('')
  const [maximumPrice, setMaximumPrice] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartId, setCartId] = useState<string | null>(null)
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [shippingCents, setShippingCents] = useState<number | null>(null)
  const [cartBusy, setCartBusy] = useState(false)
  const [cartError, setCartError] = useState('')
  const [cartNotice, setCartNotice] = useState('')
  const [checkoutOrder, setCheckoutOrder] = useState<CheckoutOrder | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  const loadCart = useCallback(async (currentUser: User) => {
    setCartBusy(true)
    setCartError('')
    const [cartResult, addressResult] = await Promise.all([
      supabase.rpc('ensure_cart'),
      supabase.from('addresses').select('id,recipient_name,postal_code,city,state,is_default').eq('user_id', currentUser.id).order('is_default', { ascending: false }).order('created_at'),
    ])
    if (cartResult.error || addressResult.error || !cartResult.data) {
      setCartError('Não foi possível carregar seu carrinho e endereços.')
      setCartBusy(false)
      return
    }
    const activeCartId = cartResult.data as string
    setCartId(activeCartId)
    const savedAddresses = (addressResult.data ?? []) as SavedAddress[]
    setAddresses(savedAddresses)
    const activeAddressId = savedAddresses.some((address) => address.id === selectedAddressId)
      ? selectedAddressId
      : (savedAddresses.find((address) => address.is_default)?.id ?? savedAddresses[0]?.id ?? '')
    setSelectedAddressId(activeAddressId)
    if (activeAddressId) {
      const shippingResult = await supabase.rpc('calculate_shipping_cents', { p_address_id: activeAddressId })
      if (shippingResult.error) { setShippingCents(null); setCartError('Não foi possível calcular o frete para este endereço.') }
      else setShippingCents(Number(shippingResult.data))
    } else setShippingCents(null)

    const itemsResult = await supabase.from('cart_items').select('variant_id,quantity').eq('cart_id', activeCartId)
    if (itemsResult.error) {
      setCartError('Não foi possível carregar os itens do carrinho.')
      setCartBusy(false)
      return
    }
    const items = itemsResult.data ?? []
    if (items.length === 0) {
      setCartLines([])
      setCartBusy(false)
      return
    }
    const ids = items.map((item) => item.variant_id)
    const variantResult = await supabase.from('catalog_product_variants').select('id,product_id,size,color').in('id', ids)
    const productIds = [...new Set((variantResult.data ?? []).map((variant) => variant.product_id))]
    const [productResult, priceResult] = productIds.length ? await Promise.all([
      supabase.from('products').select('id,name,price_cents,product_images(image_path,position)').in('id', productIds),
      supabase.from('catalog_product_prices').select('product_id,list_price_cents,discount_cents,final_price_cents,promotion_id').in('product_id', productIds),
    ]) : [{ data: [], error: null }, { data: [], error: null }]
    if (variantResult.error || productResult.error || priceResult.error) {
      setCartError('Não foi possível carregar os detalhes dos itens.')
      setCartBusy(false)
      return
    }
    const productMap = new Map((productResult.data ?? []).map((product) => [product.id, product]))
    const priceMap = new Map(((priceResult.data ?? []) as ProductPrice[]).map((price) => [price.product_id, price]))
    const variantMap = new Map((variantResult.data ?? []).map((variant) => [variant.id, variant]))
    setCartLines(items.flatMap((item) => {
      const variant = variantMap.get(item.variant_id)
      const product = variant ? productMap.get(variant.product_id) : undefined
      if (!variant || !product) return []
      const images = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)
      const price = priceMap.get(product.id)
      return [{ variantId: item.variant_id, quantity: item.quantity, size: variant.size, color: variant.color, productName: product.name, priceCents: price?.final_price_cents ?? product.price_cents, listPriceCents: price?.list_price_cents ?? product.price_cents, discountCents: price?.discount_cents ?? 0, imagePath: images[0]?.image_path ?? placeholderImage }]
    }))
    setCartBusy(false)
  }, [selectedAddressId])

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => { if (active) setUser(data.user) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setCartId(null); setCartLines([]); setAddresses([]); setShippingCents(null) }
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!selectedProductId) return
    let active = true
    const timer = window.setTimeout(() => {
      void supabase.from('reviews').select('id,rating,comment,created_at')
        .eq('product_id', selectedProductId).eq('status', 'visible')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (active && !error) setProductReviews((data ?? []) as ProductReview[])
        })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [selectedProductId])

  async function openCart() {
    if (!user) { onAccount(); return }
    setCartOpen(true)
    await loadCart(user)
  }

  async function changeCartAddress(addressId: string) {
    setSelectedAddressId(addressId)
    setCartError('')
    if (!addressId) { setShippingCents(null); return }
    const { data, error } = await supabase.rpc('calculate_shipping_cents', { p_address_id: addressId })
    if (error) { setShippingCents(null); setCartError('Não foi possível calcular o frete para este endereço.') }
    else setShippingCents(Number(data))
  }

  const cartSubtotal = cartLines.reduce((total, line) => total + BigInt(line.listPriceCents) * BigInt(line.quantity), 0n)
  const cartDiscount = cartLines.reduce((total, line) => total + BigInt(line.discountCents) * BigInt(line.quantity), 0n)
  const cartNetSubtotal = cartSubtotal - cartDiscount

  useEffect(() => {
    let active = true
    async function loadCatalog() {
      const [categoryResult, productResult, variantResult, priceResult] = await Promise.all([
        supabase.from('categories').select('id,name,slug').order('name'),
        supabase
          .from('products')
          .select('id,category_id,name,slug,description,price_cents,categories(id,name,slug),product_images(image_path,alt_text,position)')
          .order('name'),
        supabase
          .from('catalog_product_variants')
          .select('id,product_id,size,color,available'),
        supabase.from('catalog_product_prices').select('product_id,list_price_cents,discount_cents,final_price_cents,promotion_id'),
      ])

      if (!active) return
      if (categoryResult.error || productResult.error || variantResult.error || priceResult.error) {
        setLoadError('Não foi possível carregar o catálogo. Tente novamente em instantes.')
      } else {
        setCategories((categoryResult.data ?? []) as unknown as Category[])
        setProducts((productResult.data ?? []) as unknown as Product[])
        setVariants((variantResult.data ?? []) as unknown as ProductVariant[])
        setProductPrices((priceResult.data ?? []) as ProductPrice[])
      }
      setLoading(false)
    }

    void loadCatalog()
    return () => { active = false }
  }, [])

  const variantsByProduct = useMemo(() => {
    const result = new Map<string, ProductVariant[]>()
    for (const variant of variants) {
      const list = result.get(variant.product_id) ?? []
      list.push(variant)
      result.set(variant.product_id, list)
    }
    return result
  }, [variants])

  const priceByProduct = useMemo(() => new Map(productPrices.map((price) => [price.product_id, price])), [productPrices])

  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => variant.size))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })),
    [variants],
  )
  const colors = useMemo(
    () => [...new Set(variants.map((variant) => variant.color))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [variants],
  )
  const minCents = parsePriceCents(minimumPrice)
  const maxCents = parsePriceCents(maximumPrice)

  const filteredProducts = useMemo(() => products.filter((product) => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (query && !`${product.name} ${product.description}`.toLocaleLowerCase('pt-BR').includes(query)) return false
    if (categoryId && product.category_id !== categoryId) return false
    const productVariants = variantsByProduct.get(product.id) ?? []
    if ((size || color) && !productVariants.some((variant) =>
      (!size || variant.size === size) && (!color || variant.color === color),
    )) return false
    const price = BigInt(priceByProduct.get(product.id)?.final_price_cents ?? product.price_cents)
    if (minCents !== null && price < minCents) return false
    if (maxCents !== null && price > maxCents) return false
    return true
  }), [categoryId, color, maxCents, minCents, products, search, size, variantsByProduct, priceByProduct])

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null
  const selectedVariants = selectedProduct ? variantsByProduct.get(selectedProduct.id) ?? [] : []
  const selectedVariant = selectedVariants.find((variant) => variant.id === selectedVariantId) ?? null

  function clearFilters() {
    setSearch('')
    setCategoryId('')
    setSize('')
    setColor('')
    setMinimumPrice('')
    setMaximumPrice('')
  }

  function openProduct(productId: string) {
    setSelectedProductId(productId)
    setSelectedVariantId(null)
    setProductReviews([])
  }

  function returnToCatalog() {
    setSelectedProductId(null)
    setSelectedVariantId(null)
  }

  async function addSelectedToCart() {
    if (!selectedVariant || !user) { onAccount(); return }
    setCartBusy(true); setCartError(''); setCartNotice('')
    const { error } = await supabase.rpc('add_cart_item', { p_variant_id: selectedVariant.id, p_quantity: 1 })
    if (error) setCartError(error.message.includes('indisponível') ? 'Esta variação acabou de ficar indisponível.' : 'Não foi possível adicionar o produto ao carrinho.')
    else { setCartNotice('Produto adicionado ao carrinho.'); await loadCart(user) }
    setCartBusy(false)
  }

  async function changeQuantity(line: CartLine, quantity: number) {
    if (!cartId || !user) return
    setCartBusy(true); setCartError('')
    if (quantity < 1) {
      const { error } = await supabase.rpc('remove_cart_item', { p_variant_id: line.variantId })
      if (error) setCartError('Não foi possível remover este item.')
    } else {
      const { error } = await supabase.rpc('set_cart_item_quantity', { p_variant_id: line.variantId, p_quantity: quantity })
      if (error) setCartError('Não foi possível atualizar a quantidade.')
    }
    await loadCart(user)
  }

  async function startCheckout() {
    if (!user) { onAccount(); return }
    if (!selectedAddressId) { setCartError('Cadastre ou selecione um endereço para continuar.'); return }
    setCartBusy(true); setCartError(''); setCartNotice('')
    const { data, error } = await supabase.rpc('create_order_from_cart', { p_address_id: selectedAddressId })
    if (error) {
      setCartError(error.message.includes('Estoque insuficiente')
        ? 'O estoque mudou antes da finalização. Atualize o carrinho e tente novamente.'
        : 'Não foi possível iniciar o pedido. Confira o endereço e tente novamente.')
      setCartBusy(false)
      return
    }
    const order = (data ?? [])[0] as { created_order_id: string; subtotal_cents: string; discount_cents: string; shipping_cents: string; total_cents: string; reservation_expires_at: string; delivery_address: string } | undefined
    if (!order) {
      setCartError('O sistema não retornou os dados do pedido. Tente novamente.')
      setCartBusy(false)
      return
    }
    setCheckoutOrder({ id: order.created_order_id, subtotalCents: order.subtotal_cents, discountCents: order.discount_cents, shippingCents: order.shipping_cents, totalCents: order.total_cents, expiresAt: order.reservation_expires_at, deliveryAddress: order.delivery_address })
    setPaymentResult(null)
    setCartBusy(false)
  }

  async function submitSimulatedPayment(decision: 'approved' | 'declined') {
    if (!user || !checkoutOrder) return
    setCartBusy(true); setCartError('')
    const { data, error } = await supabase.rpc('process_simulated_payment', { p_order_id: checkoutOrder.id, p_decision: decision })
    if (error) {
      setCartError('Não foi possível processar o pagamento simulado. Atualize o carrinho e tente novamente.')
      setCartBusy(false)
      return
    }
    const result = (data ?? [])[0] as { result_outcome: 'approved' | 'declined'; result_reason: string | null; result_status: string } | undefined
    if (!result) {
      setCartError('O sistema não retornou o resultado do pagamento. Tente novamente.')
      setCartBusy(false)
      return
    }
    setPaymentResult({ outcome: result.result_outcome, reason: result.result_reason, status: result.result_status })
    if (result.result_outcome === 'approved') await loadCart(user)
    else setCartBusy(false)
  }

  async function retryCheckout() {
    setCheckoutOrder(null)
    setPaymentResult(null)
    await startCheckout()
  }

  return (
    <main className="catalog-shell">
      <header className="catalog-header">
        <a className="catalog-brand" href="/" aria-label="Loja Online, início">LOJA ONLINE</a>
        <nav className="catalog-navigation" aria-label="Navegação principal">
          <a href="#catalog-content">Produtos</a>
          <button type="button" onClick={() => void openCart()}>Carrinho{cartLines.length > 0 ? ` (${cartLines.reduce((total, line) => total + line.quantity, 0)})` : ''}</button>
          <button type="button" onClick={onAccount}>Minha conta</button>
        </nav>
      </header>

      <section className="catalog-hero" aria-labelledby="catalog-title">
        <p className="catalog-eyebrow">Coleção essencial</p>
        <h1 id="catalog-title">Vista o seu momento.</h1>
        <p>Peças para acompanhar a sua rotina, escolhidas com cuidado.</p>
      </section>

      <section id="catalog-content" className="catalog-content" aria-label="Produtos da loja">
        {selectedProduct ? (
          <>
            <button className="catalog-back" type="button" onClick={returnToCatalog}>← Voltar ao catálogo</button>
            <article className="product-detail">
              <div className="detail-image-wrap">
                <img
                  className="detail-image"
                  src={selectedProduct.product_images?.[0]?.image_path ?? placeholderImage}
                  alt={selectedProduct.product_images?.[0]?.alt_text ?? `Imagem ilustrativa de ${selectedProduct.name}`}
                />
              </div>
              <div className="detail-copy">
                <p className="catalog-eyebrow">{selectedProduct.categories?.name ?? 'Produto'}</p>
                <h2>{selectedProduct.name}</h2>
                {(() => { const price = priceByProduct.get(selectedProduct.id); return <p className="detail-price">{price && BigInt(price.discount_cents) > 0n && <><del>{formatPrice(price.list_price_cents)}</del> <span className="promotion-badge">Oferta</span><br /></>}{formatPrice(price?.final_price_cents ?? selectedProduct.price_cents)}</p> })()}
                <p className="detail-description">{selectedProduct.description || 'Uma peça escolhida para fazer parte da sua rotina.'}</p>
                <h3>Escolha uma variação</h3>
                <div className="variant-options" role="group" aria-label="Tamanho e cor disponíveis">
                  {selectedVariants.map((variant) => (
                    <button
                      className={`variant-option${selectedVariantId === variant.id ? ' is-selected' : ''}`}
                      key={variant.id}
                      type="button"
                      aria-pressed={selectedVariantId === variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      <span>{variant.size} · {variant.color}</span>
                      <small>{variant.available ? 'Disponível' : 'Indisponível'}</small>
                    </button>
                  ))}
                  {!selectedVariants.length && <p className="catalog-note">Nenhuma variação cadastrada.</p>}
                </div>
                {selectedVariant && (
                  <p className={selectedVariant.available ? 'availability available' : 'availability unavailable'} role="status">
                    {selectedVariant.available ? 'Esta variação está disponível.' : 'Esta variação está indisponível no momento.'}
                  </p>
                )}
                <button className="cart-primary-button" type="button" disabled={!selectedVariant?.available || cartBusy} onClick={() => void addSelectedToCart()}>
                  {user ? 'Adicionar ao carrinho' : 'Entre para comprar'}
                </button>
                {cartNotice && <p className="cart-notice" role="status">{cartNotice}</p>}
                {cartError && <p className="catalog-error" role="alert">{cartError}</p>}
              </div>
            </article>
            <section className="product-reviews" aria-labelledby="product-reviews-title">
              <h3 id="product-reviews-title">Avaliações de clientes</h3>
              {productReviews.length ? <ul>{productReviews.map((review) => <li key={review.id}><p className="product-review-stars" aria-label={`${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><p>{review.comment}</p><time dateTime={review.created_at}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(review.created_at))}</time></li>)}</ul> : <p className="catalog-note">Este produto ainda não tem avaliações publicadas.</p>}
            </section>
          </>
        ) : (
          <>
            <div className="catalog-section-heading">
              <div>
                <p className="catalog-eyebrow">Encontre a sua peça</p>
                <h2>Produtos</h2>
              </div>
              <span className="result-count" aria-live="polite">{loading ? 'Carregando…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto' : 'produtos'}`}</span>
            </div>

            <form className="catalog-filters" onSubmit={(event) => event.preventDefault()} aria-label="Filtros do catálogo">
              <label className="catalog-field search-field" htmlFor="catalog-search">Buscar
                <input id="catalog-search" type="search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Nome do produto" />
              </label>
              <label className="catalog-field" htmlFor="filter-category">Categoria
                <select id="filter-category" value={categoryId} onChange={(event) => setCategoryId(event.currentTarget.value)}>
                  <option value="">Todas</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="catalog-field" htmlFor="filter-size">Tamanho
                <select id="filter-size" value={size} onChange={(event) => setSize(event.currentTarget.value)}>
                  <option value="">Todos</option>
                  {sizes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="catalog-field" htmlFor="filter-color">Cor
                <select id="filter-color" value={color} onChange={(event) => setColor(event.currentTarget.value)}>
                  <option value="">Todas</option>
                  {colors.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="catalog-field" htmlFor="filter-min-price">Preço mínimo
                <input id="filter-min-price" type="number" min="0" step="0.01" inputMode="decimal" value={minimumPrice} onChange={(event) => setMinimumPrice(event.currentTarget.value)} placeholder="R$ 0,00" />
              </label>
              <label className="catalog-field" htmlFor="filter-max-price">Preço máximo
                <input id="filter-max-price" type="number" min="0" step="0.01" inputMode="decimal" value={maximumPrice} onChange={(event) => setMaximumPrice(event.currentTarget.value)} placeholder="Sem limite" />
              </label>
              <button className="clear-filters" type="button" onClick={clearFilters}>Limpar filtros</button>
            </form>

            {loadError && <p className="catalog-error" role="alert">{loadError}</p>}
            {!loading && !loadError && filteredProducts.length === 0 && (
              <div className="catalog-empty">
                <h3>Nenhum produto encontrado</h3>
                <p>Tente alterar os filtros ou fazer uma nova busca.</p>
                <button type="button" className="clear-filters" onClick={clearFilters}>Limpar filtros</button>
              </div>
            )}

            <div className="product-grid">
              {filteredProducts.map((product) => {
                const productVariants = variantsByProduct.get(product.id) ?? []
                const available = productVariants.some((variant) => variant.available)
                const image = product.product_images?.[0]
                return (
                  <article className="product-card" key={product.id}>
                    <button className="product-card-open" type="button" onClick={() => openProduct(product.id)} aria-label={`Ver detalhes de ${product.name}`}>
                      <span className="product-image-wrap">
                        <img src={image?.image_path ?? placeholderImage} alt={image?.alt_text ?? `Imagem ilustrativa de ${product.name}`} loading="lazy" />
                        <span className="product-availability">{available ? 'Disponível' : 'Indisponível'}</span>
                      </span>
                      <span className="product-card-copy">
                        <span className="product-category">{product.categories?.name ?? 'Produto'}</span>
                        <span className="product-name">{product.name}</span>
                        <span className="product-price">{priceByProduct.get(product.id) && BigInt(priceByProduct.get(product.id)!.discount_cents) > 0n && <><del>{formatPrice(priceByProduct.get(product.id)!.list_price_cents)}</del> <span className="promotion-badge">Oferta</span><br /></>}{formatPrice(priceByProduct.get(product.id)?.final_price_cents ?? product.price_cents)}</span>
                        <span className="product-variants-count">{productVariants.length} {productVariants.length === 1 ? 'variação' : 'variações'}</span>
                      </span>
                    </button>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      {cartOpen && (
        <div className="cart-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}>
          <section className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="cart-panel-heading"><h2 id="cart-title">Seu carrinho</h2><button type="button" className="cart-close" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho">×</button></div>
            {cartBusy && <p role="status">Atualizando carrinho…</p>}
            {cartError && <p className="catalog-error" role="alert">{cartError}</p>}
            {!cartBusy && cartLines.length === 0 && <p className="catalog-note">Seu carrinho está vazio.</p>}
            <div className="cart-lines">
              {cartLines.map((line) => (
                <article className="cart-line" key={line.variantId}>
                  <img src={line.imagePath} alt="" />
                  <div className="cart-line-details"><h3>{line.productName}</h3><p>{line.size} · {line.color}</p>{BigInt(line.discountCents) > 0n && <del className="cart-price-was">{formatPrice(line.listPriceCents)}</del>}<strong>{formatPrice(line.priceCents)}</strong>
                    <div className="cart-quantity"><button type="button" aria-label={`Diminuir quantidade de ${line.productName}`} onClick={() => void changeQuantity(line, line.quantity - 1)}>−</button><span>{line.quantity}</span><button type="button" aria-label={`Aumentar quantidade de ${line.productName}`} onClick={() => void changeQuantity(line, line.quantity + 1)}>+</button><button className="cart-remove" type="button" onClick={() => void changeQuantity(line, 0)}>Remover</button></div>
                  </div>
                  <strong>{formatPrice(BigInt(line.priceCents) * BigInt(line.quantity))}</strong>
                </article>
              ))}
            </div>
            {checkoutOrder && (
              <section className="checkout-flow" aria-labelledby="checkout-flow-title">
                <h3 id="checkout-flow-title">Pagamento simulado</h3>
                <p>Pedido {checkoutOrder.id.slice(0, 8)} · vence em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(checkoutOrder.expiresAt))}</p>
                <p>Entrega: {checkoutOrder.deliveryAddress}</p>
                <div className="cart-totals checkout-totals"><p><span>Subtotal</span><strong>{formatPrice(checkoutOrder.subtotalCents)}</strong></p><p><span>Desconto</span><strong>− {formatPrice(checkoutOrder.discountCents)}</strong></p><p><span>Frete</span><strong>{formatPrice(checkoutOrder.shippingCents)}</strong></p><p className="cart-grand-total"><span>Total</span><strong>{formatPrice(checkoutOrder.totalCents)}</strong></p></div>
                {cartBusy && <p role="status">Processando…</p>}
                {!paymentResult && <>
                  <p>Escolha o resultado da demonstração:</p>
                  <div className="payment-choice-buttons">
                    <button type="button" className="cart-primary-button" disabled={cartBusy} onClick={() => void submitSimulatedPayment('approved')}>Simular pagamento aprovado</button>
                    <button type="button" className="payment-decline-button" disabled={cartBusy} onClick={() => void submitSimulatedPayment('declined')}>Simular pagamento recusado</button>
                  </div>
                  <p className="catalog-note">O estoque fica retido por até 15 minutos. Se a reserva vencer, a aprovação será recusada.</p>
                </>}
                {paymentResult?.outcome === 'approved' && <div className="payment-result payment-approved" role="status"><h4>Pagamento aprovado</h4><p>Pedido realizado com sucesso. O estoque foi confirmado e o carrinho atualizado.</p><button type="button" className="payment-repeat-button" disabled={cartBusy} onClick={() => void submitSimulatedPayment('approved')}>Conferir o resultado novamente</button><button type="button" className="cart-primary-button" onClick={() => { setCartOpen(false); setCheckoutOrder(null); setPaymentResult(null) }}>Continuar comprando</button></div>}
                {paymentResult?.outcome === 'declined' && <div className="payment-result payment-declined" role="alert"><h4>Pagamento recusado</h4><p>{paymentResult.reason}</p><p>O estoque foi liberado. Os itens continuam no carrinho.</p><button type="button" className="payment-repeat-button" disabled={cartBusy} onClick={() => void submitSimulatedPayment('declined')}>Conferir o resultado novamente</button><button type="button" className="cart-primary-button" disabled={cartBusy || cartLines.length === 0} onClick={() => void retryCheckout()}>Tentar novamente</button></div>}
              </section>
            )}
            {cartLines.length > 0 && !checkoutOrder && <>
              <label className="catalog-field cart-address" htmlFor="cart-address">Endereço de entrega
                {addresses.length ? <select id="cart-address" value={selectedAddressId} onChange={(event) => void changeCartAddress(event.currentTarget.value)}>{addresses.map((address) => <option key={address.id} value={address.id}>{address.recipient_name} · {address.postal_code} · {address.city}/{address.state}</option>)}</select> : <button type="button" className="clear-filters" onClick={onAccount}>Cadastre um endereço na sua conta</button>}
              </label>
              <div className="cart-totals"><p><span>Subtotal</span><strong>{formatPrice(cartSubtotal)}</strong></p><p><span>Desconto</span><strong>− {formatPrice(cartDiscount)}</strong></p><p><span>Frete</span><strong>{shippingCents === null ? '—' : formatPrice(shippingCents)}</strong></p><p className="cart-grand-total"><span>Total</span><strong>{formatPrice(cartNetSubtotal + BigInt(shippingCents ?? 0))}</strong></p></div>
              <p className="catalog-note">Frete fixo por região conforme UF do endereço. O carrinho não reserva estoque; a disponibilidade será validada na finalização do pedido.</p>
              <button className="cart-primary-button checkout-start-button" type="button" disabled={cartBusy || !addresses.length || shippingCents === null} onClick={() => void startCheckout()}>{cartBusy ? 'Validando pedido…' : 'Finalizar compra'}</button>
            </>}
          </section>
        </div>
      )}

      <footer className="catalog-footer">Loja Online · moda para acompanhar você</footer>
    </main>
  )
}

export default CatalogPage
