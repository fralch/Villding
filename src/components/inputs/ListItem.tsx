import { Box, HStack, Icon, Input, Pressable, Text } from 'native-base';
import { useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserInfo } from '~/@types/data';
import useColors from '~/hooks/useColors';
import useSpaces from '~/hooks/useSpaces';

export type Props = {
  type?: UserInfo;
  label: string;
  onPress?: (x: UserInfo | undefined) => void;
  defaultValue?: string;
  value?: string;
  icon?: string;
};

function ListItem({ type, label = '', value = '', defaultValue = '', onPress = () => {}, icon = '' }: Props) {
  const [val, setVal] = useState<string>(defaultValue);
  const { colors } = useColors();
  const { settingsListItemMargin } = useSpaces();

  const handleOnPress = () => {
    onPress(type);
  };

  const iconName = icon || 'edit';
  return (
    <Pressable
      onPress={handleOnPress}
      margin={2}
    >
      <HStack justifyContent="space-between">
        <Text>{label}</Text>
        <Box flexDirection="row">
          <Input
            onChangeText={setVal}
            color={colors.txt60}
            marginRight={4}
            value={value || val}
            borderWidth={0}
            width={40}
            isDisabled
            _disabled={{
              opacity: 0.75
            }}
            _input={{
              textAlign: 'right',
              verticalAlign: 'top',
              marginTop: settingsListItemMargin
            }}
          />
          <Icon
            size="md"
            as={MaterialIcons}
            name={iconName}
          />
        </Box>
      </HStack>
    </Pressable>
  );
}

export default ListItem;
