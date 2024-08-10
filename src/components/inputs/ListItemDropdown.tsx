import { Actionsheet, Box, HStack, Icon, Input, Pressable, Text } from 'native-base';
import { useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useColors from '~/hooks/useColors';
import useSpaces from '~/hooks/useSpaces';

export type Props = {
  label: string;
  options: { value: string; label: string }[];
  onPress?: (x: string) => void;
  defaultValue?: string;
  value?: string;
};

function ListItemDropdown({ options, label = '', value = '', defaultValue = '', onPress = () => {} }: Props) {
  const [val, setVal] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { colors } = useColors();
  const { settingsListItemMargin } = useSpaces();

  const handleOnPress = (v: string) => {
    onPress(v);
    onClose();
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={onOpen}
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
              name="arrow-drop-down"
            />
          </Box>
        </HStack>
      </Pressable>
      <Actionsheet
        isOpen={isOpen}
        onClose={onClose}
      >
        <Actionsheet.Content>
          {options.map(({ value: v, label: l }) => (
            <Actionsheet.Item
              key={`dropdown_${v}`}
              onPress={() => handleOnPress(v)}
            >
              {l}
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}

export default ListItemDropdown;
