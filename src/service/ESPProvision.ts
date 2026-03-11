import { NativeModules, NativeEventEmitter } from 'react-native';

const { ESPProvision } = NativeModules;

export interface ProvisionResult {
  success: boolean;
  message: string;
}

export const scanDevices = async (): Promise<string> => {
  try {
    const result = await ESPProvision.scanDevices();
    return result;
  } catch (err: any) {
    console.error('Scan error:', err);
    throw err;
  }
};

export const provisionDevice = async (
  deviceName: string,
  ssid: string,
  password: string,
  pop: string
): Promise<ProvisionResult> => {
  try {
    const result = await ESPProvision.provisionDevice(deviceName, ssid, password, pop);
    return { success: true, message: result };
  } catch (err: any) {
    console.error('Provision error:', err);
    return { success: false, message: err.message || 'Unknown error' };
  }
};
