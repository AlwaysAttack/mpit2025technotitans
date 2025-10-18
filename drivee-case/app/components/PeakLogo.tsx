import { View, Image } from 'react-native';

export function PeakLogo() {
  return (
    <View className="items-center justify-center">
      <Image 
        source={require('../../assets/images/peak_logo.png')} // Use alias
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default PeakLogo;