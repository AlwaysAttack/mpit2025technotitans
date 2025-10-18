// app/mainpages/driver.tsx
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { View, Dimensions, Animated } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Menu, Share, Navigation } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useColorScheme } from 'nativewind';
import { AppLogo } from '../components/AppLogo';
import { SideMenu } from '../components/SideMenu';
import MapComponent from '../components/MapComponent';
import { useMapNavigation } from '../hooks/useMapNavigation';
import { DriverPanel } from '../components/DriverPanel';
import { useDriverPanel } from '../hooks/useDriverPanel';
import { useOrderSync } from '../hooks/useOrderSync';
import { Order } from '../types/order';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DriverScreen() {
  const [topPanelOpacity] = useState(new Animated.Value(1));
  const [locationGranted, setLocationGranted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { colorScheme } = useColorScheme();

  const { mapState, mapRef, updateUserLocation, centerMapOnUser, calculateRoute } = useMapNavigation();
  const { state: panelState, send: sendPanel, context, updateContext } = useDriverPanel();

  // -------------------- Используем useOrderSync --------------------
  const { orders: incomingOrders, addOrder, acceptOrder } = useOrderSync();

  const handleShowRoute = (startLocation: { latitude: number; longitude: number }, endLocation: { latitude: number; longitude: number }) => {
    console.log('🗺️ Показываем маршрут на карте');
    calculateRoute(startLocation, endLocation);
    
    // Автовыравнивание карты на маршрут
    setTimeout(() => {
      if (mapRef.current) {
        const coordinates = [startLocation, endLocation];
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }
    }, 500);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        await getCurrentLocation(); // сразу вызываем
      } else {
        console.log('❌ Доступ к геолокации запрещён');
        setLocationGranted(false);
      }
    })();
  }, []);
  
  

  const TOP_PANEL_HEIGHT = 100;
  const mapPadding = {
    top: TOP_PANEL_HEIGHT,
    bottom: panelState === 'idle' ? SCREEN_HEIGHT * 0.7 : SCREEN_HEIGHT * 0.4,
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

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    updateContext({ mapState });
  }, [mapState, updateContext]);

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
  

  const handleAcceptOrder = (order: Order) => {
    console.log('✅ Принял заказ:', order.id);
    acceptOrder(order.id);
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className={`flex-1 ${colors.background}`}>
        <MapComponent
          ref={mapRef}
          data={mapState}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          mapPadding={mapPadding}
          showUserLocation={true}
          onMapReady={() => console.log('Driver map ready')}
        />

        <View className="flex-1 justify-end">
          <Animated.View style={{ opacity: topPanelOpacity }} className={`mx-4 mb-2 p-4 rounded-2xl shadow-lg ${colors.card}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-sm ${colors.textSecondary}`}>Текущее местоположение</Text>
                <Text className={`text-lg font-semibold ${colors.textPrimary}`}>
                  {mapState.currentAddress || 'Определение адреса...'}
                </Text>
              </View>
              <Button size="icon" onPress={centerMapOnUser} className={`rounded-full shadow-lg ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                <Icon as={Navigation} className={`size-5 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`} />
              </Button>
            </View>
          </Animated.View>

          <DriverPanel
            panelState={panelState}
            sendPanel={sendPanel}
            panelContext={context}
            mapState={mapState}
            incomingOrders={incomingOrders}
            onAcceptOrder={handleAcceptOrder}
            onShowRoute={handleShowRoute}
          />
        </View>

        {!locationGranted && (
          <View className="absolute top-20 left-4 right-4 bg-gray-800 p-3 rounded-lg">
            <Text className="text-white text-center">
              Разрешите доступ к геолокации для определения вашего местоположения
            </Text>
          </View>
        )}

        <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </View>
    </>
  );
}
