import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const ORDER_STATUSES = [
  "new",
  "quoted",
  "confirmed",
  "in_progress",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface AdminQuote {
  id: string;
  quoteId: string;
  language: string;
  documentType: string;
  words: number;
  units: number;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  name: string;
  contact: string;
  language: string;
  documentType: string;
  words: number;
  units: number;
  quote: number;
  currency: string;
  deadline: string | null;
  notes: string;
  status: OrderStatus;
  source: string;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface AdminOrderEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actor: string;
  createdAt: string;
}

export interface NewQuote {
  quoteId: string;
  language: string;
  documentType: string;
  words: number;
  units: number;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

export interface NewOrder {
  orderId: string;
  name: string;
  contact: string;
  language: string;
  documentType: string;
  words: number;
  units: number;
  quote: number;
  currency: string;
  deadline: string | null;
  notes: string;
  source: string;
  createdAt: string;
}

type StorageMode = "supabase" | "local" | "disabled";

interface LocalDatabase {
  orders: AdminOrder[];
  quotes: AdminQuote[];
  events: AdminOrderEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "admin.json");

let supabaseClient: SupabaseClient | null = null;
let localWriteQueue: Promise<unknown> = Promise.resolve();

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Admin storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in production."
    );
    this.name = "StorageNotConfiguredError";
  }
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getStorageMode(): StorageMode {
  if (hasSupabaseConfig()) return "supabase";
  if (process.env.VERCEL === "1") return "disabled";
  return "local";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

function getSupabase() {
  if (!hasSupabaseConfig()) {
    throw new StorageNotConfiguredError();
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return supabaseClient;
}

async function readLocalDatabase(): Promise<LocalDatabase> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDatabase>;

    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { orders: [], quotes: [], events: [] };
    }
    throw error;
  }
}

async function writeLocalDatabase(data: LocalDatabase) {
  await mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${DATA_FILE}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(data, null, 2), "utf8");
  await rename(temporaryFile, DATA_FILE);
}

function withLocalWriteLock<T>(operation: () => Promise<T>) {
  const run = localWriteQueue.then(operation, operation);
  localWriteQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function mapQuoteRow(row: Record<string, unknown>): AdminQuote {
  return {
    id: String(row.id),
    quoteId: String(row.quote_id),
    language: String(row.language),
    documentType: String(row.document_type),
    words: Number(row.words),
    units: Number(row.units),
    amount: Number(row.amount),
    currency: String(row.currency),
    createdAt: String(row.created_at),
    expiresAt: String(row.expires_at),
  };
}

function mapOrderRow(row: Record<string, unknown>): AdminOrder {
  const status = String(row.status);
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    name: String(row.name),
    contact: String(row.contact),
    language: String(row.language),
    documentType: String(row.document_type),
    words: Number(row.words),
    units: Number(row.units),
    quote: Number(row.quote),
    currency: String(row.currency),
    deadline: row.deadline ? String(row.deadline) : null,
    notes: row.notes ? String(row.notes) : "",
    status: isOrderStatus(status) ? status : "new",
    source: row.source ? String(row.source) : "naturalizer-site",
    createdAt: String(row.created_at),
    updatedBy: row.updated_by ? String(row.updated_by) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

function mapEventRow(row: Record<string, unknown>): AdminOrderEvent {
  const fromStatus = row.from_status ? String(row.from_status) : null;
  const toStatus = String(row.to_status);

  return {
    id: String(row.id),
    orderId: String(row.order_id),
    fromStatus:
      fromStatus && isOrderStatus(fromStatus) ? fromStatus : null,
    toStatus: isOrderStatus(toStatus) ? toStatus : "new",
    actor: String(row.actor),
    createdAt: String(row.created_at),
  };
}

export async function saveQuote(record: NewQuote) {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { error } = await getSupabase()
      .from("quotes")
      .upsert(
        {
          quote_id: record.quoteId,
          language: record.language,
          document_type: record.documentType,
          words: record.words,
          units: record.units,
          amount: record.amount,
          currency: record.currency,
          created_at: record.createdAt,
          expires_at: record.expiresAt,
        },
        { onConflict: "quote_id", ignoreDuplicates: true }
      );

    if (error) throw new Error(error.message);
    return;
  }

  await withLocalWriteLock(async () => {
    const data = await readLocalDatabase();
    if (data.quotes.some((quote) => quote.quoteId === record.quoteId)) return;

    data.quotes.unshift({ ...record, id: record.quoteId });
    await writeLocalDatabase(data);
  });
}

export async function saveOrder(record: NewOrder) {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { error } = await getSupabase()
      .from("orders")
      .upsert(
        {
          order_id: record.orderId,
          name: record.name,
          contact: record.contact,
          language: record.language,
          document_type: record.documentType,
          words: record.words,
          units: record.units,
          quote: record.quote,
          currency: record.currency,
          deadline: record.deadline,
          notes: record.notes,
          source: record.source,
          status: "new",
          created_at: record.createdAt,
        },
        { onConflict: "order_id", ignoreDuplicates: true }
      );

    if (error) throw new Error(error.message);
    return;
  }

  await withLocalWriteLock(async () => {
    const data = await readLocalDatabase();
    if (data.orders.some((order) => order.orderId === record.orderId)) return;

    data.orders.unshift({
      ...record,
      id: record.orderId,
      status: "new",
      updatedBy: null,
      updatedAt: null,
    });
    await writeLocalDatabase(data);
  });
}

export async function listQuotes(limit = 100): Promise<AdminQuote[]> {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { data, error } = await getSupabase()
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapQuoteRow);
  }

  const data = await readLocalDatabase();
  return data.quotes.slice(0, limit);
}

export async function listOrders(limit = 100): Promise<AdminOrder[]> {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrderRow);
  }

  const data = await readLocalDatabase();
  return data.orders.slice(0, limit);
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapOrderRow(data) : null;
  }

  const data = await readLocalDatabase();
  return data.orders.find((order) => order.id === id) ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  updatedBy: string
) {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  const updatedAt = new Date().toISOString();

  if (mode === "supabase") {
    const client = getSupabase();
    const { data: existing, error: readError } = await client
      .from("orders")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (readError) throw new Error(readError.message);
    if (!existing) throw new Error("Order not found");

    const { error } = await client
      .from("orders")
      .update({ status, updated_by: updatedBy, updated_at: updatedAt })
      .eq("id", id);

    if (error) throw new Error(error.message);

    const { error: eventError } = await client.from("order_events").insert({
      order_id: id,
      from_status: existing.status,
      to_status: status,
      actor: updatedBy,
      created_at: updatedAt,
    });

    if (eventError) {
      console.error("Order event write failed", eventError);
    }

    return;
  }

  await withLocalWriteLock(async () => {
    const data = await readLocalDatabase();
    const order = data.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");

    const fromStatus = order.status;
    order.status = status;
    order.updatedBy = updatedBy;
    order.updatedAt = updatedAt;
    data.events.unshift({
      id: randomUUID(),
      orderId: order.id,
      fromStatus,
      toStatus: status,
      actor: updatedBy,
      createdAt: updatedAt,
    });
    await writeLocalDatabase(data);
  });
}

export async function listOrderEvents(
  orderId: string
): Promise<AdminOrderEvent[]> {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { data, error } = await getSupabase()
      .from("order_events")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEventRow);
  }

  const data = await readLocalDatabase();
  return data.events.filter((event) => event.orderId === orderId);
}
