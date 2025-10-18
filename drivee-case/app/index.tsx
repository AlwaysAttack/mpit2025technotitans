import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPress={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

const SCREEN_OPTIONS = {
  title: 'Запуск',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export default function Screen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const handleAccount1 = () => {
    router.push('/mainpages/driver');
  };

  const handleAccount2 = () => {
    router.push('/mainpages/passenger');
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        
        <Text className="text-xl font-bold mb-4">Выберите тип аккаунта</Text>
        
        <View className="flex-column gap-4">
          <Button onPress={handleAccount1} className="w-40">
            <Text>Водитель</Text>
          </Button>
          
          <Button onPress={handleAccount2} className="w-40">
            <Text>Пассажир</Text>
          </Button>
        </View>
      </View>
    </>
  );
}