import { Submit } from "node-pdu";

export interface PDUResult {
  pdu: string;
  length: number;
}

/**
 * Safely builds a PDU string and its correct AT+CMGS length.
 * Throws if the resulting PDU is invalid.
 */
export function safeSubmitPDU(to: string, text: string): PDUResult {
  try {
    const submit = new Submit(to, text);
    const pdu = submit.toString();

    console.log(`[HELPER] Data coding scheme: ${submit.dataCodingScheme}`);

    if (pdu.length % 2 !== 0) {
      throw new Error(`Invalid PDU: hex string has odd length (${pdu.length})`);
    }

    const smscLen = parseInt(pdu.slice(0, 2), 16);
    const totalOctets = pdu.length / 2;
    const length = totalOctets - (smscLen + 1);

    if (!Number.isInteger(length) || length <= 0) {
      throw new Error(`Invalid TPDU length: ${length}`);
    }

    console.log(
      `[HELPER] PDU generated successfully - SMSC length: ${smscLen}, TPDU length: ${length}`
    );

    return { pdu, length };
  } catch (err) {
    console.error(`[HELPER] Error generating PDU for ${to}:`, err);
    throw err;
  }
}

/**
 * Validates a phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
}

/**
 * Formats a phone number to international format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\s/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("00")) {
    return "+" + cleaned.slice(2);
  }

  if (cleaned.startsWith("0")) {
    // Assuming US numbers - adjust as needed
    return "+1" + cleaned.slice(1);
  }

  return cleaned;
}
