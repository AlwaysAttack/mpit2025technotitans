import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Car, ArrowLeft, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function DriverScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'Режим водителя',
          headerShown: true,
          headerLeft: () => (
            <Button
              size="icon"
              variant="ghost"
              onPress={() => router.replace('/')} // Возврат на index, а не back
            >
              <Icon as={ArrowLeft} className="size-5" />
            </Button>
          ),
        }} 
      />
      <View className={`flex-1 ${colors.background} justify-center items-center p-6`}>
        <Icon as={Car} className="size-24 mb-6 text-blue-500" />
        <Text className={`text-3xl font-bold mb-4 ${colors.textPrimary}`}>
          Режим водителя
        </Text>
        <Text className={`text-lg text-center mb-8 ${colors.textSecondary}`}>
          Здесь будет функционал для приёма заказов и управления поездками
        </Text>
        
        <View className="w-full gap-4">
          <Button
            variant="outline"
            className="w-full"
            onPress={() => router.replace('/')}
          >
            <Icon as={User} className="size-5 mr-2" />
            <Text>Сменить на режим пассажира</Text>
          </Button>
        </View>
      </View>
    </>
  );
}