import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { View, Dimensions, TextInput, Modal, TouchableOpacity, FlatList, Alert, Animated } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Menu, Share, Navigation, Car, MapPin, Clock, Dot, SlidersHorizontalIcon, RussianRuble, X, Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useColorScheme } from 'nativewind';
import { PriceModal } from '../components/PriceModal';
import { AppLogo } from '../components/AppLogo';
import { SideMenu } from '../components/SideMenu';
import MapComponent from '../components/MapComponent';
import { useMapNavigation } from '../hooks/useMapNavigation';
import { OrderConfirmDialog } from '../components/OrderConfirmDialog';
import { PassengerPanel } from '../components/PassengerPanel';
import { usePassengerPanel } from '../hooks/usePassengerPanel';
import { useOrderSync } from '../hooks/useOrderSync';
import { useWebSocket } from '../hooks/useWebSocket';
import { Order } from '../types/order';



const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type AddressSuggestion = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};

type TripType = 'ride' | 'intercity' | 'courier';

export default function Account2Screen() {
  const { removeOrder } = useOrderSync();
  // Анимация для верхней панели
  const [topPanelOpacity] = useState(new Animated.Value(1));
  const { sendOrder } = useWebSocket();
  const { addOrder: addOrderToGlobal } = useOrderSync();

  const animateTopPanel = (toValue: number) => {
    Animated.timing(topPanelOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const {
    mapState,
    mapRef,
    updateUserLocation,
    setDestination,
    setRoute,
    centerMapOnUser,
    fitMapToMarkers,
    clearDestination,
    calculateRoute
  } = useMapNavigation();

  let lastGeocodeTime = 0;
  const GEOCODE_DELAY = 1000; // 1 секунда между запросами


  const [locationGranted, setLocationGranted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPriceSheetOpen, setIsPriceSheetOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('Предложите цену');
  const [selectedTripType, setSelectedTripType] = useState<TripType>('ride');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const { colorScheme } = useColorScheme();

  // Используем хук панели в родительском компоненте
  const { state: panelState, send: sendPanel, context, updateContext, updatePrice } = usePassengerPanel({
    destination: mapState.destination,
    routeInfo: mapState.routeInfo,
  });

  const BOTTOM_PANEL_HEIGHT = 280;
  const TOP_PANEL_HEIGHT = 100;
  
  const mapPadding = {
    top: TOP_PANEL_HEIGHT,
    bottom: panelState === 'searching_driver' ? 0 : BOTTOM_PANEL_HEIGHT,
    left: 0,
    right: 0
  };

  const SCREEN_OPTIONS = {
    headerTitle: () => <AppLogo />,
    headerTransparent: true,
    headerLeft: () => (
      <Button size="icon" variant="ghost" onPress={() => setIsMenuOpen(true)}>
        <Icon as={Menu} className="size-5" />
      </Button>
    ),
    headerRight: () => (
      <Button size="icon" variant="ghost">
        <Icon as={Share} className="size-5" />
      </Button>
    ),
    headerBackVisible: false
  };

  const handlePriceFieldPress = () => {
    setIsPriceSheetOpen(true);
  };
  
  const handlePriceSubmit = (price: number) => {
    console.log('💰 Parent received price:', price);
    setSelectedPrice(`${price}₽`);
    setIsPriceSheetOpen(false);
  };

  const handleStartOrder = () => {
    console.log('🔄 Opening order confirmation dialog');
    setIsOrderConfirmOpen(true);
  };

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    button: colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
    buttonActive: colorScheme === 'dark' ? 'bg-gray-600' : 'bg-white',
    primary: 'bg-green-500',
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        getCurrentLocation();
      }
    })();
  }, []);

  // Обновляем контекст при изменении mapState
  useEffect(() => {
    updateContext({
      destination: mapState.destination,
      routeInfo: mapState.routeInfo,
    });
  }, [mapState.destination, mapState.routeInfo, updateContext]);

  // Обновляем цену при изменении selectedPrice
  useEffect(() => {
    if (selectedPrice && selectedPrice !== 'Предложите цену') {
      const numericPrice = parseInt(selectedPrice.replace('₽', ''));
      if (!isNaN(numericPrice)) {
        updatePrice(numericPrice);
      }
    }
  }, [selectedPrice, updatePrice]);

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    // Задержка между запросами (требование Nominatim)
    const now = Date.now();
    if (now - lastGeocodeTime < GEOCODE_DELAY) {
      await new Promise(resolve => setTimeout(resolve, GEOCODE_DELAY - (now - lastGeocodeTime)));
    }
    lastGeocodeTime = Date.now();
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YourRideApp/1.0',
            'Accept': 'application/json',
          }
        }
      );

      
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
  
      const text = await response.text();
      
      // Проверяем, не является ли ответ HTML
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.warn('⚠️ Nominatim returned HTML instead of JSON');
        throw new Error('HTML response received');
      }
  
      const data = JSON.parse(text);
      
      if (data && data.display_name) {
        // Пытаемся получить более читаемый адрес
        const address = data.display_name.split(',').slice(0, 3).join(', ');
        return address;
      }
      return 'Адрес не найден';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      
      // Fallback адрес на основе координат
      return `Ш: ${latitude.toFixed(4)}, Д: ${longitude.toFixed(4)}`;
    }
  };
  
  

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      
      // Сначала обновляем координаты
      updateUserLocation(
        { latitude, longitude },
        'Определение адреса...'
      );
  
      // Затем пытаемся получить адрес асинхронно
      setTimeout(async () => {
        try {
          const address = await reverseGeocode(latitude, longitude);
          updateUserLocation(
            { latitude, longitude },
            address
          );
        } catch (geocodeError) {
          console.log('Geocoding failed, using coordinates:', geocodeError);
          updateUserLocation(
            { latitude, longitude },
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
        }
      }, 0);
  
    } catch (error) {
      console.log('Error getting location:', error);
      updateUserLocation(null, 'Не удалось определить местоположение');
    }
  };

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ru`,
      {
        headers: {
          'User-Agent': 'YourRideApp/1.0', // обязательно указывать
          'Accept': 'application/json',
        },
      }
    );

    const text = await response.text();

    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn('⚠️ Nominatim вернул HTML вместо JSON, возможно блокировка запросов');
      setSearchResults([]);
      return;
    }

    const data: AddressSuggestion[] = JSON.parse(text);
    setSearchResults(data);

  } catch (error) {
    console.error('Error searching addresses:', error);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

  const selectAddress = (address: AddressSuggestion) => {
    console.log('📍 Address selected:', address.display_name);
    console.log('📍 User location:', mapState.userLocation);
    console.log('📍 Map ref available:', !!mapRef.current);
    console.log('📍 fitMapToMarkers available:', !!fitMapToMarkers);
  
    const newDestination = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
    };
  
    setDestination(newDestination, address.display_name.split(',')[0]);
    setIsSearchModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  
    if (mapState.userLocation) {
      console.log('🔄 Calculating route...');
      calculateRoute(mapState.userLocation, newDestination);
      
      // Автовыравнивание
      setTimeout(() => {
        console.log('🗺️ Attempting auto-fit...');
        
        // Проверяем что оба значения не null
        if (mapRef.current && mapState.userLocation) {
          console.log('✅ Using direct fitToCoordinates');
          const coordinates = [
            mapState.userLocation, // Это точно не null из условия выше
            newDestination
          ];
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          });
        } else if (fitMapToMarkers) {
          console.log('✅ Using fitMapToMarkers');
          fitMapToMarkers();
        } else {
          console.log('❌ Cannot auto-fit - missing requirements');
        }
      }, 1000);
    } else {
      console.log('❌ No user location available');
    }
  };
  
  
  

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    } else {
      return `${(meters / 1000).toFixed(1)} км`;
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} мин`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} ч ${remainingMinutes} мин`;
    }
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const tripTabs = [
    { id: 'ride' as TripType, label: 'Поездка' },
    { id: 'intercity' as TripType, label: 'Межгород' },
    { id: 'courier' as TripType, label: 'Курьер' },
  ];

  // Обработчик нажатия на кнопку "Заказать"
  const handleOrderPress = () => {
    if (!mapState.userLocation || !mapState.destination || !mapState.routeInfo) {
      Alert.alert('Ошибка', 'Пожалуйста, укажите пункт назначения');
      return;
    }

    if (selectedPrice === 'Предложите цену') {
      Alert.alert('Ошибка', 'Пожалуйста, укажите цену');
      return;
    }

    setIsOrderConfirmOpen(true);
  };

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Подтверждение заказа
  const handleOrderConfirm = () => {
    setIsOrderConfirmOpen(false);
    animateTopPanel(0);
  
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      passengerId: 'current-user-id',
      startAddress: mapState.currentAddress || '',
      endAddress: mapState.destinationAddress || '',
      startLocation: mapState.userLocation || { latitude: 0, longitude: 0 },
      endLocation: mapState.destination || { latitude: 0, longitude: 0 },
      distance: mapState.routeInfo?.distance || 0,
      duration: mapState.routeInfo?.duration || 0,
      price: parseInt(selectedPrice.replace('₽', '')) || 0,
      status: 'searching',
      createdAt: new Date(),
    };
  
    console.log('📝 Подтверждён заказ, данные:', order); // <-- проверка перед отправкой
  
    addOrderToGlobal(order); // 🟢 "Отправляем" заказ (в useOrderSync)
    setCurrentOrder(order);
    

    sendPanel({ type: 'CONFIRM_ORDER' });
  };

  // Отмена заказа
  const handleOrderCancel = () => {
    setIsOrderConfirmOpen(false);
    animateTopPanel(1);
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className={`flex-1 ${colors.background}`}>
        
        <MapComponent
          ref={mapRef}
          data={mapState}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          mapPadding={mapPadding}
          showUserLocation={true}
          onMapReady={() => console.log('Map ready')}
          onRegionChange={(region) => console.log('Region changed:', region)}
        />

        <View className="flex-1 justify-end">
          {/* Анимированный блок "Точка подачи" */}
          <Animated.View 
            style={{ opacity: topPanelOpacity }}
            className={`mx-4 mb-2 p-4 rounded-2xl shadow-lg ${colors.card}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-sm ${colors.textSecondary}`}>Точка подачи</Text>
                <Text className={`text-lg font-semibold ${colors.textPrimary}`}>
                  {mapState.currentAddress || 'Определение адреса...'}
                </Text>
              </View>
              
              <Button
                size="icon"
                onPress={centerMapOnUser}
                className={`rounded-full shadow-lg ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
              >
                <Icon as={Navigation} className={`size-5 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`} />
              </Button>
            </View>
          </Animated.View>

          <PassengerPanel
            mapState={mapState}
            currentOrder={currentOrder}
            selectedPrice={selectedPrice}
            onSearchPress={openSearchModal}
            onPricePress={handlePriceFieldPress}
            onClearDestination={clearDestination}
            onTripTypeChange={setSelectedTripType}
            onPriceSubmit={handlePriceSubmit}
            onStartOrder={handleStartOrder}
            formatDistance={formatDistance}
            formatDuration={formatDuration}
            panelState={panelState}
            sendPanel={sendPanel}
            panelContext={context}
            onCancelOrder={() => {
              if (currentOrder) removeOrder(currentOrder.id);
              setCurrentOrder(null);   
              sendPanel({ type: 'RESET' });      
            }}
          />
        </View>

        <Modal
  visible={isSearchModalOpen}
  animationType="slide"
  presentationStyle="pageSheet"
  onShow={() => console.log('🔍 Search modal opened')}
