import { Box, Input, SearchIcon } from 'native-base';
import useColors from '~/hooks/useColors';

export type Props = {
  onChange: (val: string) => void;
  placeholder?: string;
};

function SearchBar({ onChange = () => {}, placeholder = '' }: Props) {
  const { colors } = useColors();
  const onChangeText = (val: string) => onChange(val);

  return (
    <Box
      bg={colors.bg30}
      height={16}
      borderColor={colors.bg30}
    >
      <Input
        type="text"
        onChangeText={onChangeText}
        placeholder={placeholder}
        InputLeftElement={
          <SearchIcon
            margin={5}
            color={colors.txt80}
            size="md"
          />
        }
        focusOutlineColor={colors.bg20}
        height={16}
        width="100%"
        paddingY={0}
        borderWidth={0}
        fontSize={16}
      />
    </Box>
  );
}

export default SearchBar;
