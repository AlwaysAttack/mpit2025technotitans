// components/SideMenu.tsx (с Reanimated)
import { Modal, View, TouchableWithoutFeedback } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { LogOut, X, SunIcon, MoonStarIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { useEffect } from 'react';


const THEME_ICONS = {
    light: SunIcon,
    dark: MoonStarIcon,
  };

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const translateX = useSharedValue(-300);

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-300, { duration: 300 });
    }
  }, [visible]);

  const handleLogout = () => {
    translateX.value = withTiming(-300, { duration: 300 }, () => {
      runOnJS(router.replace)('/');
    });
  };

  const handleClose = () => {
    translateX.value = withTiming(-300, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  function ThemeToggle() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
  
    return (
      <Button
        onPress={toggleColorScheme}
        size="icon"
        variant="ghost"
        className="ios:size-9 rounded-full web:mx-4 w-full">
        <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
      </Button>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 bg-black/50" />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={animatedStyle}
          className="absolute top-0 left-0 bottom-0 w-3/4"
        >
          <TouchableWithoutFeedback>
            <View className={`flex-1 ${colors.background} rounded-r-2xl shadow-2xl`}>
              {/* Заголовок и кнопка закрытия */}
              <View className="flex-row justify-between items-center p-6 border-b mt-10 border-gray-700">
                <Text className={`text-2xl font-bold  ${colors.textPrimary}`}>Drivee</Text>
                <View className='flex-row gap-3'>
                <ThemeToggle />
                <Button size="icon" variant="ghost" onPress={handleClose}>
                  <Icon as={X} className={`size-5 ${colors.textPrimary}`} />
                </Button>
                </View>
              </View>

              {/* Контент меню */}
              <View className="p-6 flex-1">
                
                <View className="flex-1 justify-start gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start w-full p-4 border border-red-300 rounded-xl bg-red-50 dark:bg-red-900/20"
                    onPress={handleLogout}
                  >
                    <Icon as={LogOut} className="size-5 mr-3 text-red-500" />
                    <Text className="text-red-500 text-lg font-semibold">Выйти</Text>
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default SideMenu;