import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { LISTING_DURATION_MS } from './data/market'
import type { MarketItemKind } from './data/market'

const PLAYER_ID_KEY = 'cozy-valley-player-id'
const PLAYER_NAME_KEY = 'cozy-valley-player-name'

export interface MarketListing {
  id: string
  seller_id: string
  seller_name: string
  item_kind: MarketItemKind
  item_id: string
  quantity: number
  price_per_unit: number
  created_at: string
  expires_at: string
  status: 'active' | 'sold' | 'cancelled'
}

export class MarketError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'MarketError'
    this.code = code
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getPlayerId(): string {
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(PLAYER_ID_KEY, id)
    }
    return id
  } catch {
    return uuid()
  }
}

export function getPlayerName(): string | null {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY)
  } catch {
    return null
  }
}

export function setPlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name.trim())
  } catch {
    // Storage blocked
  }
}

function readEnv(name: string): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSupabaseUrl(raw: string): string {
  if (!raw) return ''
  let url = raw.trim()
  if (url.startsWith('sb_publishable_') || url.startsWith('sb_secret_') || url.startsWith('eyJ')) {
    throw new MarketError(
      'VITE_SUPABASE_URL looks like an API key. Set it to https://YOUR_PROJECT.supabase.co',
      'invalid_url',
    )
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/+/, '')}`
  }
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('.supabase.co')) {
      throw new MarketError(
        `Invalid Supabase URL "${raw}". Use https://YOUR_PROJECT.supabase.co`,
        'invalid_url',
      )
    }
    return `${parsed.protocol}//${parsed.host}`
  } catch (err) {
    if (err instanceof MarketError) throw err
    throw new MarketError(
      `Invalid Supabase URL "${raw}". Use https://YOUR_PROJECT.supabase.co`,
      'invalid_url',
    )
  }
}

function resolveSupabaseConfig(): { url: string; key: string } | null {
  const rawUrl = readEnv('VITE_SUPABASE_URL')
  const key =
    readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    readEnv('VITE_SUPABASE_ANON_KEY')

  if (!rawUrl || !key) return null

  return {
    url: normalizeSupabaseUrl(rawUrl),
    key,
  }
}

export function isSupabaseConfigured(): boolean {
  try {
    return resolveSupabaseConfig() !== null
  } catch {
    return false
  }
}

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  let config: { url: string; key: string }
  try {
    const resolved = resolveSupabaseConfig()
    if (!resolved) {
      throw new MarketError(
        'Market is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY on Vercel, then redeploy.',
        'not_configured',
      )
    }
    config = resolved
  } catch (err) {
    if (err instanceof MarketError) throw err
    throw new MarketError('Invalid Supabase configuration.', 'invalid_url')
  }
  if (!client) {
    client = createClient(config.url, config.key)
  }
  return client
}

function isMissingTableError(err: { code?: string; message?: string }): boolean {
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    (err.message?.includes('relation') ?? false) ||
    (err.message?.includes('does not exist') ?? false)
  )
}

function wrapError(err: unknown): MarketError {
  if (err instanceof MarketError) return err
  const e = err as { code?: string; message?: string }
  if (isMissingTableError(e)) {
    return new MarketError(
      'Market tables not found — run supabase/market_schema.sql in your Supabase dashboard.',
      'missing_tables',
    )
  }
  return new MarketError(e.message ?? 'Market request failed', e.code)
}

export async function fetchActiveListings(): Promise<MarketListing[]> {
  const supabase = getClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('market_listings')
    .select('*')
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) throw wrapError(error)
  return (data ?? []) as MarketListing[]
}

export async function createListing(
  sellerId: string,
  sellerName: string,
  itemKind: MarketItemKind,
  itemId: string,
  quantity: number,
  pricePerUnit: number,
): Promise<MarketListing> {
  const supabase = getClient()
  const expiresAt = new Date(Date.now() + LISTING_DURATION_MS).toISOString()
  const { data, error } = await supabase
    .from('market_listings')
    .insert({
      seller_id: sellerId,
      seller_name: sellerName,
      item_kind: itemKind,
      item_id: itemId,
      quantity,
      price_per_unit: pricePerUnit,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw wrapError(error)
  return data as MarketListing
}

export interface MarketSaleClaim {
  payoutId: string
  amount: number
  listing: MarketListing
}

export async function fetchUnclaimedSales(
  sellerId: string,
): Promise<MarketSaleClaim[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('market_payouts')
    .select('id, amount, listing_id')
    .eq('seller_id', sellerId)
    .eq('claimed', false)
    .order('created_at', { ascending: false })

  if (error) throw wrapError(error)
  const rows = data ?? []
  const claims: MarketSaleClaim[] = []
  for (const row of rows) {
    if (!row.listing_id) continue
    const listing = await fetchListingById(row.listing_id as string)
    if (!listing) continue
    claims.push({
      payoutId: row.id as string,
      amount: row.amount as number,
      listing,
    })
  }
  return claims
}

export async function claimSinglePayout(
  payoutId: string,
  sellerId: string,
): Promise<number> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('market_payouts')
    .select('id, amount, seller_id, claimed')
    .eq('id', payoutId)
    .maybeSingle()

  if (error) throw wrapError(error)
  if (!data || data.seller_id !== sellerId) {
    throw new MarketError('Payout not found.')
  }
  if (data.claimed) {
    throw new MarketError('Already claimed.')
  }

  const { data: updated, error: claimError } = await supabase
    .from('market_payouts')
    .update({ claimed: true })
    .eq('id', payoutId)
    .eq('seller_id', sellerId)
    .eq('claimed', false)
    .select('amount')
    .single()

  if (claimError) throw wrapError(claimError)
  if (!updated) {
    throw new MarketError('Already claimed.')
  }
  return updated.amount as number
}

export async function buyListing(
  listing: MarketListing,
  buyerId: string,
  _buyerName: string,
): Promise<void> {
  if (listing.seller_id === buyerId) {
    throw new MarketError('You cannot buy your own listing.')
  }
  if (listing.status !== 'active') {
    throw new MarketError('This listing is no longer available.')
  }
  if (new Date(listing.expires_at).getTime() <= Date.now()) {
    throw new MarketError('This listing has expired.')
  }

  const supabase = getClient()
  const total = listing.quantity * listing.price_per_unit

  const { data: updated, error: updateError } = await supabase
    .from('market_listings')
    .update({ status: 'sold' })
    .eq('id', listing.id)
    .eq('status', 'active')
    .select()
    .single()

  if (updateError) throw wrapError(updateError)
  if (!updated) {
    throw new MarketError('This listing was just sold by someone else.')
  }

  const { error: payoutError } = await supabase.from('market_payouts').insert({
    seller_id: listing.seller_id,
    amount: total,
    listing_id: listing.id,
  })

  if (payoutError) throw wrapError(payoutError)
}

export async function cancelListing(
  listingId: string,
  sellerId: string,
): Promise<MarketListing> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('market_listings')
    .update({ status: 'cancelled' })
    .eq('id', listingId)
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .select()
    .single()

  if (error) throw wrapError(error)
  if (!data) {
    throw new MarketError('Listing not found or already closed.')
  }
  return data as MarketListing
}

