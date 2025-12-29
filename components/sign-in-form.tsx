import { forgotPassword, resetPassword } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { IconLoader2 } from '@tabler/icons-react-native';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Text } from './ui/text';

export function SignInForm() {
  const { signIn, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const passwordInputRef = useRef<TextInput>(null);

  const [isForgotVisible, setIsForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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

  const handleSendForgotEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    try {
      setIsForgotLoading(true);
      await forgotPassword(email.trim());
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn.');
      setForgotStep(2);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message ?? 'Không thể gửi email, vui lòng thử lại.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmNewPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ OTP và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setIsForgotLoading(true);
      await resetPassword(email.trim(), Number(otp), newPassword);
      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      setIsForgotVisible(false);
      setForgotStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message ?? 'Không thể đặt lại mật khẩu, vui lòng thử lại.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotVisible(false);
    setForgotStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
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
        <View className="items-end">
          <Pressable onPress={() => setIsForgotVisible(true)}>
            <Text className="text-xs text-muted-foreground">Quên mật khẩu?</Text>
          </Pressable>
        </View>
      </View>

      <Button className="rounded-full" onPress={handleLogin}>
        {isLoading && (
          <Icon as={IconLoader2} className="size-5 animate-spin text-primary-foreground" />
        )}
        <Text>{isLoading ? 'Đăng nhập...' : 'Đăng nhập'}</Text>
      </Button>

      <Modal
        visible={isForgotVisible}
        transparent
        animationType="slide"
        onRequestClose={closeForgotModal}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-11/12 rounded-3xl bg-background p-4">
              <Text className="mb-4 text-lg font-semibold">Quên mật khẩu</Text>

              {forgotStep === 1 ? (
                <View className="gap-3">
                  <Text className="text-sm text-muted-foreground">
                    Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                  </Text>
                  <Input
                    className="rounded-full"
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <View className="mt-2 flex-row gap-2">
                    <Button
                      className="flex-1 rounded-full"
                      variant="outline"
                      disabled={isForgotLoading}
                      onPress={closeForgotModal}>
                      <Text>Hủy</Text>
                    </Button>
                    <Button
                      className="flex-1 rounded-full"
                      disabled={isForgotLoading}
                      onPress={handleSendForgotEmail}>
                      <Text>{isForgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}</Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <View className="gap-3">
                  <Text className="text-sm text-muted-foreground">
                    Nhập mã OTP đã nhận và mật khẩu mới của bạn.
                  </Text>
                  <Input
                    className="rounded-full"
                    placeholder="Mã OTP"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <Input
                    className="rounded-full"
                    placeholder="Mật khẩu mới"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <Input
                    className="rounded-full"
                    placeholder="Xác nhận mật khẩu mới"
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />

                  <View className="mt-2 flex-row gap-2">
                    <Button
                      className="flex-1 rounded-full"
                      variant="outline"
                      disabled={isForgotLoading}
                      onPress={closeForgotModal}>
                      <Text>Hủy</Text>
                    </Button>
                    <Button
                      className="flex-1 rounded-full"
                      disabled={isForgotLoading}
                      onPress={handleResetPassword}>
                      <Text>{isForgotLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</Text>
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
