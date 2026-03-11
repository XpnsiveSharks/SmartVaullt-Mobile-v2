# SmartVault App — Project Context

## What it is
SmartVault mobile client — React Native + TypeScript. Manages physical vault units: view status, unlock via PIN or biometric, monitor activity logs, and provision new hardware.

## Stack
| Layer | Tech |
|---|---|
| Framework | React Native (bare workflow) |
| Language | TypeScript |
| Styling | NativeWind (Tailwind) |
| Navigation | React Navigation (native stack + bottom tabs) |
| Icons | Lucide React Native |
| Secure storage | `react-native-keychain` via `StorageService` |
| HTTP | Axios-based `ApiService` with interceptor + auto-refresh |

## Config files
- `src/config/env.ts` — `BASE_URL`, `MOCK_MODE` flag, `EVENT_WS_URL`, env var helpers
- `src/config/api.ts` — `API_CONFIG` object: `BASE_URL`, all endpoint paths, `STORAGE_KEYS`

### MOCK_MODE
- Location: `src/config/env.ts`, exported as `MOCK_MODE`
- When `true`: all API calls are bypassed; data served from `MockDataService` (AsyncStorage)
- When `false`: live API calls via `ApiService`
- **Delete plan**: remove after backend is fully integrated (low priority)

## Auth flow
1. OTP request → `POST /api/v1/auth/request-otp`
2. OTP verify → `POST /api/v1/auth/verify-otp`
3. Registration → `POST /api/v1/auth/signup` (via `UserService.register`)
4. Login → `POST /api/v1/auth/login` (form-encoded, via `UserService.login`)
5. JWT stored in SecureStore via `StorageService`

## Token lifecycle
- Access token: kept in memory (axios default header)
- Refresh token: persisted in SecureStore
- Auto-refresh on 401: handled by `ApiService` interceptor
- `AuthContext` provides `isAuthenticated`, `isLoading`, `logout`

## Navigation (post-cleanup)
```
AppNavigator (auth gate)
├── [unauthenticated] LoginScreen → RegisterModal (modal)
│                                 → PasswordResetScreen
└── [authenticated] BottomTabNavigator
    ├── Home (HomeScreen)
    ├── Activity (ActivityScreen)
    └── Settings (SettingsScreen)
```

## Screen map
| Screen | Key features |
|---|---|
| `LoginScreen` / `Login.tsx` | Username/password login, biometric login toggle |
| `RegisterModal` | OTP → email verify → signup |
| `PasswordResetScreen` | Request + confirm password reset |
| `HomeScreen` | VaultGrid, QuickActions, ActivityFeed (last 3), VaultUnlockModal, BiometricUnlockModal |
| `ActivityScreen` | Full activity log with search + filter |
| `SettingsScreen` | Vault selector, biometric login toggle, vault biometric toggle (stub), Unit Enrollment, Provisioning (stub), Logout |

## Key services
| Service | Purpose |
|---|---|
| `ApiService` | Axios instance, JWT header injection, auto-refresh on 401 |
| `AuthService` | OTP request/verify, logout |
| `UserService` | `register()`, `login()`, `getCurrentUser()`, token utils |
| `UserDataService` | `getCurrentUser()` with MOCK_MODE support |
| `VaultService` | `getUserVaults()`, `getVaultActivity()`, `unlockWithPin()`, `transformActivity()` |
| `BiometricService` | Biometric availability check, login biometric enable/disable/prompt |
| `StorageService` | SecureStore wrappers for tokens |
| `MockDataService` | In-memory + AsyncStorage mock data (vaults, activity, user) — keep until MOCK_MODE deleted |

## Biometric
- **Login biometric**: fully wired via `BiometricService` + `useBiometric` hook
- **Vault unlock biometric**: `BiometricUnlockModal` exists, but enable/unlock not yet wired to real API — shows "Not available" alert on enable attempt

## Features NOT yet integrated (mock/stub)
| Feature | Status |
|---|---|
| Provisioning (WiFi/BLE) | UI exists (`src/presentation/component/provisioning/`), token flow not wired |
| Vault biometric unlock | `BiometricUnlockModal` present, enable path not wired to `POST /vaults/{id}/pin` |
| WebSocket real-time events | `EVENT_WS_URL` configured, hook deleted — needs rebuild |
| Email OTP | Uses emailjs on frontend — replace with backend email service |

## Risk areas
- Provisioning WS/BLE token flow: complex device handshake, touches auth
- Vault biometric unlock wiring: touches PIN storage + SecureStore
