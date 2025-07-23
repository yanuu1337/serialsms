import { ModemManager } from "./modem-manager";
import { SMSHandler, SMSMessage } from "./sms-handler";
import { Worker } from "bullmq";
import { Redis } from "ioredis";

export interface ModemWorkerOptions {
  enableRealtime?: boolean;
  inboxPollInterval?: number;
  onMessage: (msg: SMSMessage) => Promise<void> | void;
}

export class ModemWorker {
  private modem: ModemManager;
  private redis: Redis;
  private options: ModemWorkerOptions;
  private smsHandler: SMSHandler;
  private worker: Worker;
  private isRunning = false;

  constructor(modem: ModemManager, redis: Redis, options: ModemWorkerOptions) {
    this.modem = modem;
    this.redis = redis;
    this.options = options;

    this.smsHandler = new SMSHandler(modem, {
      enableRealtime: options.enableRealtime ?? true,
      pollIntervalMs: options.inboxPollInterval || 10000,
      onMessage: options.onMessage,
    });

    this.worker = new Worker(
      "outgoing",
      async (job) => {
        const { to, text } = job.data;
        try {
          await this.modem.sendSMS(to, text);
          console.log(`[MODEM-WORKER] SMS sent successfully to ${to}`);
        } catch (err) {
          console.error(`[MODEM-WORKER] Failed to send SMS to ${to}:`, err);
          throw err;
        }
      },
      { connection: redis }
    );

    this.setupWorkerEventHandlers();
  }

  private setupWorkerEventHandlers(): void {
    this.worker.on("completed", (job) => {
      console.log(`[MODEM-WORKER] Job ${job.id} completed successfully`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[MODEM-WORKER] Job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err) => {
      console.error("[MODEM-WORKER] Worker error:", err);
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[MODEM-WORKER] Worker is already running");
      return;
    }

    try {
      await this.smsHandler.start();
      this.isRunning = true;
      console.log(
        `[MODEM-WORKER] Modem worker started (Realtime: ${this.smsHandler.getRealtimeStatus()})`
      );
    } catch (err) {
      console.error("[MODEM-WORKER] Failed to start worker:", err);
      throw err;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("[MODEM-WORKER] Worker is not running");
      return;
    }

    try {
      await this.smsHandler.stop();
      await this.worker.close();
      this.isRunning = false;
      console.log("[MODEM-WORKER] Modem worker stopped");
    } catch (err) {
      console.error("[MODEM-WORKER] Error stopping worker:", err);
      throw err;
    }
  }

  public async sendSMS(to: string, text: string): Promise<void> {
    try {
      await this.modem.sendSMS(to, text);
      console.log(`[MODEM-WORKER] SMS sent directly to ${to}`);
    } catch (err) {
      console.error(
        `[MODEM-WORKER] Failed to send SMS directly to ${to}:`,
        err
      );
      throw err;
    }
  }

  public async sendTestMessages(phoneNumber: string): Promise<void> {
    const testMessages = ["System SMS najprawdopodobniej działa poprawnie."];

    for (const message of testMessages) {
      try {
        await this.sendSMS(phoneNumber, message);
        // Add a small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`[MODEM-WORKER] Failed to send test message:`, err);
      }
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getRealtimeStatus(): boolean {
    return this.smsHandler.getRealtimeStatus();
  }
}
