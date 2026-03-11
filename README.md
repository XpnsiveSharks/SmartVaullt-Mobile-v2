### Android Environment Setup
### Prerequisites
- Android Studio installed
- Java SDK (Temurin recommended)
- Basic familiarity with React Native
- Optional references:
    - [React Native Docs - Frameworkless Setup](https://reactnative.dev/docs/next/getting-started-without-a-framework?utm_source=chatgpt.com)
    - [NativeWind Installation](https://www.nativewind.dev/docs/getting-started/installation/frameworkless?utm_source=chatgpt.com)

### Step 1: Set ANDROID_HOME
1. Press Win + S, type Environment Variables, and click Edit the system environment variables.
2. In the System Properties window, click Environment Variables…
3. Under User variables, click New.
4. Enter:
    - Variable name: ANDROID_HOME
    - Variable value: C:\Users\maryn\AppData\Local\Android\Sdk
5. Click OK.

### Step 2: Add SDK Tools to PATH
1. In the same Environment Variables window, select Path under User variables → click Edit → New
2. Add these two entries:
```perl
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```
3. Click OK to save everything.

### Step 3: Verify Setup
1. Open Command Prompt
2. Run
```bash
adb devices
```
3. Expected output:
```bash
List of devices attached
```
| If an Android emulator is running or a device is connected via USB, it will appear here.

### React Native Navigation Overview
React Native supports multiple navigation patterns. Here’s a quick reference:
1. Stack Navigation
- Screens are pushed on top of each other like a stack of cards.
- You can navigate back to the previous screen.
2. Tab Navigation
- Displays bottom tabs to switch between screens.
- Useful for top-level sections of your app.
3. Drawer Navigation
- Provides a slide-out menu to switch screens.
- Common in apps with many sections.


npx react-native run-android

npx react-native start
