import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Box, Icon, Input, Text } from 'native-base';
import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useColors from '~/hooks/useColors';
import useSpaces from '~/hooks/useSpaces';

export type Props = {
  label: string;
  onChange: (val: Date) => void;
  value?: Date;
  showIcon?: boolean;
};

function TimeInput({ label, onChange, value, showIcon = false }: Props) {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { colors } = useColors();
  const { inputPadding } = useSpaces();

  const openDatePicker = () => {
    setIsOpen(true);
  };

  const closeDate = () => {
    setIsOpen(false);
  };

  const changeDate = (d: Date) => {
    setDate(d);
    onChange(d);
    closeDate();
  };

  // Note: Value returns string from loading data, because the dates loads back as strings
  const parseDate = typeof value === 'string' ? new Date(value) : value;
  const formatTime = !parseDate ? '' : format(parseDate, 'h:mm aaa', { locale: es });
  const inputIcon = showIcon ? (
    <Icon
      as={MaterialIcons}
      name="access-time"
      size="md"
      color={colors.txt80}
      marginRight={2}
    />
  ) : (
    <></>
  );

  return (
    <Box
      margin={2}
      minWidth="150"
    >
      <Text
        fontSize="xs"
        color={colors.txt60}
      >
        {label}
      </Text>
      <Input
        onFocus={openDatePicker}
        value={formatTime}
        InputRightElement={inputIcon}
        backgroundColor={colors.bg30}
        borderWidth={0}
        borderRadius={5}
        padding={inputPadding}
        _focus={{
          borderWidth: 1,
          borderColor: colors.txt80,
          backgroundColor: colors.bg30
        }}
      />
      <DatePicker
        modal
        open={isOpen}
        date={date || new Date()}
        onConfirm={changeDate}
        onCancel={closeDate}
        mode="time"
      />
    </Box>
  );
}

export default TimeInput;
