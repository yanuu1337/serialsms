import { ModemManager } from "./modem-manager";
import { sub } from "@serialsms/queue";
import { ModemWorker } from "./modem-worker";
import { SMSMessage } from "./sms-handler";

const REDIS = sub;

/**! Note: typical serial port roles:
 * /dev/ttyUSB0 - Usually the main modem port, in my case - AT commands, limited
 * /dev/ttyUSB1 - Diagnostic port, used for debugging
 * /dev/ttyUSB2 - Full AT command set (SMS, USSD, etc.) - also used for AT commands
 */

// Configuration
const CONFIG = {
  SERIAL_DEVICE_PORT: process.env.SERIAL_DEVICE_PORT || "/dev/ttyUSB2",
  SERIAL_BAUD_RATE: parseInt(process.env.SERIAL_BAUD_RATE || "115200"),
  DEVICE_INIT_DELAY: parseInt(process.env.DEVICE_INIT_DELAY || "1000"),
  INBOX_POLL_INTERVAL: parseInt(process.env.INBOX_POLL_INTERVAL || "50000"),
  AT_COMMAND_TIMEOUT: parseInt(process.env.AT_COMMAND_TIMEOUT || "5000"),
  ENABLE_REALTIME: process.env.ENABLE_REALTIME !== "false", // Default to true
  TEST_MODE: process.env.TEST_MODE === "true",
  TEST_PHONE_NUMBER: process.env.TEST_PHONE_NUMBER,
} as const;

async function main() {
  console.log("[MODEM-WORKER] Starting modem worker...");
  console.log(`[MODEM-WORKER] Configuration:`, {
    port: CONFIG.SERIAL_DEVICE_PORT,
    realtime: CONFIG.ENABLE_REALTIME,
    pollInterval: CONFIG.INBOX_POLL_INTERVAL,
    testMode: CONFIG.TEST_MODE,
  });

  try {
    // Initialize modem
    const modem = new ModemManager(CONFIG.SERIAL_DEVICE_PORT, {
      baudRate: CONFIG.SERIAL_BAUD_RATE,
      timeout: CONFIG.AT_COMMAND_TIMEOUT,
    });

    // Wait for device to be ready
    console.log(
      `[MODEM-WORKER] Waiting ${CONFIG.DEVICE_INIT_DELAY}ms for device initialization...`
    );
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.DEVICE_INIT_DELAY)
    );

    await modem.init();
    console.log("[MODEM-WORKER] Modem initialized successfully");

    // Create and start the modem worker
    const modemWorker = new ModemWorker(modem, REDIS, {
      enableRealtime: CONFIG.ENABLE_REALTIME,
      inboxPollInterval: CONFIG.INBOX_POLL_INTERVAL,
      onMessage: (msg: SMSMessage) => {
        console.log("[MODEM-WORKER] Incoming SMS:", msg);
        REDIS.publish("incoming", JSON.stringify(msg));
      },
    });

    await modemWorker.start();

    // Send test messages if in test mode
    if (CONFIG.TEST_MODE) {
      if (!CONFIG.TEST_PHONE_NUMBER) {
        console.log(
          "[MODEM-WORKER] Test mode enabled, but no test phone number provided"
        );
        return;
      }
      console.log("[MODEM-WORKER] Test mode enabled, sending test messages...");
      await modemWorker.sendTestMessages(CONFIG.TEST_PHONE_NUMBER);
    }

    console.log("[MODEM-WORKER] Modem worker started successfully");

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("[MODEM-WORKER] Shutting down...");
      await modemWorker.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("[MODEM-WORKER] Shutting down...");
      await modemWorker.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error("[MODEM-WORKER] Fatal error:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[MODEM-WORKER] Unhandled error:", err);
  process.exit(1);
});
