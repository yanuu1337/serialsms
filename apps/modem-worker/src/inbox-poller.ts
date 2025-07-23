import { ModemManager } from "./modem-manager";

export interface SMSMessage {
  index: number;
  from: string;
  text: string;
  receivedAt: string;
  status: string;
}

export interface PollerOptions {
  intervalMs?: number;
  deleteAfterRead?: boolean;
  onMessage: (msg: SMSMessage) => Promise<void> | void;
}

export class InboxPoller {
  private modem: ModemManager;
  private intervalMs: number;
  private deleteAfterRead: boolean;
  private onMessage: PollerOptions["onMessage"];
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(modem: ModemManager, options: PollerOptions) {
    this.modem = modem;
    this.intervalMs = options.intervalMs ?? 10000;
    this.deleteAfterRead = options.deleteAfterRead ?? true;
    this.onMessage = options.onMessage;
  }

  public start(): void {
    if (this.isRunning) {
      console.log("[INBOX-POLLER] Already running");
      return;
    }

    this.timer = setInterval(() => this.poll(), this.intervalMs);
    this.isRunning = true;
    console.log(`[INBOX-POLLER] Started polling every ${this.intervalMs}ms`);
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log("[INBOX-POLLER] Not running");
      return;
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.isRunning = false;
    console.log("[INBOX-POLLER] Stopped polling");
  }

  private async poll(): Promise<void> {
    try {
      console.log("[INBOX-POLLER] Polling for new messages...");

      const raw = await this.modem.sendAT("AT+CMGL=0", "OK");
      const messages = this.parseMessages(raw);

      if (messages.length > 0) {
        console.log(`[INBOX-POLLER] Found ${messages.length} new message(s)`);

        for (const msg of messages) {
          try {
            await this.onMessage(msg);

            if (this.deleteAfterRead) {
              await this.modem.sendAT(`AT+CMGD=${msg.index}`, "OK");
              console.log(
                `[INBOX-POLLER] Deleted message at index ${msg.index}`
              );
            }
          } catch (err) {
            console.error(
              `[INBOX-POLLER] Error processing message ${msg.index}:`,
              err
            );
          }
        }
      } else {
        console.log("[INBOX-POLLER] No new messages found");
      }
    } catch (err) {
      console.error("[INBOX-POLLER] Poll failed:", err);
    }
  }

  private parseMessages(raw: string): SMSMessage[] {
    const messages: SMSMessage[] = [];
    const lines = raw.split("\r\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("+CMGL:")) {
        try {
          const parts = lines[i].split(",");
          const index = parseInt(parts[0].split(":")[1].trim());
          const status = parts[1]?.replace(/"/g, "").trim() || "";
          const from = parts[2]?.replace(/"/g, "").trim() || "";
          const text = lines[i + 1]?.trim() || "";

          if (index && from && text) {
            messages.push({
              index,
              from,
              text,
              receivedAt: new Date().toISOString(),
              status,
            });
          }
        } catch (err) {
          console.error(`[INBOX-POLLER] Error parsing message line ${i}:`, err);
        }
      }
    }

    return messages;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getInterval(): number {
    return this.intervalMs;
  }
}