>
  <View className={`flex-1 ${colors.background}`}>
    <View className="flex-row items-center p-4 border-b border-gray-700">
      <Button
        size="icon"
        variant="ghost"
        onPress={() => {
          console.log('❌ Closing search modal');
          setIsSearchModalOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <Icon as={X} className="size-5" />
      </Button>
      <Text className="text-lg font-semibold ml-4 flex-1">Куда едем?</Text>
    </View>

    <View className="p-4">
      <View className={`flex-row items-center rounded-2xl px-4 py-3 ${colors.button}`}>
        <Icon as={Search} className={`size-5 mr-3 ${colors.textSecondary}`} />
        <TextInput
          value={searchQuery}
          onChangeText={(text) => {
            console.log('🔍 Search query:', text);
            setSearchQuery(text);
            searchAddresses(text);
          }}
          placeholder="Введите адрес..."
          placeholderTextColor={colors.textSecondary}
          className={`flex-1 text-lg ${colors.textPrimary}`}
          autoFocus
        />
      </View>
    </View>

    <FlatList
      data={searchResults}
      keyExtractor={(item) => item.place_id}
      renderItem={({ item }) => (
        <TouchableOpacity
          className={`p-4 border-b ${colors.border}`}
          onPress={() => {
            console.log('🎯 Address item pressed:', item.display_name);
            selectAddress(item);
          }}
        >
          <Text className={`text-lg ${colors.textPrimary}`}>
            {item.display_name.split(',').slice(0, 2).join(', ')}
          </Text>
          <Text className={`text-sm ${colors.textSecondary} mt-1`}>
            {item.display_name.split(',').slice(2).join(', ')}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        searchQuery && !isSearching ? (
          <Text className={`text-center p-4 ${colors.textSecondary}`}>
            Адрес не найден
          </Text>
        ) : null
      }
    />
  </View>
</Modal>

        {!locationGranted && (
          <View className="absolute top-20 left-4 right-4 bg-gray-800 p-3 rounded-lg">
            <Text className="text-white text-center">
              Разрешите доступ к геолокации для определения вашего местоположения
            </Text>
          </View>
        )}

<OrderConfirmDialog
  visible={isOrderConfirmOpen}
  onClose={handleOrderCancel}
  onConfirm={handleOrderConfirm}
  startAddress={mapState.currentAddress || 'Адрес не указан'}
  endAddress={mapState.destinationAddress || 'Адрес не указан'}
  distance={mapState.routeInfo ? formatDistance(mapState.routeInfo.distance) : 'Не рассчитано'}
  duration={mapState.routeInfo ? formatDuration(mapState.routeInfo.duration) : 'Не рассчитано'}
  price={selectedPrice}
  orderData={{
    passengerId: 'current-user-id',
    startLocation: mapState.userLocation || { latitude: 0, longitude: 0 },
    endLocation: mapState.destination || { latitude: 0, longitude: 0 },
    numericPrice: parseInt(selectedPrice.replace('₽', '')) || 0,
  }}
/>

        <PriceModal
          visible={isPriceSheetOpen}
          onClose={() => setIsPriceSheetOpen(false)}
          onPriceSubmit={handlePriceSubmit}
        />

        <SideMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      </View>
    </>
  );
}