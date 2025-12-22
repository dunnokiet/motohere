import { deleteBike, getBikeById } from '@/api/bikes';
import { deleteReview, updateReview } from '@/api/review';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useBottomTabOverflow } from '@/hooks/useBottomTabOverflow';
import { formatPrice } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import {
  IconHeart,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconTrash,
} from '@tabler/icons-react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BikeDetailScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const isOwnerMode = mode === 'owner';

  const { user } = useAuthStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editText, setEditText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['bike', id],
    queryFn: () => getBikeById(id as string, user!.accessToken),
    enabled: !!id,
  });

  const bike = data?.bikeDetail;

  const bottom = useBottomTabOverflow();

  const handleBookPress = () => {
    if (!bike) return;

    router.push({
      pathname: '/(main)/bikes/confirm',
      params: {
        carId: id as string,
        pricePerHour: bike.pricePerHour.toString(),
        customerId: user?.userId,
        title: `${bike.brand} ${bike.model}`,
      },
    });
  };

  const handleEditBike = () => {
    if (!id) return;

    router.push({
      pathname: '/(main)/bikes/create',
      params: { id: String(id), mode: 'edit' },
    });
  };

  const handleDeleteBike = () => {
    if (!id || !user) return;

    Alert.alert('Xóa xe', 'Bạn có chắc chắn muốn xóa xe này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteBike(String(id), String(user.userId), user.accessToken);
            Alert.alert('Thành công', 'Đã xóa xe thành công');
            router.back();
          } catch (error: any) {
            Alert.alert('Lỗi', error?.message ?? 'Không thể xóa xe, vui lòng thử lại.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const openEditReview = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditText(review.comment);
  };

  const handleSubmitEditReview = async () => {
    if (!user || !editingReview) return;
    if (!editRating || !editText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao và nhập nội dung đánh giá.');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await updateReview(
        {
          bookingId: editingReview.bookingId,
          reviewId: editingReview.id,
          rating: editRating,
          reviewText: editText.trim(),
        },
        user.accessToken
      );
      Alert.alert('Thành công', 'Đã cập nhật đánh giá.');
      setEditingReview(null);
      await refetch();
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể cập nhật đánh giá, vui lòng thử lại.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteReview = (review: any) => {
    if (!user) return;

    Alert.alert('Xóa đánh giá', 'Bạn có chắc chắn muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingReviewId(review.id);
            await deleteReview(review.bookingId, review.id, user.accessToken);
            Alert.alert('Thành công', 'Đã xóa đánh giá.');
            await refetch();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không thể xóa đánh giá, vui lòng thử lại.');
          } finally {
            setDeletingReviewId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="relative flex-1 bg-background p-4 pt-20">
      <ScrollView contentContainerClassName="gap-8 pb-24" showsVerticalScrollIndicator={false}>
        <View className="mb-12 h-60 rounded-3xl border border-border bg-secondary shadow-sm shadow-black/5">
          {bike && (
            <Carousel>
              {bike.images.map((image) => (
                <CarouselItem key={image.id}>
                  <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} />
                </CarouselItem>
              ))}
            </Carousel>
          )}
        </View>
        <View className="gap-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold">{`${bike?.brand} ${bike?.model}`}</Text>
            <Button className="rounded-full" size="icon" variant="outline">
              <Icon as={IconHeart} className="size-4" />
            </Button>
          </View>
          <View className="flex-row justify-between">
            <View className="gap-0.5">
              <Text className="text-sm text-muted-foreground">Hãng xe</Text>
              <Text className="font-medium">{bike?.brand}</Text>
            </View>
            <View className="gap-0.5">
              <Text className="text-sm text-muted-foreground">Năm sản xuất</Text>
              <Text className="font-medium">{bike?.year}</Text>
            </View>
            <View className="gap-0.5">
              <Text className="text-sm text-muted-foreground">Biển số xe</Text>
              <Text className="font-medium">{bike?.licensePlate}</Text>
            </View>
          </View>
          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Vị trí</Text>
            <View
              className="relative h-40 overflow-hidden rounded-3xl border border-border shadow-sm shadow-black/5"
              pointerEvents="none">
              <MapView style={{ width: '100%', height: '100%' }} />
              <Badge className="insert-x-0 absolute m-4 rounded-full" variant="secondary">
                <Icon as={IconMapPin} className="size-4" />
                <Text className="text-xs">{bike?.location.name}</Text>
              </Badge>
            </View>
          </View>
          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Đối tác thuê</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="size-16 rounded-full bg-secondary" />
                <View className="gap-0.5">
                  <Text className="font-medium">{bike?.username}</Text>
                  <Text className="text-sm text-muted-foreground">Chủ sở hữu</Text>
                </View>
              </View>
              <Button className="rounded-full" variant="outline" size="icon">
                <Icon as={IconPhone} className="size-4" />
              </Button>
            </View>
          </View>
          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Đánh giá</Text>

            {!bike?.reviews || bike.reviews.length === 0 ? (
              <View className="rounded-3xl bg-secondary p-6">
                <Text className="text-center">Chưa có đánh giá nào</Text>
              </View>
            ) : (
              <View className="gap-3 rounded-3xl bg-secondary p-4">
                {bike.reviews.map((review) => {
                  const createdAt = (review as any).createdAt || (review as any).createAt || null;
                  const createdAtText = createdAt
                    ? new Date(createdAt).toLocaleDateString('vi-VN')
                    : null;

                  const isMyReview = user && (review as any).customerId === user.userId;

                  return (
                    <View key={review.id} className="gap-1 rounded-2xl bg-background/80 p-3">
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-sm font-medium">{review.customerName}</Text>

                        <View className="flex-row items-center gap-2">
                          {createdAtText && (
                            <Text className="text-xs text-muted-foreground">{createdAtText}</Text>
                          )}

                          {isMyReview && (
                            <View className="flex-row gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                onPress={() => openEditReview(review)}>
                                <Icon as={IconPencil} className="size-4 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                disabled={deletingReviewId === review.id}
                                onPress={() => handleDeleteReview(review)}>
                                <Icon
                                  as={IconTrash}
                                  className={`size-4 ${
                                    deletingReviewId === review.id
                                      ? 'text-muted-foreground'
                                      : 'text-destructive'
                                  }`}
                                />
                              </Button>
                            </View>
                          )}
                        </View>
                      </View>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            className={
                              star <= review.rating
                                ? 'text-base text-yellow-400'
                                : 'text-base text-muted-foreground'
                            }>
                            ★
                          </Text>
                        ))}
                      </View>
                      <Text className="text-sm">{review.comment}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!editingReview}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingReview(null)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-11/12 rounded-3xl bg-background p-4">
              <Text className="mb-2 text-lg font-semibold">Chỉnh sửa đánh giá</Text>
              <Text className="mb-4 text-sm text-muted-foreground">
                {bike?.brand} {bike?.model}
              </Text>

              <View className="mb-4 gap-2">
                <Text className="text-sm font-medium">Chọn số sao</Text>
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} className="px-2" onPress={() => setEditRating(star)}>
                      <Text
                        className={
                          star <= editRating
                            ? 'text-2xl text-yellow-400'
                            : 'text-2xl text-muted-foreground'
                        }>
                        ★
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-4 gap-2">
                <Text className="text-sm font-medium">Nhận xét</Text>
                <Input
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="h-28 rounded-2xl"
                  placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                  value={editText}
                  onChangeText={setEditText}
                />
              </View>

              <View className="flex-row gap-2">
                <Button
                  className="flex-1 rounded-full"
                  variant="outline"
                  disabled={isSubmittingEdit}
                  onPress={() => setEditingReview(null)}>
                  <Text>Hủy</Text>
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  disabled={isSubmittingEdit}
                  onPress={handleSubmitEditReview}>
                  <Text>{isSubmittingEdit ? 'Đang lưu...' : 'Lưu'}</Text>
                </Button>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-4 bg-primary p-4 pb-12">
        <View className="flex-row items-center">
          <Text className="text-2xl font-semibold text-emerald-300">
            {formatPrice(bike?.pricePerHour || 0)}
          </Text>
          <Text className="font-semibold text-accent"> / giờ</Text>
        </View>

        {isOwnerMode ? (
          <>
            <Button className="flex-1 rounded-full" variant="secondary" onPress={handleEditBike}>
              <Text>Sửa xe</Text>
            </Button>
            <Button
              className="flex-1 rounded-full"
              variant="destructive"
              onPress={handleDeleteBike}
              disabled={isDeleting}>
              <Text>{isDeleting ? 'Đang xóa...' : 'Xóa xe'}</Text>
            </Button>
          </>
        ) : (
          <Button className="flex-1 rounded-full" variant="secondary" onPress={handleBookPress}>
            <Text>Đặt xe</Text>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
