import { Button, Icon, IconButton, Select } from 'native-base';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { v4 as uuidv4 } from 'uuid';
import useColors from '~/hooks/useColors';

export type Props = {
  week: number;
  onChangeWeek: (w: number) => void;
  totalWeeks?: number;
};

const EmptyIcon = () => <></>;

function WeekSelector({ week, totalWeeks = 1, onChangeWeek }: Props) {
  const { t } = useTranslation();
  const { colors } = useColors();
  const weeks = [...Array(totalWeeks || 1).keys()];

  const onSelect = (w: string) => {
    const weekNumber = parseInt(w, 10);
    onChangeWeek(weekNumber);
  };

  const onPrevWeek = () => {
    if (week > 1) {
      const prevWeek = week - 1;
      onChangeWeek(prevWeek);
    }
  };

  const onNextWeek = () => {
    if (week < weeks.length) {
      const nextWeek = week + 1;
      onChangeWeek(nextWeek);
    }
  };

  return (
    <Button.Group
      isAttached
      justifyContent="space-between"
      bg={colors.bg30}
      borderLeftRadius={10}
      borderRightRadius={10}
      width="100%"
    >
      <IconButton
        onPress={onPrevWeek}
        borderLeftRadius={10}
        icon={
          <Icon
            as={MaterialIcons}
            name="chevron-left"
            color={colors.txt}
          />
        }
      />
      <Select
        selectedValue={`${week}`}
        dropdownIcon={<EmptyIcon />}
        onValueChange={onSelect}
        marginTop={1}
        width={100}
        borderWidth={0}
        textAlign="center"
      >
        {weeks.map((w) => (
          <Select.Item
            key={uuidv4()}
            label={t('weekSelector.weekNumber', { number: `${w + 1}` })}
            value={`${w + 1}`}
          />
        ))}
      </Select>
      <IconButton
        onPress={onNextWeek}
        borderRightRadius={10}
        icon={
          <Icon
            as={MaterialIcons}
            name="chevron-right"
            color={colors.txt}
          />
        }
      />
    </Button.Group>
  );
}

export default WeekSelector;
