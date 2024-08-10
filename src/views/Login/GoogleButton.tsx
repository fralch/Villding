import { Button, Icon, Text, View } from 'native-base';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '~/hooks/useColors';

function GoogleButton() {
  const { t } = useTranslation();
  const { colors } = useColors();
  return (
    <Button
      bgColor={colors.accent}
      margin={2}
    >
      <View
        justifyContent="center"
        flexDir="row"
      >
        <Icon
          as={MaterialCommunityIcons}
          name="google"
          color={colors.white}
        />
        <Text
          marginLeft={2}
          color={colors.white}
        >
          {t('loginScreen.googleLogin')}
        </Text>
      </View>
    </Button>
  );
}

export default GoogleButton;
