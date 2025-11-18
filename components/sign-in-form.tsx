import { useAuthStore } from '@/store/authStore';
import { IconLoader2 } from '@tabler/icons-react-native';
import { useRef, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Text } from './ui/text';

export function SignInForm() {
  const { signIn, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên người dùng');
      return;
    }

    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mật khẩu');
      return;
    }

    try {
      await signIn(username, password);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View className="gap-6">
      <View className="gap-4">
        <Input
          id="username"
          placeholder="Tên người dùng"
          autoCapitalize="none"
          onChangeText={setUsername}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          returnKeyType="next"
          submitBehavior="submit"
          className="rounded-full"
        />
        <Input
          ref={passwordInputRef}
          id="password"
          placeholder="Mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
          returnKeyType="send"
          className="rounded-full"
          onSubmitEditing={handleLogin}
        />
      </View>
      <Button className="rounded-full" onPress={handleLogin}>
        {isLoading && (
          <Icon as={IconLoader2} className="size-5 animate-spin text-primary-foreground" />
        )}
        <Text>{isLoading ? 'Đăng nhập...' : 'Đăng nhập'}</Text>
      </Button>
    </View>
  );
}
