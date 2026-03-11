export interface AccessLimits {
  is_member: boolean;
  role: 'admin' | 'member' | 'guest';
  nfc_cards: {
    current_count: number;
    limit: number | null; // null = unlimited
    can_create: boolean;
  };
  keypad_pins: {
    current_count: number;
    limit: number | null; // null = unlimited
    can_create: boolean;
  };
}

export interface AccessLimitsResponse {
  success: boolean;
  data: AccessLimits;
  detail?: string;
}