import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabIcon } from '@/components/TabBarIcon';
import { tabScreenOptions } from '@/constants/navigation';

export default function CockpitTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions,
        tabBarStyle: { ...tabScreenOptions.tabBarStyle, height: 68 + insets.bottom, paddingBottom: 10 + insets.bottom },
      }}
    >
      <Tabs.Screen name="painel" options={{ title: 'Painel', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="clientes" options={{ title: 'Clientes', tabBarIcon: tabIcon('people') }} />
      <Tabs.Screen name="leads" options={{ title: 'Leads', tabBarIcon: tabIcon('funnel') }} />
      <Tabs.Screen name="conta" options={{ title: 'Conta', tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
