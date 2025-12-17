import { Icon } from '@/components/ui/icon';
import { THEME } from '@/lib/theme';
import {
  IconDeviceRemote,
  IconDeviceRemoteFilled,
  IconFileInvoice,
  IconFileInvoiceFilled,
  IconHelpCircle,
  IconHelpCircleFilled,
  IconHome,
  IconHomeFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
        tabBarActiveTintColor: THEME.light.foreground,
        tabBarInactiveTintColor: THEME.light.mutedForeground,
        tabBarStyle: {
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám phá',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} as={IconHome} asFilled={IconHomeFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Đơn thuê',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              as={IconFileInvoice}
              asFilled={IconFileInvoiceFilled}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: 'Điều khiển',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              as={IconDeviceRemote}
              asFilled={IconDeviceRemoteFilled}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} as={IconUser} asFilled={IconUserFilled} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Hỗ trợ',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              as={IconHelpCircle}
              asFilled={IconHelpCircleFilled}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const TabBarIcon = ({
  focused,
  color,
  as: IconComponent,
  asFilled: IconFilledComponent,
}: {
  color: string;
  focused: boolean;
  as: LucideIcon;
  asFilled?: LucideIcon;
}) => {
  return (
    <Icon
      color={color}
      as={focused && IconFilledComponent ? IconFilledComponent : IconComponent}
      className="size-6"
    />
  );
};
