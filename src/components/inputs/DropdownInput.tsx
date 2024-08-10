import { Box, Select, Text } from 'native-base';
import { v4 } from 'uuid';
import useColors from '~/hooks/useColors';

export type Props = {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  value?: string;
  label?: string;
};

function DropdownInput({ options, onSelect, value, label = '' }: Props) {
  const { colors } = useColors();
  return (
    <Box margin={2}>
      <Text
        fontSize="xs"
        color={colors.txt60}
      >
        {label}
      </Text>
      <Select
        onValueChange={onSelect}
        defaultValue={value}
        backgroundColor={colors.bg30}
        borderWidth={0}
        borderRadius={5}
        padding={3}
      >
        {options.map(({ value: v, label: l }) => (
          <Select.Item
            key={v4()}
            value={v}
            label={l}
          />
        ))}
      </Select>
    </Box>
  );
}

export default DropdownInput;
