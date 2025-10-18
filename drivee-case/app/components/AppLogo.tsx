// app/components/AppLogo.tsx
import { View, Image } from 'react-native';
import { useThemeLogo } from '../hooks/useThemeLogo';

export function AppLogo() {
  const logoSource = useThemeLogo();
  
  return (
    <View className="items-center justify-center">
      <Image 
        source={logoSource} 
        style={{ width: 80, height: 24 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default AppLogo;