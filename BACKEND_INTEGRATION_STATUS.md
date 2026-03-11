# SmartVault App Backend Integration Status

## Purpose

This document captures the current integration state of `smartvault-app-Personal-Copy` against the sibling backend project `smartvault-backend`.

The intended system shape is:

1. The mobile app talks to `smartvault-backend` over HTTP and WebSocket.
2. `smartvault-backend` owns authentication, vault access rules, activity logs, and command dispatch.
3. The backend then talks to the physical vault device (ESP32 / vault hardware), mainly through backend-managed WebSocket channels.

In short: the mobile app does not talk directly to the vault for normal vault access. The backend is the control plane between the app and the vault.

## Current App Context

- The app is a React Native / Expo client with navigation in `App.tsx`.
- `AuthService.initialize()` registers token refresh handling before the app renders.
- `MOCK_MODE` is currently set to `false`, so the app is expected to use the real backend by default.
- API base configuration is centralized in `src/config/api.ts` and `src/config/env.ts`.
- The default fallback base URL is an ngrok URL unless `BASE_URL` is provided through environment config.

## Confirmed Live Integrations

These flows are both implemented in the app and backed by currently mounted routes in `smartvault-backend`.

### Authentication

- Login: `POST /api/v1/auth/login`
- Refresh token rotation: `POST /api/v1/auth/refresh`
- Logout: `POST /api/v1/auth/logout`
- Request password reset: `POST /api/v1/auth/request-password-reset`
- Confirm password reset: `POST /api/v1/auth/confirm-password-reset`
- Signup flow:
  - `POST /api/v1/auth/request-otp`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/signup`
- Current user lookup after login: `GET /api/v1/users/me`

How this is used in the app:

- `useAuth` checks stored auth state, validates the session through `UserDataService.getCurrentUser()`, and updates navigation state.
- `ApiService` retries authenticated requests once after a `401` by invoking the refresh handler.
- The login UI also exposes registration and password reset flows.

### Vault Access Data

- List accessible vaults: `GET /api/v1/vaults`
- Get vault activity: `GET /api/v1/vaults/{vault_id}/activity`
- Unlock with PIN: `POST /api/v1/vaults/{vault_id}/unlock/pin`
- Send remote unlock command: `POST /api/v1/vaults/{vault_id}/unlock`
- Get vault members: `GET /api/v1/vaults/{vault_id}/members`
- Add vault member: `POST /api/v1/vaults/{vault_id}/members`
- Remove vault member: `DELETE /api/v1/vaults/{vault_id}/members/{user_id}`
- Search users by email: `GET /api/v1/users/search`

How this is used in the app:

- `HomeScreen` loads vaults and recent activity and can unlock a vault with a PIN.
- `BiometricUnlockModal` uses local device biometrics, then sends a backend remote unlock command.
- `UsersScreen` loads vaults, fetches member lists, searches for a user by email, and adds or removes members.
- `ActivityScreen` aggregates activity entries across all vaults visible to the user.

### Local Secure Storage Backing Real Backend Sessions

These are not backend endpoints, but they are active in production flow and support the real backend integration:

- Access and refresh tokens are stored through `StorageService`.
- Biometric login stores the refresh token in secure storage, then calls the backend refresh endpoint after successful device authentication.
- Per-vault biometric unlock stores a vault PIN locally in secure storage and reuses it after local biometric verification.

Important note:

- Device biometrics are local to the app. The backend is not aware that a biometric prompt occurred. The backend only sees the resulting refresh request or unlock request.

## UI That Is Present But Not Actually Wired Into The Current Live Settings Flow

These features exist in code, but the user-facing Settings screen does not currently mount the real implementation.

### Real Managers Exist But Are Not Mounted

- `PinManager` exists and uses `useKeypadPins` plus `KeypadPinService`.
- `NFCManager` exists and uses `useNFCCardManagement` plus `NFCManagerService`.
- `ProvisioningManager` exists and mounts the full provisioning flow.

### What SettingsScreen Actually Shows Instead

- `SettingsScreen` currently renders `MockPinManager`.
- `SettingsScreen` currently renders `MockNFCManager`.
- "Unit Enrollment" opens `WaitingForVaultModal` only.
- "Provisioning" also opens `WaitingForVaultModal` only.

So the current Settings screen still exposes placeholders and mock-backed management in the main live UI, even though fuller implementations exist elsewhere in the codebase.

## Code Present In The App But Not Supported By The Current Backend

These app-side integrations are implemented or partially implemented, but the currently mounted backend routers do not expose matching endpoints.

### Vault Invitations

The app expects:

- `POST /api/v1/vault-invitations/`
- `GET /api/v1/vault-invitations/{code}`
- `POST /api/v1/vault-invitations/{code}/accept`
- `GET /api/v1/vault-invitations/vault/{vault_id}`

Status:

- No `vault-invitations` router is mounted in `smartvault-backend/app/api/router.py`.
- Invitation UI and hooks exist in the app, but this cannot work end-to-end against the current backend.

### Ownership Transfer

The app expects:

- `POST /api/v1/vaults/{vault_id}/transfer/initiate`
- `POST /api/v1/vaults/{vault_id}/transfer/accept`
- `GET /api/v1/vaults/transfer/validate/{invite_code}`

Status:

- No transfer routes are mounted in the current backend.
- Transfer UI exists in the app, but it is not currently backed by the live backend.

### Access Limits

The app expects:

- `GET /api/v1/vaults/{vault_id}/access-limits`

Status:

- No `access-limits` route is mounted in the current backend.
- `useAccessLimits` exists, but its live backend dependency is missing.

### NFC Card Management

The app expects:

- `/nfc-cards/...` routes

Status:

- No NFC card API router is mounted in the current backend.
- The real NFC management flow cannot currently complete against `smartvault-backend`.

### Keypad PIN Inventory Management

The app expects:

- `/keypad-pins/...` routes

Status:

- The current backend exposes vault PIN endpoints (`/api/v1/vaults/{vault_id}/pin` and `/unlock/pin`), but not the separate `/keypad-pins` CRUD surface expected by `KeypadPinService`.
- The advanced PIN inventory manager in the app is therefore not backed by the current backend.

## Confirmed Integration Mismatches

These areas are close in concept, but the current request format or protocol does not match the backend as it exists today.

### Vault Provisioning Payload Mismatch

The app currently sends vault creation data shaped like:

- `device_id`
- `name`
- `location`

The backend currently documents and implements `POST /api/v1/vaults/provision` with:

- `hardware_uuid`
- `vault_name`

Impact:

- The mobile provisioning UI may reach the endpoint, but the request body does not match the backend contract.
- The response shape also differs. The app expects `id`, `device_id`, and `name`, while the backend returns `vault_id`, `hardware_uuid`, and `vault_name`.

### WebSocket Subscription Protocol Mismatch

The app WebSocket hook currently:

- Builds a URL for `/api/v1/ws/user`
- Passes `token`, `vault_id`, and `prefixes` as query params
- Sends a message like `{ type: "subscribe", vault_id, prefixes }`

The backend currently expects:

- Connection to `/api/v1/ws/user`
- A message type of `SUBSCRIBE`
- A payload shaped like `{ "vault_ids": [...] }`

Impact:

- Even if the hook is mounted later, the current subscribe message format does not match the backend message contract.

### WebSocket Authentication Mismatch

The app assumes the WebSocket uses the JWT `token` query parameter.

The current backend WebSocket route accepts a `token` query parameter in the function signature, but the route resolves identity through `get_current_user_id()` from `app/api/deps/common.py`, which currently relies on:

- `DEV_AUTH_BYPASS`, or
- `x-dev-user-id` in development

Impact:

- The app is not sending `x-dev-user-id`.
- In environments where `DEV_AUTH_BYPASS` is off, the current WebSocket auth path is not aligned with the mobile hook.

## Backend Surface That Is Actually Mounted Today

The current backend router mounts:

- `health`
- `vaults`
- `users`
- `auth`
- `access`
- `activity`
- `devices`
- `websocket` (`/api/v1/ws/...`)

That means the app can safely treat these as the active, real backend domains today:

- Auth and session lifecycle
- User identity and user search
- Vault listing and status
- Member management
- Activity logs
- PIN unlock and remote unlock
- Device-facing backend routes

Everything outside that list should be treated as unconfirmed, stubbed, or currently disconnected unless the backend adds new routers.

## Practical Read On What Is Already Integrated

If the goal is to describe what is truly integrated right now, the app already has a usable backend-connected core:

- Real login / refresh / logout
- Real signup and password reset
- Real authenticated session recovery on app launch
- Real vault listing
- Real member listing and membership changes
- Real vault activity feed
- Real unlock flows through backend APIs

If the goal is to describe what is not finished yet, the main unfinished areas are:

- Real-time user WebSocket updates are not actively used and are protocol-misaligned
- The visible Settings management surfaces still rely on mocks or placeholders
- Invitations, ownership transfer, access limits, NFC card CRUD, and keypad PIN inventory depend on backend routes that do not exist in the current mounted backend
- Provisioning logic exists, but its payload contract does not currently match the backend provision endpoint

## Recommended Next Integration Priorities

1. Replace the mock Settings modules with the real managers only after the backend routes they depend on are available.
2. Align the vault provisioning request and response contract with `smartvault-backend` before exposing the provisioning UI in the main Settings screen.
3. Decide whether WebSocket auth should be real JWT auth or dev-header auth, then update both the backend route and the app hook to the same protocol.
4. Either add backend routers for invitations, access limits, NFC cards, and keypad pin CRUD, or remove those client surfaces until the backend contract exists.

