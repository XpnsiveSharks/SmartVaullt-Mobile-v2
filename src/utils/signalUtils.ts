// Signal strength utility functions
export const SignalUtils = {
  // Convert RSSI to signal strength percentage (0-100)
  rssiToPercentage: (rssi: number): number => {
    const clampedRssi = Math.max(-90, Math.min(-30, rssi));
    return Math.round(((clampedRssi + 90) / 60) * 100);
  },

  // Get signal strength category
  getSignalStrength: (rssi: number): {
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'very poor';
    description: string;
    color: string;
    bars: number; // out of 4
  } => {
    if (rssi >= -50) {
      return { level: 'excellent', description: 'Excellent', color: '#10b981', bars: 4 };
    } else if (rssi >= -60) {
      return { level: 'good', description: 'Good', color: '#22c55e', bars: 3 };
    } else if (rssi >= -70) {
      return { level: 'fair', description: 'Fair', color: '#f59e0b', bars: 2 };
    } else if (rssi >= -80) {
      return { level: 'poor', description: 'Poor', color: '#f97316', bars: 1 };
    } else {
      return { level: 'very poor', description: 'Very Poor', color: '#ef4444', bars: 0 };
    }
  },

  // Get approximate distance estimate (very rough)
  getDistanceEstimate: (rssi: number): string => {
    if (rssi >= -50) return 'Very close (< 1m)';
    if (rssi >= -60) return 'Close (1-3m)';
    if (rssi >= -70) return 'Nearby (3-10m)';
    if (rssi >= -80) return 'Far (10-20m)';
    return 'Very far (> 20m)';
  }
};
