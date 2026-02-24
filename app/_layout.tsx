import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    
    <GluestackUIProvider mode="dark">
      <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#213448" },
        headerTintColor: "#EAE0CF",
      }}
    />
    </GluestackUIProvider>
  
  );
}
