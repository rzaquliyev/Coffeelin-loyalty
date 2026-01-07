/**
 * PassKit API Integration
 * Bu fayl PassKit REST API ilə əlaqə qurmaq üçün helper funksiyalar təmin edir
 */

import axios from 'axios';

// Environment variables
const PASSKIT_API_KEY = process.env.PASSKIT_API_KEY || '';
const PASSKIT_API_SECRET = process.env.PASSKIT_API_SECRET || '';
const PASSKIT_PROGRAM_ID = process.env.PASSKIT_PROGRAM_ID || '';
const PASSKIT_BASE_URL = process.env.PASSKIT_BASE_URL || 'https://api.pub1.passkit.io';

// PassKit API client
const passkitClient = axios.create({
  baseURL: PASSKIT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: PASSKIT_API_KEY,
    password: PASSKIT_API_SECRET,
  },
});

/**
 * PassKit Member tipləri
 */
export interface PassKitMember {
  id: string;
  externalId: string;
  person: {
    displayName: string;
    emailAddress?: string;
    mobileNumber?: string;
  };
  points: {
    current: number;
  };
  tier: {
    id: string;
    name: string;
  };
  status: string;
}

export interface CreateMemberInput {
  externalId: string;
  displayName: string;
  emailAddress?: string;
  mobileNumber?: string;
  points?: number;
  tierName?: string;
}

export interface UpdatePointsInput {
  memberId: string;
  points: number;
  transactionType?: 'earn' | 'redeem';
  transactionValue?: number;
  transactionDescription?: string;
}

/**
 * Yeni PassKit member yaradır
 */
export async function createPassKitMember(input: CreateMemberInput): Promise<PassKitMember> {
  try {
    const response = await passkitClient.post(`/members/program/${PASSKIT_PROGRAM_ID}`, {
      externalId: input.externalId,
      person: {
        displayName: input.displayName,
        emailAddress: input.emailAddress,
        mobileNumber: input.mobileNumber,
      },
      points: {
        current: input.points || 0,
      },
      tier: input.tierName ? { name: input.tierName } : { name: 'Silver' },
      status: 'ISSUED',
    });

    return response.data;
  } catch (error: any) {
    console.error('[PassKit] Member yaratma xətası:', error.response?.data || error.message);
    throw new Error(`PassKit member yaradıla bilmədi: ${error.message}`);
  }
}

/**
 * PassKit member-in məlumatlarını alır
 */
export async function getPassKitMember(memberId: string): Promise<PassKitMember> {
  try {
    const response = await passkitClient.get(`/members/${memberId}`);
    return response.data;
  } catch (error: any) {
    console.error('[PassKit] Member məlumatları alma xətası:', error.response?.data || error.message);
    throw new Error(`PassKit member tapılmadı: ${error.message}`);
  }
}

/**
 * External ID ilə PassKit member axtarır
 */
export async function getPassKitMemberByExternalId(externalId: string): Promise<PassKitMember | null> {
  try {
    const response = await passkitClient.get(`/members/program/${PASSKIT_PROGRAM_ID}`, {
      params: {
        externalId,
      },
    });

    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error: any) {
    console.error('[PassKit] Member axtarış xətası:', error.response?.data || error.message);
    return null;
  }
}

/**
 * PassKit member-in bonus balansını yenilənir
 */
export async function updatePassKitMemberPoints(input: UpdatePointsInput): Promise<PassKitMember> {
  try {
    const response = await passkitClient.put(`/members/${input.memberId}`, {
      points: {
        current: input.points,
      },
    });

    // Əgər transaction məlumatları varsa, transaction yaradırıq
    if (input.transactionType && input.transactionValue) {
      await passkitClient.post(`/members/${input.memberId}/transactions`, {
        type: input.transactionType,
        value: input.transactionValue,
        description: input.transactionDescription || 'Bonus əməliyyatı',
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('[PassKit] Bonus yeniləmə xətası:', error.response?.data || error.message);
    throw new Error(`PassKit bonus yenilənə bilmədi: ${error.message}`);
  }
}

/**
 * PassKit member-in tier-ini yenilənir
 */
export async function updatePassKitMemberTier(memberId: string, tierName: string): Promise<PassKitMember> {
  try {
    const response = await passkitClient.put(`/members/${memberId}`, {
      tier: {
        name: tierName,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[PassKit] Tier yeniləmə xətası:', error.response?.data || error.message);
    throw new Error(`PassKit tier yenilənə bilmədi: ${error.message}`);
  }
}

/**
 * QR koddan Member ID çıxarır
 * PassKit QR kodları adətən bu formatdadır:
 * - https://pskt.io/c/MEMBER_ID
 * - MEMBER_ID (sadəcə ID)
 */
export function extractMemberIdFromQR(qrCode: string): string {
  // URL formatı
  if (qrCode.startsWith('http')) {
    const parts = qrCode.split('/');
    return parts[parts.length - 1];
  }

  // Sadəcə ID
  return qrCode.trim();
}

/**
 * PassKit credentials-larının mövcudluğunu yoxlayır
 */
export function checkPassKitCredentials(): boolean {
  return !!(PASSKIT_API_KEY && PASSKIT_API_SECRET && PASSKIT_PROGRAM_ID);
}
