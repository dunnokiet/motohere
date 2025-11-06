import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  IconBell,
  IconBellFilled,
  IconDeviceRemote,
  IconDeviceRemoteFilled,
  IconFileInvoice,
  IconFileInvoiceFilled,
  IconHelpCircle,
  IconHelpCircleFilled,
  IconHome,
  IconHomeFilled,
} from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám phá',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} as={IconHome} asFilled={IconHomeFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đơn thuê',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} as={IconFileInvoice} asFilled={IconFileInvoiceFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: 'Điều khiển',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} as={IconDeviceRemote} asFilled={IconDeviceRemoteFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} as={IconBell} asFilled={IconBellFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Hỗ trợ',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} as={IconHelpCircle} asFilled={IconHelpCircleFilled} />
          ),
        }}
      />
    </Tabs>
  );
}

const TabBarIcon = ({
  focused,
  as: IconComponent,
  asFilled: IconFilledComponent,
}: {
  focused: boolean;
  as: LucideIcon;
  asFilled?: LucideIcon;
}) => {
  return (
    <Icon
      as={focused && IconFilledComponent ? IconFilledComponent : IconComponent}
      className={cn('size-5', focused ? 'text-primary' : 'text-muted-foreground')}
    />
  );
};
