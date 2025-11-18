import { SignUpForm } from '@/components/sign-up-form';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function SignUp() {
  return (
    <View className="dark flex-1 gap-6 bg-background px-4 pt-20">
      <View className="gap-2">
        <Text className="text-4xl font-extrabold">Đăng ký</Text>
        <Text className="text-muted-foreground">Tạo tài khoản mới để bắt đầu</Text>
      </View>
      <SignUpForm />
    </View>
  );
}
