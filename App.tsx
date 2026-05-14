import { useCallback, useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppRoot } from '@/AppRoot'

void SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    void onLayoutRootView()
  }, [onLayoutRootView])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppRoot />
    </SafeAreaProvider>
  )
}
