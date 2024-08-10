import { Box, Center, Icon, Image, Pressable, Text } from 'native-base';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useColors from '~/hooks/useColors';

export type Props = {
  onChange: (photoData: Asset) => void;
  value?: Asset | (() => Asset);
  label?: string;
};

function PhotoPicker({ onChange, value, label }: Props) {
  const [photo, setPhoto] = useState<Asset | undefined>(value);
  const { t } = useTranslation();
  const { colors } = useColors();

  const attachPhoto = async () => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      const { assets } = res || {};
      if (assets) {
        const photoData = assets[0];
        setPhoto(photoData);
        onChange(photoData);
      }
    });
  };

  const { uri } = photo || {};

  return (
    <Box margin={3}>
      {label && (
        <Text
          fontSize="xs"
          color={colors.txt60}
        >
          {label}
        </Text>
      )}
      <Pressable onPress={attachPhoto}>
        <Box>
          {!uri && (
            <Center
              padding={5}
              borderStyle="dashed"
              borderColor="gray.500"
              borderWidth={2}
              height={200}
              borderRadius={10}
            >
              <Icon
                as={MaterialIcons}
                name="add-a-photo"
                size="xl"
              />
              <Text>{t('projectNewModal.photoUpload')}</Text>
            </Center>
          )}
          {uri && (
            <Center>
              <Image
                alt="Photo"
                source={{ uri }}
                size="2xl"
                marginTop={2}
                width="100%"
                borderRadius={10}
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                padding={3}
                backgroundColor={colors.bg30}
                opacity={90}
                borderTopRightRadius={10}
                borderBottomLeftRadius={10}
              >
                <Icon
                  as={MaterialIcons}
                  name="edit"
                  size="2xl"
                />
              </Box>
            </Center>
          )}
        </Box>
      </Pressable>
    </Box>
  );
}

export default PhotoPicker;
