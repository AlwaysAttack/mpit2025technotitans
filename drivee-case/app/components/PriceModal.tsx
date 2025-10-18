import React, { useState, useRef } from 'react';
import { Modal, View, TextInput, TouchableWithoutFeedback, PanResponder, Dimensions, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RussianRuble, CreditCard, Check, ChevronDown, X, Crown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { PeakLogo } from '../components/PeakLogo';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75; // 75% высоты экрана

interface PriceModalProps {
  visible: boolean;
  onClose: () => void;
  onPriceSubmit: (price: number) => void;
}

export function PriceModal({ visible, onClose, onPriceSubmit }: PriceModalProps) {

    // Анимация открытия/закрытия
    React.useEffect(() => {
      if (visible) {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      } else {
        Animated.spring(translateY, {
          toValue: MODAL_HEIGHT,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    }, [visible]);

  const [price, setPrice] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('Карта 1');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textAccent: colorScheme === 'dark' ? 'text-black' : 'text-white',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    input: colorScheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900',
  };

  // Простой обработчик свайпа вниз
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 50) { // Если свайпнули вниз более 50px
        onClose();
      }
    },
  });

    // Закрытие модалки
    const handleClose = () => {
      Animated.spring(translateY, {
        toValue: MODAL_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start(() => onClose());
    };

  const handleSubmit = () => {
    const numericPrice = parseInt(price);
    if (numericPrice >= 60) {
      onPriceSubmit(numericPrice);
      handleClose();
      setPrice('');
    }
  };

  const isSubmitDisabled = !price || parseInt(price) < 60;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true} // Делаем модалку прозрачной
      onRequestClose={onClose}
    >
      {/* Затемненный фон */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      {/* Контент модалки */}
      <View 
        className={`${colors.background} rounded-t-3xl overflow-hidden absolute bottom-0 left-0 right-0`}
        style={{ 
          height: MODAL_HEIGHT,
        }}
      >
        {/* Хедер с возможностью свайпа */}
        <View 
          className="items-center py-3"
          {...panResponder.panHandlers}
        >
          <View className="w-12 h-1 bg-gray-400 rounded-full" />
        </View>

        {/* Кнопка закрытия */}
        <View className="absolute top-4 right-4 z-10">
          <Button
            size="icon"
            variant="ghost"
            onPress={onClose}
          >
            <Icon as={X} className={`size-5 ${colors.textPrimary}`} />
          </Button>
        </View>

        <View className="flex-1 p-6">
          {/* Заголовок */}
          <View className="mb-6">
            <Text className={`text-2xl font-bold mb-2 ${colors.textPrimary}`}>
              Укажите вашу цену
            </Text>
          </View>

          {/* Поле ввода цены */}
          <View className={`rounded-2xl p-4 mb-4 ${colors.card}`}>
            <View className="flex-row items-center justify-center">
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Минимум - 60₽"
                placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                keyboardType="numeric"
                className={`flex-1 text-lg ${colors.textPrimary}`}
                style={{ fontSize: 18 }}
              />
              <Icon as={RussianRuble} className={`size-5 ml-2 ${colors.textPrimary}`} />
            </View>
            {price && parseInt(price) < 60 && (
              <Text className="text-red-500 text-xs mt-1">
                Минимальная цена 60₽
              </Text>
            )}
          </View>

          {/* Кнопки в одном ряду */}
          <View className="flex-row gap-3 mb-6">
            {/* Кнопка Peak-цена */}
            <Button 
              variant="ghost"
              className={`flex-1 rounded-2xl ${colorScheme === 'dark' ? 'bg-white' : 'bg-gray-900'}`}
            >
              <View className="flex-row items-center justify-center gap-1">
                <Text className={`text-sm font-semibold ${colors.textAccent}`}>Peak-цена</Text>
                <PeakLogo />
              </View>
            </Button>

            {/* Кнопка Способы оплаты */}
            <Button 
              variant="ghost"
              className={`flex-1 rounded-2xl ${colors.card}`}
              onPress={() => setShowPaymentMenu(!showPaymentMenu)}
            >
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center">
                  <Icon as={CreditCard} className={`size-4 mr-2 ${colors.textPrimary}`} />
                  <Text className={`text-sm ${colors.textPrimary}`}>{selectedPayment}</Text>
                </View>
                <Icon as={ChevronDown} className={`size-4 ${colors.textPrimary}`} />
              </View>
            </Button>
          </View>

          {/* Выпадающее меню оплаты */}
          {showPaymentMenu && (
            <View className={`rounded-2xl p-3 mb-4 ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <Button
                variant="ghost"
                className="justify-start w-full py-3"
                onPress={() => {
                  setSelectedPayment('Карта 1');
                  setShowPaymentMenu(false);
                }}
              >
                <Text className={colors.textPrimary}>Карта 1 •••• 1234</Text>
              </Button>
              <Button
                variant="ghost"
                className="justify-start w-full py-3"
                onPress={() => {
                  setSelectedPayment('Карта 2');
                  setShowPaymentMenu(false);
                }}
              >
                <Text className={colors.textPrimary}>Карта 2 •••• 5678</Text>
              </Button>
            </View>
          )}

          {/* Разделитель */}
          <View className="border-t border-gray-700 mb-4" />

          {/* Кнопка Готово */}
          <Button
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            className={`rounded-2xl justify-center ${isSubmitDisabled ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <View className="flex-row items-center justify-center">
              <Icon as={Check} className="size-5 text-white mr-2" />
              <Text className="text-white text-lg font-semibold">Готово</Text>
            </View>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

export default PriceModal;