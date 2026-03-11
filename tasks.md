# SmartVault App — Task List

## High priority
- [ ] Implement full provisioning flow in app UI: (1) call `POST /api/v1/vaults/provisioning-token` to get 6-digit token, (2) show token + instructions to user (connect to SmartVault-XXXX WiFi → open 192.168.4.1 → fill SSID/password/token/API URL), (3) poll `GET /api/v1/vaults` every 3s to detect new vault, (4) show success screen with vault name. Hook `useWiFiProvisioning` exists and is wired — the provisioning screen UI and navigation need to be built around it. [high]
- [ ] Fix biometric vault unlock: wire `BiometricUnlockModal` to real API; enable path should call `POST /vaults/{id}/pin` to store PIN, then use `BiometricService` to encrypt it [high]

## Medium priority
- [ ] Integrate WebSocket for real-time vault status: rebuild hook (deleted dead stub), wire to `EVENT_WS_URL`, connect to HomeScreen for live vault state updates [medium]
- [ ] Replace emailjs OTP: move OTP send to backend email service; remove emailjs dependency from mobile [medium]
- [ ] Vault selector persistence: currently just display state — wire selected vault to persist across sessions (SecureStore or AsyncStorage) [medium]

## Low priority
- [ ] Delete MOCK_MODE + all mock paths: after backend fully integrated, remove `MOCK_MODE` flag, all `if (MOCK_MODE)` branches, and `MockDataService` [low]
- [ ] Wire vault biometric PIN entry to real API: when change-PIN flow is re-added, wire to `POST /vaults/{id}/pin` endpoint [low]
