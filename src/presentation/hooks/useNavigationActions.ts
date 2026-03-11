import { useNavigation } from '@react-navigation/native';

export const useNavigationActions = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return {
    handleBackPress,
  };
};
