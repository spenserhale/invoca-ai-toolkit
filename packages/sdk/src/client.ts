import { InvocaConfigSchema, type InvocaConfig } from "./config.js";
import { RingPoolFamily } from "./families/ringPool.js";
import { BulkRingPoolFamily } from "./families/bulkRingPool.js";
import { SignalFamily } from "./families/signal.js";
import { TransactionsFamily } from "./families/transactions.js";

export interface InvocaClientInput extends Partial<InvocaConfig> {}

export class InvocaClient {
  readonly config: InvocaConfig;
  readonly ringPool: RingPoolFamily;
  readonly bulkRingPool: BulkRingPoolFamily;
  readonly signal: SignalFamily;
  readonly transactions: TransactionsFamily;

  constructor(config: InvocaClientInput = {}) {
    this.config = InvocaConfigSchema.parse(config);
    this.ringPool = new RingPoolFamily(this.config);
    this.bulkRingPool = new BulkRingPoolFamily(this.config);
    this.signal = new SignalFamily(this.config);
    this.transactions = new TransactionsFamily(this.config);
  }
}
