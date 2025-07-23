import { SerialPort } from "serialport";
import { safeSubmitPDU } from "./helper";
import { parse, Deliver } from "node-pdu";

export interface SMSMessage {
  from: string | null;
  text: string;
  receivedAt: string;
}

export interface ModemManagerOptions {
  baudRate?: number;
  timeout?: number;
  retryAttempts?: number;
}

export class ModemManager {
  private port: SerialPort;
  private buffer = "";
  private waitFor?: {
    resolve: (data: string) => void;
    reject: (err: Error) => void;
    expected: string;
    timeout: NodeJS.Timeout;
  };
  private options: Required<ModemManagerOptions>;
  private isInitialized = false;
  private pendingPDU: { length: number; data: string } | null = null;

  constructor(path: string, options: ModemManagerOptions = {}) {
    this.options = {
      baudRate: options.baudRate || 115200,
      timeout: options.timeout || 5000,
      retryAttempts: options.retryAttempts || 3,
    };

    this.port = new SerialPort({
      path,
      baudRate: this.options.baudRate,
    });

    this.setupPortEventHandlers();
  }

  private setupPortEventHandlers(): void {
    this.port.on("data", this.handleData.bind(this));
    this.port.on("error", (err) => {
      console.error("[MODEM-MANAGER] Serial port error:", err);
    });
    this.port.on("close", () => {
      console.log("[MODEM-MANAGER] Serial port closed");
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      console.log("[MODEM-MANAGER] Already initialized");
      return;
    }

    console.log("[MODEM-MANAGER] Initializing modem...");

    try {
      await this.sendAT("AT");
      await this.sendAT("AT+CPIN?");
      await this.sendAT("AT+CMGF=0"); // PDU mode
      await this.sendAT('AT+CSCS="GSM"');
      await this.sendAT(`AT+CPMS="SM","SM","SM"`); // Setting SMS storage to the SIM card

      this.isInitialized = true;
      console.log("[MODEM-MANAGER] Initialization complete");
    } catch (err) {
      console.error("[MODEM-MANAGER] Initialization failed:", err);
      throw err;
    }
  }

  private handleData(data: Buffer): void {
    const text = data.toString();
    this.buffer += text;
    console.log("[MODEM-MANAGER] <<<", text.trim());

    if (this.waitFor && this.buffer.includes(this.waitFor.expected)) {
      clearTimeout(this.waitFor.timeout);
      this.waitFor.resolve(this.buffer.trim());
      this.buffer = "";
      this.waitFor = undefined;
    }

    // Handle incoming SMS notifications
    if (text.includes("+CMTI:")) {
      this.handleCMTINotification(text);
    } else if (text.includes("+CMT:")) {
      this.handleIncomingSMS(text);
    } else if (this.pendingPDU && this.isPDUData(text)) {
      this.handlePDUData(text);
    }
  }

  private isPDUData(text: string): boolean {
    // PDU data is typically hex characters, but might also contain other characters
    const cleanText = text.trim();
    const hexRegex = /^[0-9A-Fa-f\r\n\s]+$/;
    return hexRegex.test(cleanText);
  }

  private handleIncomingSMS(text: string): void {
    try {
      // Parse PDU format: +CMT: ,<length>
      const match = text.match(/\+CMT:\s*,(\d+)/);
      if (match) {
        const length = parseInt(match[1]);
        console.log(
          `[MODEM-MANAGER] PDU SMS notification received - Length: ${length}`
        );

        // Extract any PDU data that comes immediately after +CMT: on the same line
        const pduMatch = text.match(/\+CMT:\s*,(\d+)\r?\n([0-9A-Fa-f\r\n\s]+)/);
        if (pduMatch) {
          const pduData = pduMatch[2].replace(/[\r\n\s]/g, "");

          // Store the expected PDU length and accumulated data
          this.pendingPDU = { length, data: pduData };

          // Check if we already have the complete PDU
          if (this.pendingPDU.data.length >= length * 2) {
            // Use the full PDU data instead of truncating to length * 2
            const completePDU = this.pendingPDU.data;
            const message = this.parsePDUMessage(completePDU);

            if (message && this.onSMS) {
              this.onSMS(message);
            }

            this.pendingPDU = null;
          }
        } else {
          // No initial PDU data, just store the expected length
          this.pendingPDU = { length, data: "" };
        }
      }
    } catch (err) {
      console.error("[MODEM-MANAGER] Error parsing PDU SMS notification:", err);
    }
  }

  private handlePDUData(text: string): void {
    if (!this.pendingPDU) return;

    try {
      console.log(
        `[MODEM-MANAGER] Additional PDU data received: ${text.trim()}`
      );

      // Clean the PDU data (remove whitespace, newlines, etc.)
      const cleanPDU = text.replace(/[\r\n\s]/g, "");
      this.pendingPDU.data += cleanPDU;

      console.log(
        `[MODEM-MANAGER] Accumulated PDU: ${this.pendingPDU.data.length}/${this.pendingPDU.length * 2} chars`
      );

      // Check if we have received the complete PDU
      if (this.pendingPDU.data.length >= this.pendingPDU.length * 2) {
        // Use the full PDU data instead of truncating to length * 2
        const pduData = this.pendingPDU.data;

        console.log(
          `[MODEM-MANAGER] Complete PDU from accumulation (full): ${pduData}`
        );

        const message = this.parsePDUMessage(pduData);

        if (message && this.onSMS) {
          console.log(
            `[MODEM-MANAGER] SMS message parsed successfully:`,
            message
          );
          this.onSMS(message);
        }

        // Clear pending PDU
        this.pendingPDU = null;
      }
    } catch (err) {
      console.error("[MODEM-MANAGER] Error handling PDU data:", err);
      this.pendingPDU = null;
    }
  }

  private parsePDUMessage(pduHex: string): SMSMessage | null {
    try {
      console.log(`[MODEM-MANAGER] Parsing PDU: ${pduHex}`);

      // Use node-pdu to parse the message
      const pduMessage = parse(pduHex) as Deliver;

      if (pduMessage) {
        return {
          from: pduMessage.address.phone || null,
          text: pduMessage.data.data,
          receivedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error("[MODEM-MANAGER] Error parsing PDU message:", err);
    }

    return null;
  }

  private handleCMTINotification(text: string): void {
    try {
      // Parse CMTI notification: +CMTI: "SM",<index>
      const match = text.match(/\+CMTI:\s*"([^"]+)",(\d+)/);
      if (match) {
        const storage = match[1];
        const index = parseInt(match[2]);
        console.log(
          `[MODEM-MANAGER] SMS notification received - Storage: ${storage}, Index: ${index}`
        );

        // Read the message immediately
        this.readMessageAtIndex(index);
      }
    } catch (err) {
      console.error("[MODEM-MANAGER] Error parsing CMTI notification:", err);
    }
  }

  private async readMessageAtIndex(index: number): Promise<void> {
    try {
      const response = await this.sendAT(`AT+CMGR=${index}`, "OK");
      const message = this.parseSMSResponse(response, index);

      if (message && this.onSMS) {
        this.onSMS(message);
      }
    } catch (err) {
      console.error(
        `[MODEM-MANAGER] Error reading message at index ${index}:`,
        err
      );
    }
  }

  private parseSMSResponse(response: string, index: number): SMSMessage | null {
    try {
      const lines = response.split("\r\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("+CMGR:")) {
          const parts = lines[i].split(",");
          const status = parts[0].split(":")[1]?.trim() || "";
          const sender = parts[1]?.replace(/"/g, "").trim() || "";
          const timestamp = parts[3]?.replace(/"/g, "").trim() || "";
          const text = lines[i + 1]?.trim() || "";

          if (sender && text) {
            return {
              from: sender,
              text: text,
              receivedAt: new Date().toISOString(),
            };
          }
        }
      }
    } catch (err) {
      console.error(
        `[MODEM-MANAGER] Error parsing SMS response for index ${index}:`,
        err
      );
    }

    return null;
  }

  public onSMS?: (msg: SMSMessage) => void;

  public async sendAT(command: string, expect: string = "OK"): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.waitFor) {
        return reject(new Error("Modem is busy"));
      }

      this.buffer = "";
      this.port.write(command + "\r");

      this.waitFor = {
        expected: expect,
        resolve,
        reject,
        timeout: setTimeout(() => {
          const error = new Error(`Timeout waiting for response to ${command}`);
          this.waitFor = undefined;
          reject(error);
        }, this.options.timeout),
      };
    });
  }

  public async sendSMS(to: string, text: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Modem not initialized. Call init() first.");
    }

    try {
      const { pdu, length } = safeSubmitPDU(to, text);

      console.log(`[MODEM-MANAGER] Sending SMS to ${to} (length: ${length})`);

      await this.sendAT(`AT+CMGS=${length}`, ">");
      await this.sendAT(pdu + String.fromCharCode(26), "OK");

      console.log(`[MODEM-MANAGER] SMS sent successfully to ${to}`);
    } catch (err) {
      console.error(`[MODEM-MANAGER] Failed to send SMS to ${to}:`, err);
      throw err;
    }
  }

  public async close(): Promise<void> {
    try {
      if (this.port.isOpen) {
        await this.port.close();
      }
      console.log("[MODEM-MANAGER] Modem manager closed");
    } catch (err) {
      console.error("[MODEM-MANAGER] Error closing modem manager:", err);
      throw err;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.port.isOpen;
  }
}
