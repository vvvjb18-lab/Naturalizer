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
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { orders: [], quotes: [] };
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

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const mode = getStorageMode();
  if (mode === "disabled") throw new StorageNotConfiguredError();

  if (mode === "supabase") {
    const { error } = await getSupabase()
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return;
  }

  await withLocalWriteLock(async () => {
    const data = await readLocalDatabase();
    const order = data.orders.find((item) => item.id === id);
    if (!order) throw new Error("Order not found");

    order.status = status;
    await writeLocalDatabase(data);
  });
}
