import { BikeDetail, createBike } from '@/api/bikes';
import { BRANDS } from '@/components/brands-list';
import { PROVINCES } from '@/components/search/provinces-list';
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { IconChevronDown } from '@tabler/icons-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

type LocalImage = {
  uri: string;
  name: string;
  type: string;
};

export default function CreateBikeScreen() {
  const { user } = useAuthStore();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');

  const [locationName, setLocationName] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [images, setImages] = useState<LocalImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const {
    isVisible: isBrandSheetVisible,
    open: openBrandSheet,
    close: closeBrandSheet,
  } = useBottomSheet();
  const {
    isVisible: isProvinceSheetVisible,
    open: openProvinceSheet,
    close: closeProvinceSheet,
  } = useBottomSheet();

  const handlePickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Thông báo', 'Bạn chỉ được chọn tối đa 4 ảnh.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const originalUri = asset.uri;

      const manipulated = await ImageManipulator.manipulateAsync(originalUri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.PNG,
      });

      const uri = manipulated.uri;
      const name = `image_${Date.now()}.png`;
      const type = 'image/png';

      setImages((prev) => [...prev, { uri, name, type }]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const currentYear = new Date().getFullYear();

    if (!user) newErrors.user = 'Bạn cần đăng nhập để thêm xe.';
    if (!brand.trim()) newErrors.brand = 'Vui lòng chọn hãng xe.';
    if (!model.trim()) newErrors.model = 'Vui lòng nhập mẫu xe.';
    if (!licensePlate.trim()) newErrors.licensePlate = 'Vui lòng nhập biển số xe.';
    if (!year || Number.isNaN(Number(year))) {
      newErrors.year = 'Vui lòng nhập năm sản xuất hợp lệ.';
    } else if (Number(year) < 2000 || Number(year) > currentYear) {
      newErrors.year = `Năm sản xuất phải từ 2000 đến ${currentYear}`;
    }
    if (!pricePerHour || Number.isNaN(Number(pricePerHour)) || Number(pricePerHour) <= 0) {
      newErrors.pricePerHour = 'Vui lòng nhập giá thuê theo giờ hợp lệ.';
    }
    if (!locationName.trim()) newErrors.locationName = 'Vui lòng nhập tên địa điểm.';
    if (!province.trim()) newErrors.province = 'Vui lòng chọn tỉnh/thành phố.';
    if (!ward.trim()) newErrors.ward = 'Vui lòng nhập quận/huyện.';

    if (!latitude.trim()) {
      newErrors.latitude = 'Vui lòng nhập vĩ độ.';
    }
    if (!longitude.trim()) {
      newErrors.longitude = 'Vui lòng nhập kinh độ.';
    }

    if (images.length === 0) newErrors.images = 'Vui lòng chọn ít nhất 1 ảnh xe.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.user) Alert.alert('Lỗi', newErrors.user);
      return false;
    }
    return true;
  };

  const parseCoordinate = (value: string) => {
    const normalized = value.trim().replace(',', '.');
    return Number(normalized);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) return;
    if (!user) return;

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert('Lỗi', 'Vui lòng nhập tọa độ hợp lệ, ví dụ: 10.6789');
      return;
    }

    const car: BikeDetail = {
      ownerId: Number(user.userId),
      brand: brand.trim(),
      model: model.trim(),
      licensePlate: licensePlate.trim(),
      year: Number(year),
      pricePerHour: Number(pricePerHour),
      location: {
        name: locationName,
        province,
        ward,
        latitude: lat,
        longitude: lng,
      },
    };

    const files: File[] = images.map(
      (img) =>
        ({
          uri: img.uri,
          name: img.name,
          type: img.type,
        }) as unknown as File
    );

    console.log(car);
    console.log(files);

    try {
      setIsSubmitting(true);
      await createBike(car, files, user.accessToken);
      Alert.alert('Thành công', 'Thêm xe thành công.', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message ?? 'Không thể thêm xe, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-24"
        contentContainerClassName="pb-32 gap-6"
        showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Text className="text-2xl font-extrabold">Thêm xe cho thuê</Text>
          <Text className="text-sm text-muted-foreground">
            Nhập đầy đủ thông tin để khách dễ dàng tìm thấy xe của bạn.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-secondary p-4 shadow-sm shadow-black/5">
          <View className="gap-1">
            <Text className="text-base font-semibold">Thông tin xe</Text>
            <Text className="text-xs text-muted-foreground">
              Hãng xe, mẫu xe, biển số và giá thuê theo giờ.
            </Text>
          </View>

          <Button
            variant="secondary"
            className={`flex-row items-center justify-between rounded-full border border-border bg-white shadow-sm shadow-black/5 ${
              errors.brand ? 'border border-red-500' : ''
            }`}
            onPress={openBrandSheet}>
            <Text className={brand ? '' : 'text-muted-foreground'}>{brand || 'Chọn hãng xe'}</Text>
            <Icon as={IconChevronDown} className="size-4 text-muted-foreground" />
          </Button>
          {errors.brand && <Text className="text-xs text-red-500">{errors.brand}</Text>}

          <Input
            className={`rounded-full ${errors.model ? 'border-red-500' : ''}`}
            placeholder="Mẫu xe (VD: Exciter 155 VVA)"
            value={model}
            onChange={(e) => setModel(e.nativeEvent.text)}
          />
          {errors.model && <Text className="text-xs text-red-500">{errors.model}</Text>}

          <Input
            className={`rounded-full ${errors.licensePlate ? 'border-red-500' : ''}`}
            placeholder="Biển số (VD: 59A8-45219)"
            value={licensePlate}
            maxLength={12}
            onChange={(e) => setLicensePlate(e.nativeEvent.text)}
          />
          {errors.licensePlate && (
            <Text className="text-xs text-red-500">{errors.licensePlate}</Text>
          )}

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                className={`rounded-full ${errors.year ? 'border-red-500' : ''}`}
                placeholder="Năm sản xuất (VD: 2023)"
                keyboardType="numeric"
                value={year}
                maxLength={4}
                onChange={(e) => setYear(e.nativeEvent.text)}
              />
              {errors.year && <Text className="text-xs text-red-500">{errors.year}</Text>}
            </View>
            <View className="flex-1">
              <Input
                className={`rounded-full ${errors.pricePerHour ? 'border-red-500' : ''}`}
                placeholder="Giá / giờ (VD: 150000)"
                keyboardType="numeric"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.nativeEvent.text)}
              />
              {errors.pricePerHour && (
                <Text className="text-xs text-red-500">{errors.pricePerHour}</Text>
              )}
            </View>
          </View>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-secondary p-4 shadow-sm shadow-black/5">
          <View className="gap-1">
            <Text className="text-base font-semibold">Địa điểm nhận xe</Text>
            <Text className="text-xs text-muted-foreground">
              Địa chỉ cụ thể để khách dễ tìm thấy bạn.
            </Text>
          </View>

          <Input
            className={`rounded-full ${errors.locationName ? 'border-red-500' : ''}`}
            placeholder="Tên địa điểm (VD: 180 Lý Tự Trọng, Phường Bến Thành)"
            value={locationName}
            onChange={(e) => setLocationName(e.nativeEvent.text)}
          />
          {errors.locationName && (
            <Text className="text-xs text-red-500">{errors.locationName}</Text>
          )}

          <Button
            variant="secondary"
            className={`flex-row items-center justify-between rounded-full border border-border bg-white shadow-sm shadow-black/5 ${
              errors.province ? 'border border-red-500' : ''
            }`}
            onPress={openProvinceSheet}>
            <Text className={province ? '' : 'text-muted-foreground'}>
              {province || 'Chọn tỉnh/thành phố'}
            </Text>
            <Icon as={IconChevronDown} className="size-4 text-muted-foreground" />
          </Button>
          {errors.province && <Text className="text-xs text-red-500">{errors.province}</Text>}

          <Input
            className={`rounded-full ${errors.ward ? 'border-red-500' : ''}`}
            placeholder="Quận/Huyện (VD: Quận 1)"
            value={ward}
            onChange={(e) => setWard(e.nativeEvent.text)}
          />
          {errors.ward && <Text className="text-xs text-red-500">{errors.ward}</Text>}

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                className={`rounded-full ${errors.latitude ? 'border-red-500' : ''}`}
                placeholder="Vĩ độ (VD: 10.77341)"
                keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric' })}
                value={latitude}
                onChange={(e) => setLatitude(e.nativeEvent.text)}
              />
              {errors.latitude && <Text className="text-xs text-red-500">{errors.latitude}</Text>}
            </View>
            <View className="flex-1">
              <Input
                className={`rounded-full ${errors.longitude ? 'border-red-500' : ''}`}
                placeholder="Kinh độ (VD: 106.69567)"
                keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric' })}
                value={longitude}
                onChange={(e) => setLongitude(e.nativeEvent.text)}
              />
              {errors.longitude && <Text className="text-xs text-red-500">{errors.longitude}</Text>}
            </View>
          </View>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-secondary p-4 shadow-sm shadow-black/5">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold">Ảnh xe (tối đa 4)</Text>
              <Text className="text-xs text-muted-foreground">
                Thêm ảnh rõ ràng, nhiều góc để tăng tỉ lệ được thuê.
              </Text>
            </View>
            <Button
              size="sm"
              className="rounded-full px-4"
              variant="outline"
              onPress={handlePickImage}>
              <Text>Chọn ảnh</Text>
            </Button>
          </View>
          {errors.images && <Text className="text-xs text-red-500">{errors.images}</Text>}

          <View className="flex-row flex-wrap gap-4">
            {images.map((img, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: img.uri }}
                  style={{ width: 96, height: 96, borderRadius: 16 }}
                />
                <Pressable
                  onPress={() => handleRemoveImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1">
                  <Text className="text-xs text-white">Xóa</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Button
          className="mt-2 flex-row items-center justify-center rounded-full"
          disabled={isSubmitting}
          onPress={handleSubmit}>
          {isSubmitting && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text>{isSubmitting ? 'Đang lưu...' : 'Lưu xe'}</Text>
        </Button>
      </ScrollView>

      <BottomSheet
        isVisible={isBrandSheetVisible}
        onClose={closeBrandSheet}
        title="Chọn hãng xe"
        snapPoints={[0.6]}>
        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-2 pb-4">
            {BRANDS.map((b) => (
              <Button
                key={b.id}
                variant={brand === b.name ? 'secondary' : 'ghost'}
                className="justify-start rounded-full"
                onPress={() => {
                  setBrand(b.name);
                  setErrors((prev) => ({ ...prev, brand: '' }));
                  closeBrandSheet();
                }}>
                <Text>{b.name}</Text>
              </Button>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      <BottomSheet
        isVisible={isProvinceSheetVisible}
        onClose={closeProvinceSheet}
        title="Chọn tỉnh/thành phố"
        snapPoints={[0.7]}>
        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-2 pb-4">
            {PROVINCES.map((p) => (
              <Button
                key={p.id}
                variant={province === p.name ? 'secondary' : 'ghost'}
                className="justify-start rounded-full"
                onPress={() => {
                  setProvince(p.name);
                  setErrors((prev) => ({ ...prev, province: '' }));
                  closeProvinceSheet();
                }}>
                <Text>{p.name}</Text>
              </Button>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
