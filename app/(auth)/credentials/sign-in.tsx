import { SignInForm } from '@/components/sign-in-form';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function SignIn() {
  return (
    <View className="dark flex-1 gap-4 bg-background px-6 pt-20">
      <View className="gap-2">
        <Text className="text-4xl font-extrabold">Đăng nhập</Text>
        <Text className="text-muted-foreground">Vui lòng nhập tài khoản để thuê xe</Text>
      </View>
      <SignInForm />
    </View>
  );
}