const PAYOUT_POLL_MS = 20_000

export function subscribeToSellerPayouts(
  sellerId: string,
  callback: () => void,
  _onError?: (err: MarketError) => void,
): () => void {
  if (!isSupabaseConfigured()) return () => {}

  let channel: RealtimeChannel | null = null
  let pollId: ReturnType<typeof setInterval> | null = null
  let stopped = false

  const refresh = () => {
    if (!stopped) callback()
  }

  try {
    const supabase = getClient()
    channel = supabase
      .channel(`market_payouts_${sellerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_payouts',
          filter: `seller_id=eq.${sellerId}`,
        },
        () => refresh(),
      )
      .subscribe()
  } catch {
    // Realtime unavailable — polling only
  }

  pollId = setInterval(refresh, PAYOUT_POLL_MS)

  return () => {
    stopped = true
    if (pollId != null) clearInterval(pollId)
    if (channel) {
      try {
        getClient().removeChannel(channel)
      } catch {
        // ignore
      }
    }
  }
}

const POLL_MS = 30_000

export function subscribeToListings(
  callback: (listings: MarketListing[]) => void,
  onError?: (err: MarketError) => void,
): () => void {
  if (!isSupabaseConfigured()) return () => {}

  let channel: RealtimeChannel | null = null
  let pollId: ReturnType<typeof setInterval> | null = null
  let stopped = false

  const refresh = () => {
    fetchActiveListings()
      .then((listings) => {
        if (!stopped) callback(listings)
      })
      .catch((err) => {
        if (!stopped) onError?.(wrapError(err))
      })
  }

  refresh()

  try {
    const supabase = getClient()
    channel = supabase
      .channel('market_listings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_listings' },
        () => refresh(),
      )
      .subscribe()
  } catch {
    // Realtime unavailable — polling only
  }

  pollId = setInterval(refresh, POLL_MS)

  return () => {
    stopped = true
    if (pollId != null) clearInterval(pollId)
    if (channel) {
      try {
        getClient().removeChannel(channel)
      } catch {
        // ignore
      }
    }
  }
}

export async function fetchListingById(id: string): Promise<MarketListing | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('market_listings')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw wrapError(error)
  return (data as MarketListing | null) ?? null
}

export interface ChatMessage {
  id: string
  player_id: string
  player_name: string
  body: string
  created_at: string
}

const CHAT_MAX_LEN = 280
const CHAT_FETCH_LIMIT = 80
const CHAT_POLL_MS = 15_000

export async function fetchRecentChat(): Promise<ChatMessage[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('market_chat')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(CHAT_FETCH_LIMIT)

  if (error) throw wrapError(error)
  return (data ?? []) as ChatMessage[]
}

export async function sendChatMessage(
  playerId: string,
  playerName: string,
  body: string,
): Promise<void> {
  const text = body.trim()
  if (!text) {
    throw new MarketError('Message cannot be empty.')
  }
  if (text.length > CHAT_MAX_LEN) {
    throw new MarketError(`Message must be ${CHAT_MAX_LEN} characters or less.`)
  }

  const supabase = getClient()
  const { error } = await supabase.from('market_chat').insert({
    player_id: playerId,
    player_name: playerName,
    body: text,
  })

  if (error) throw wrapError(error)
}

export function subscribeToChat(
  callback: (messages: ChatMessage[]) => void,
  onError?: (err: MarketError) => void,
): () => void {
  if (!isSupabaseConfigured()) return () => {}

  let channel: RealtimeChannel | null = null
  let pollId: ReturnType<typeof setInterval> | null = null
  let stopped = false

  const refresh = () => {
    fetchRecentChat()
      .then((messages) => {
        if (!stopped) callback(messages)
      })
      .catch((err) => {
        if (!stopped) onError?.(wrapError(err))
      })
  }

  refresh()

  try {
    const supabase = getClient()
    channel = supabase
      .channel('market_chat_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_chat' },
        () => refresh(),
      )
      .subscribe()
  } catch {
    // Realtime unavailable — polling only
  }

  pollId = setInterval(refresh, CHAT_POLL_MS)

  return () => {
    stopped = true
    if (pollId != null) clearInterval(pollId)
    if (channel) {
      try {
        getClient().removeChannel(channel)
      } catch {
        // ignore
      }
    }
  }
}
