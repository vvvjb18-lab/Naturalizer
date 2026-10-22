import { getAdminSession } from "@/lib/admin/session";
import {
  listOrders,
  StorageNotConfiguredError,
} from "@/lib/admin/store";
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const orders = await listOrders(5000);
    const header = [
      "Order ID",
      "Created at",
      "Name",
      "Contact",
      "Referral source",
      "Language",
      "Document type",
      "Words",
      "Units",
      "Turnaround minutes",
      "Rush tier",
      "Base amount",
      "Rush fee",
      "Quote",
      "Currency",
      "Deadline",
      "Status",
      "Updated by",
      "Updated at",
      "Notes",
    ];

    const rows = orders.map((order) => [
      order.orderId,
      order.createdAt,
      order.name,
      order.contact,
      order.referral,
      order.language,
      order.documentType,
      order.words,
      order.units,
      order.turnaroundMinutes,
      order.rushTier,
      order.baseAmount,
      order.rushFee,
      order.quote,
      order.currency,
      order.deadline,
      ORDER_STATUS_LABELS[order.status],
      order.updatedBy,
      order.updatedAt,
      order.notes,
    ]);

    const csv = `\uFEFF${[header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")}`;

    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="naturalizer-orders-${date}.csv"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return new Response("Storage is not configured", { status: 503 });
    }

    console.error("Order CSV export failed", error);
    return new Response("Export failed", { status: 500 });
  }
}
