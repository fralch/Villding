import { Box, HStack, Icon, Switch, Text } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { v4 as uuidv4 } from 'uuid';

export type Props = {
  id: string;
  icon: string;
  label: string;
  value: boolean;
  onToggle: any;
};

function ToggleItem({ id, icon, label, value, onToggle }: Props) {
  const handleToggle = (val: boolean) => {
    onToggle(id, val);
  };
  return (
    <Box
      key={uuidv4()}
      display="flex"
      justifyContent="space-between"
      margin={5}
      flexDir="row"
    >
      <HStack space={3}>
        <Icon
          as={MaterialIcons}
          name={icon}
          mt={1}
          size="md"
        />
        <Text textAlign="left">{label}</Text>
      </HStack>
      <Switch
        onToggle={handleToggle}
        value={value}
        size="sm"
      />
    </Box>
  );
}

export default ToggleItem;
