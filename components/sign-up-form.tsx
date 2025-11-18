import { useAuthStore } from '@/store/authStore';
import { IconLoader2 } from '@tabler/icons-react-native';
import { useRef, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Text } from './ui/text';

export function SignUpForm() {
  const { signUp, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (isLoading) return;

    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên người dùng');
      return;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mật khẩu');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập Xác nhận mật khẩu');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    try {
      await signUp(username, password);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View className="gap-6">
      <View className="gap-6">
        <Input
          id="username"
          autoComplete="username"
          placeholder="Tên người dùng"
          autoCapitalize="none"
          onChangeText={setUsername}
          submitBehavior="submit"
          returnKeyType="next"
          className="rounded-full"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />
        <Input
          ref={passwordInputRef}
          id="password"
          placeholder="Mật khẩu"
          secureTextEntry
          returnKeyType="next"
          submitBehavior="submit"
          className="rounded-full"
          onChangeText={setPassword}
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        />
        <Input
          ref={confirmPasswordInputRef}
          id="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          returnKeyType="send"
          className="rounded-full"
          onChangeText={setConfirmPassword}
          onSubmitEditing={handleSignUp}
        />
        <Button className="rounded-full" onPress={handleSignUp}>
          {isLoading && (
            <Icon as={IconLoader2} className="size-5 animate-spin text-primary-foreground" />
          )}
          <Text>{isLoading ? 'Tiếp tục...' : 'Tiếp tục'}</Text>
        </Button>
      </View>
    </View>
  );
}
