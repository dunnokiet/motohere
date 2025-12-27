# Motohere

MotoHere is a mobile application built with [React Native](https://reactnative.dev/), [Expo](https://expo.dev/), [AI SDK](https://ai-sdk.dev/) and [React Native Reusables](https://reactnativereusables.com) that allows users to find and book motorcycle ride-hailing services.

Clone the repository using the following command:

```bash
git clone https://github.com/dunnokiet/motohere.git
cd motohere
```

## Getting Started

To run the development server:

```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
```

This will start the Expo Dev Server. Open the app in:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

You can also scan the QR code using the [Expo Go](https://expo.dev/go) app on your device. This project fully supports running in Expo Go for quick testing on physical devices.

## Environment configuration

Create a `.env.local` file in the root directory with the following content:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url/api/v1
OPENAI_API_KEY=your-openai-api-key
```

Note:

- Replace `your-backend-url` with your backend API address
- Backend repository: [doi_application](https://github.com/duyp6090/doi_appication)
- Ensure the backend is running before starting the app

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🤖 AI powered by [AI SDK](https://ai-sdk.dev/)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)
- [AI SDK](https://ai-sdk.dev/)

## Deploy with EAS

The easiest way to deploy your app is with [Expo Application Services (EAS)](https://expo.dev/eas).

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

If you find this project helpful, please give us a star on [GitHub](https://github.com/dunnokiet/motohere)!
