import { useColorScheme } from 'nativewind';

export function useThemeLogo() {
  const { colorScheme } = useColorScheme();
  
  // Определяем какой логотип загружать в зависимости от темы
  return colorScheme === 'dark' 
    ? require('../../assets/images/Logo_DRV_light 2.png')  // светлый логотип для темной темы
    : require('../../assets/images/Logo_DRV 2.png');       // темный логотип для светлой темы
}

export default useThemeLogo;