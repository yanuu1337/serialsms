import { ModemManager } from "./modem-manager";
import { InboxPoller } from "./inbox-poller";

export interface SMSMessage {
  index: number;
  from: string | null;
  text: string;
  receivedAt: string;
  status: string;
}

export interface SMSHandlerOptions {
  enableRealtime?: boolean;
  pollIntervalMs?: number;
  deleteAfterRead?: boolean;
  onMessage: (msg: SMSMessage) => Promise<void> | void;
}

export class SMSHandler {
  private modem: ModemManager;
  private options: Required<SMSHandlerOptions>;
  private inboxPoller: InboxPoller | null = null;
  private isRunning = false;

  constructor(modem: ModemManager, options: SMSHandlerOptions) {
    this.modem = modem;
    this.options = {
      enableRealtime: options.enableRealtime ?? true,
      pollIntervalMs: options.pollIntervalMs ?? 10000,
      deleteAfterRead: options.deleteAfterRead ?? true,
      onMessage: options.onMessage,
    };

    this.setupModemCallbacks();
  }

  private setupModemCallbacks(): void {
    // Set up real-time SMS callback
    this.modem.onSMS = (msg) => {
      console.log("[SMS-HANDLER] Real-time SMS received:", msg);
      // Convert to the expected format and call the callback
      const smsMessage: SMSMessage = {
        index: 0, // Will be set when we read the message
        from: msg.from,
        text: msg.text,
        receivedAt: msg.receivedAt,
        status: "REC UNREAD",
      };
      this.options.onMessage(smsMessage);
    };
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[SMS-HANDLER] Already running");
      return;
    }

    try {
      if (this.options.enableRealtime) {
        await this.enableRealtimeNotifications();
      }

      // Always start polling as fallback
      this.startPolling();

      this.isRunning = true;
      console.log(
        `[SMS-HANDLER] Started with real-time: ${this.options.enableRealtime}`
      );
    } catch (err) {
      console.error("[SMS-HANDLER] Failed to start:", err);
      throw err;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("[SMS-HANDLER] Not running");
      return;
    }

    try {
      if (this.inboxPoller) {
        this.inboxPoller.stop();
        this.inboxPoller = null;
      }

      this.isRunning = false;
      console.log("[SMS-HANDLER] Stopped");
    } catch (err) {
      console.error("[SMS-HANDLER] Error stopping:", err);
      throw err;
    }
  }

  private async enableRealtimeNotifications(): Promise<void> {
    try {
      console.log("[SMS-HANDLER] Enabling real-time SMS notifications...");

      // Enable SMS notifications
      await this.modem.sendAT("AT+CNMI=1,2,0,0,0");
      console.log("[SMS-HANDLER] Real-time notifications enabled");
    } catch (err) {
      console.warn(
        "[SMS-HANDLER] Failed to enable real-time notifications, falling back to polling:",
        err
      );
      this.options.enableRealtime = false;
    }
  }

  private startPolling(): void {
    this.inboxPoller = new InboxPoller(this.modem, {
      intervalMs: this.options.pollIntervalMs,
      deleteAfterRead: this.options.deleteAfterRead,
      onMessage: this.options.onMessage,
    });

    this.inboxPoller.start();
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getRealtimeStatus(): boolean {
    return this.options.enableRealtime;
  }
}
