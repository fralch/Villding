import { Input } from 'native-base';
import useColors from '~/hooks/useColors';

export type Props = {
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
};

function TitleInput({ onChange, placeholder, value }: Props) {
  const { colors } = useColors();
  return (
    <Input
      onChangeText={onChange}
      placeholder={placeholder}
      value={value}
      fontSize={24}
      backgroundColor="transparent"
      borderWidth={0}
      borderBottomWidth={1}
      borderColor={colors.txt60}
      width="90%"
      alignSelf="center"
      _focus={{
        backgroundColor: 'transparent'
      }}
    />
  );
}

export default TitleInput;
