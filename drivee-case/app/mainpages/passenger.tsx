import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { View, Dimensions, TextInput, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
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
import { OrderConfirmDialog } from '../components/OrderConfirmDialog'; // Добавляем импорт

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type AddressSuggestion = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};

type TripType = 'ride' | 'intercity' | 'courier';

export default function Account2Screen() {
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

  const [locationGranted, setLocationGranted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPriceSheetOpen, setIsPriceSheetOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('Предложите цену');
  const [selectedTripType, setSelectedTripType] = useState<TripType>('ride');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false); // Новое состояние для диалога
  const { colorScheme } = useColorScheme();

  const BOTTOM_PANEL_HEIGHT = 280;
  const TOP_PANEL_HEIGHT = 100;
  
  const mapPadding = {
    top: TOP_PANEL_HEIGHT,
    bottom: BOTTOM_PANEL_HEIGHT,
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
    setSelectedPrice(`${price}₽`);
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

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressParts = data.display_name.split(',');
        return addressParts.slice(0, 2).join(', ');
      }
      return 'Адрес не найден';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Ошибка определения адреса';
    }
  };

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const address = await reverseGeocode(latitude, longitude);
      
      updateUserLocation(
        { latitude, longitude },
        address
      );

    } catch (error) {
      console.log('Error getting location:', error);
      updateUserLocation(null, 'Не удалось определить адрес');
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ru`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (address: AddressSuggestion) => {
    const newDestination = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
    };

    setDestination(newDestination, address.display_name.split(',')[0]);
    setIsSearchModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);

    if (mapState.userLocation) {
      calculateRoute(mapState.userLocation, newDestination);
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
    // Проверяем, что все необходимые данные заполнены
    if (!mapState.userLocation || !mapState.destination || !mapState.routeInfo) {
      Alert.alert('Ошибка', 'Пожалуйста, укажите пункт назначения');
      return;
    }

    if (selectedPrice === 'Предложите цену') {
      Alert.alert('Ошибка', 'Пожалуйста, укажите цену');
      return;
    }

    // Открываем диалог подтверждения
    setIsOrderConfirmOpen(true);
  };

  // Подтверждение заказа
  const handleOrderConfirm = () => {
    // Закрываем диалог
    setIsOrderConfirmOpen(false);
    
    // Здесь можно добавить логику отправки заказа на сервер
    console.log('Заказ подтвержден:', {
      start: mapState.currentAddress,
      end: mapState.destinationAddress,
      distance: mapState.routeInfo?.distance,
      duration: mapState.routeInfo?.duration,
      price: selectedPrice
    });

    // Показываем уведомление об успешном заказе
    Alert.alert(
      'Успешно!', 
      'Ваш заказ принят. Ожидайте водителя.',
      [{ text: 'OK', onPress: () => console.log('Order confirmed') }]
    );

    // Можно также сбросить состояние после заказа
    // clearDestination();
    // setSelectedPrice('Предложите цену');
  };

  // Отмена заказа
  const handleOrderCancel = () => {
    setIsOrderConfirmOpen(false);
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
          <View className={`mx-4 mb-2 p-4 rounded-2xl shadow-lg ${colors.card}`}>
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
          </View>

          <View className={`min-h-0 rounded-t-3xl ${colors.card}`}>
            <View className="p-5">
              <View className={`flex-row rounded-2xl p-1 mb-4 ${colors.button}`}>
                {tripTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    className={`flex-1 rounded-xl ${
                      selectedTripType === tab.id ? colors.buttonActive : ''
                    }`}
                    onPress={() => setSelectedTripType(tab.id)}
                  >
                    <Text 
                      className={
                        selectedTripType === tab.id 
                          ? `font-semibold ${colors.textPrimary}`
                          : colors.textSecondary
                      }
                    >
                      {tab.label}
                    </Text>
                  </Button>
                ))}
              </View>

              <View className="gap-3 mb-4">
                <TouchableOpacity 
                  className={`flex-row items-center justify-between rounded-2xl p-3 ${colors.button}`}
                  onPress={openSearchModal}
                >
                  <View className="flex-row items-center flex-1">
                    <Icon as={MapPin} className={`size-4 ml-1 mr-2 ${colors.textSecondary}`} />
                    <View className="flex-row gap-2 justify-center items-center">
                      <Text 
                        className={`text-sm ${mapState.destination ? colors.textPrimary : colors.textSecondary}`}
                      >
                        {mapState.destinationAddress || 'Куда?'}
                      </Text>
                      {mapState.routeInfo && (
                        <Text className={`text-xs ${colors.textSecondary} mt-1`}>
                          {formatDistance(mapState.routeInfo.distance)}
                        </Text>
                      )}
                    </View>
                  </View>
                  {mapState.destination ? (
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        clearDestination();
                      }}
                      className="p-1"
                    >
                      <Icon as={X} className={`size-4 ${colors.textSecondary}`} />
                    </TouchableOpacity>
                  ) : (
                    <Icon as={Search} className={`size-4 mr-2 ${colors.textSecondary}`} />
                  )}
                </TouchableOpacity>

                <View 
                  className={`flex-row items-center justify-between rounded-2xl p-4 ${colors.button}`}
                  onTouchEnd={handlePriceFieldPress}
                >
                  <View>
                    <View className="flex-row items-center">
                      <Icon as={RussianRuble} className={`size-4 mr-2 ${colors.textPrimary}`} />
                      <Text className={`text-ls ${colors.textSecondary}`}>
                        {selectedPrice}
                      </Text>
                    </View>
                  </View>
                  <View />
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Button 
                  className={`flex-1 rounded-2xl h-15 ${colors.primary}`}
                  onPress={handleOrderPress} // Изменяем на handleOrderPress
                  disabled={!mapState.destination}
                >
                  <View className="flex-row items-center justify-center gap-1">
                    <Text className="text-white text-lg font-semibold">Заказать</Text>
                    <Icon as={Dot} className="size-5 text-white" />
                    <Text className="text-white text-lg">
                      {mapState.routeInfo ? formatDuration(mapState.routeInfo.duration) : ''}
                    </Text>
                  </View>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`rounded-2xl ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <Icon as={SlidersHorizontalIcon} className={`size-5 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`} />
                </Button>
              </View>
            </View>
          </View>
        </View>

        <Modal
          visible={isSearchModalOpen}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className={`flex-1 ${colors.background}`}>
            <View className="flex-row items-center p-4 border-b border-gray-200">
              <Button
                size="icon"
                variant="ghost"
                onPress={() => {
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
                  onPress={() => selectAddress(item)}
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