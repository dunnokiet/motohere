import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pressable, ScrollView, View } from 'react-native';
import { Brand, BRANDS } from '../brands-list';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Text } from '../ui/text';

export function BrandFilterDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full border-primary">
          <Text>Hãng xe</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[90%] w-[380px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Hãng xe</DialogTitle>
        </DialogHeader>
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerClassName="gap-4">
            {BRANDS.map((brand: Brand) => {
              return (
                <Pressable key={brand.id} className="flex-row items-start gap-3">
                  <Checkbox checked={true} onCheckedChange={() => {}} />
                  <Label>{brand.name}</Label>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </DialogContent>
    </Dialog>
  );
}
