/**
 * Type definitions for provisioning-related data
 */
export interface ProvisioningError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  security?: string;
}
