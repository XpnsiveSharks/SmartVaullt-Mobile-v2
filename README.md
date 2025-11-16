# How to Download and Install the App (EAS Build)

## Table of Contents

- [For Team Members](#for-team-members)
  - [Prerequisites](#prerequisites)
- [Option 1: Download from EAS Dashboard (Easiest)](#option-1-download-from-eas-dashboard-easiest)
- [Option 2: Using QR Code](#option-2-using-qr-code)
- [Option 3: Using EAS CLI (For Developers)](#option-3-using-eas-cli-for-developers)
  - [Common Expo CLI Commands](#common-expo-cli-commands)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

## For Team Members

### Prerequisites
- A smartphone (iOS or Android)
- Internet connection

## Option 1: Download from EAS Dashboard (Easiest)

1. **Get Access**
   - Ask your team (sharks) for the Expo account credentials or build link

2. **Visit the Build Page**
   - Go to [expo.dev](https://expo.dev) and log in
   - Navigate to the project
   - Click on **"Builds"** in the sidebar

3. **Download Your Build**
   
   **For Android:**
   - Find the latest Android build
   - Click **"Download"** to get the APK file
   - Transfer to your phone and install
   - (You may need to enable "Install from Unknown Sources" in Settings)

   **For iOS:**
   - Find the latest iOS build
   - Click on the build to see installation options
   - If using TestFlight:
     - Install TestFlight app from App Store
     - Open the invitation link
     - Install the app through TestFlight
   - If using direct install:
     - Scan the QR code with your camera
     - Follow the installation prompt

## Option 2: Using QR Code

1. Your team (sharks) will share a QR code from the build page
2. **For Android:** Scan with any QR code scanner or camera
3. **For iOS:** Scan with the camera app
4. Follow the installation link

## Option 3: Using EAS CLI (For Developers)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Log in**
   ```bash
   eas login
   ```
   (Ask sharks for credentials)

3. **View Available Builds**
   ```bash
   eas build:list
   ```

4. **Download the Latest Build**
   ```bash
   # For Android
   eas build:download --platform android
   
   # For iOS
   eas build:download --platform ios
   ```

### Common Expo CLI Commands

The following is a list of common commands that you will use with Expo CLI while developing your app:

| Command | Description |
|---|---|
| `npx expo start` | Starts the development server (whether you are using a development build or Expo Go). |
| `npx expo prebuild` | Generates native Android and iOS directories using Prebuild. |
| `npx expo run:android` | Compiles native Android app locally. |
| `npx expo run:ios` | Compiles native iOS app locally. |
| `npx expo install package-name` | Used to install a new library or validate and update specific libraries in your project by adding `--fix` option to this command. |
| `npx expo lint` | Setup and configures ESLint. If ESLint is already configured, this command will lint your project files. |

## Troubleshooting

**Android: "Can't install app"**
- Go to Settings > Security > Enable "Install from Unknown Sources"
- Make sure you have enough storage space

**Build link expired**
- Request a new build link from your team lead
- Builds remain available for 30 days by default

**QR code not working**
- Try manually opening the link shown next to the QR code
- Ensure you have a stable internet connection

## Getting Help

- Contact your team lead for:
  - Account access
  - Build links
  - Device registration (iOS)
- Check [EAS Build Docs](https://docs.expo.dev/build/introduction/)


