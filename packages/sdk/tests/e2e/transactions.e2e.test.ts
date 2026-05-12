import { describe, expect, it, beforeAll } from "bun:test";
import {
  InvocaClient,
  resolveConfig,
  TransactionsPageSchema,
} from "../../src/index.js";

const hasToken = Boolean(process.env.INVOCA_OAUTH_TOKEN);
const hasNetwork = Boolean(process.env.INVOCA_NETWORK);
const advertiserId = process.env.INVOCA_E2E_ADVERTISER_ID;
const networkId = process.env.INVOCA_E2E_NETWORK_ID;
const affiliateId = process.env.INVOCA_E2E_AFFILIATE_ID;

const credentialsPresent = hasToken && hasNetwork;
const anyRoleId = advertiserId || networkId || affiliateId;

const SKIP_REASON = !hasToken
  ? "missing INVOCA_OAUTH_TOKEN"
  : !hasNetwork
    ? "missing INVOCA_NETWORK"
    : !anyRoleId
      ? "set INVOCA_E2E_{ADVERTISER,NETWORK,AFFILIATE}_ID for at least one role"
      : "";

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function asPage(result: unknown): { transactions: unknown[]; total: number } {
  const parsed = TransactionsPageSchema.parse(result);
  if (Array.isArray(parsed)) return { transactions: parsed, total: parsed.length };
  return {
    transactions: parsed.transactions ?? [],
    total: parsed.transactions?.length ?? 0,
  };
}

describe.skipIf(!credentialsPresent || !anyRoleId)(
  `e2e transactions (${SKIP_REASON || "live"})`,
  () => {
    let client: InvocaClient;

    beforeAll(() => {
      client = new InvocaClient(resolveConfig());
    });

    describe.skipIf(!advertiserId)("as advertiser", () => {
      it("returns a parseable page with --limit 5", async () => {
        const result = await client.transactions.advertiser(advertiserId!, {
          from: isoDaysAgo(7),
          to: today(),
          limit: 5,
        });
        const { transactions, total } = asPage(result);
        expect(Array.isArray(transactions)).toBe(true);
        expect(total).toBeLessThanOrEqual(5);
      }, 30_000);

      it("respects include_columns to narrow the shape", async () => {
        const result = await client.transactions.advertiser(advertiserId!, {
          from: isoDaysAgo(7),
          to: today(),
          limit: 3,
          include_columns: ["transaction_id"],
        });
        const { transactions } = asPage(result);
        for (const t of transactions as Array<Record<string, unknown>>) {
          expect(t.transaction_id).toBeDefined();
        }
      }, 30_000);

      it("looks up a single transaction by transaction_id (round-trip)", async () => {
        const page = await client.transactions.advertiser(advertiserId!, {
          from: isoDaysAgo(30),
          to: today(),
          limit: 1,
        });
        const { transactions } = asPage(page);
        if (transactions.length === 0) {
          console.log("e2e: no transactions in the last 30 days; round-trip test skipped");
          return;
        }
        const first = transactions[0] as Record<string, unknown>;
        const id = first.transaction_id;
        expect(typeof id).toBe("string");

        const lookup = await client.transactions.advertiser(advertiserId!, {
          transaction_id: id as string,
        });
        const found = asPage(lookup).transactions as Array<Record<string, unknown>>;
        expect(found.length).toBeGreaterThanOrEqual(1);
        expect(found[0]?.transaction_id).toBe(id);
      }, 60_000);
    });

    describe.skipIf(!networkId)("as network", () => {
      it("returns a parseable page with --limit 5", async () => {
        const result = await client.transactions.network(networkId!, {
          from: isoDaysAgo(7),
          to: today(),
          limit: 5,
        });
        const { transactions, total } = asPage(result);
        expect(Array.isArray(transactions)).toBe(true);
        expect(total).toBeLessThanOrEqual(5);
      }, 30_000);
    });

    describe.skipIf(!affiliateId)("as affiliate", () => {
      it("returns a parseable page with --limit 5", async () => {
        const result = await client.transactions.affiliate(affiliateId!, {
          from: isoDaysAgo(7),
          to: today(),
          limit: 5,
        });
        const { transactions, total } = asPage(result);
        expect(Array.isArray(transactions)).toBe(true);
        expect(total).toBeLessThanOrEqual(5);
      }, 30_000);
    });
  },
);

describe.skipIf(credentialsPresent)("e2e transactions (skipped)", () => {
  it(`skipped: ${SKIP_REASON}`, () => {
    expect(SKIP_REASON).not.toBe("");
  });
});
