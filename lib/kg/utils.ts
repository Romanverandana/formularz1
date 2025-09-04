// /lib/kg/utils.ts
import { createHmac } from 'crypto';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function hashEmail(email: string): string {
  const salt = process.env.GRAPH_EMAIL_SALT;
  if (!salt) throw new Error('GRAPH_EMAIL_SALT is not defined');
  return createHmac('sha256', salt).update(email.toLowerCase().trim()).digest('hex');
}

export function normalizePhoneNumber(tel: string): string | null {
  try {
    const phoneNumber = parsePhoneNumberFromString(tel, 'PL');
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.number;
    }
    return null;
  } catch {
    return null;
  }
}