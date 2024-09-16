// src/components/Hamburguesa.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

export default function Hamburguesa(props: any) {
  const route = useRoute();
  const { project } = route.params as { project: any };
  console.log(project.image); //file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540fralch%252FVillding/ImagePicker/5ce7cbe5-df9f-493e-b143-c450237822c3.jpeg

  return (
    <View style={{ flex: 1, backgroundColor: '#05222F' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#05222F',
          paddingTop: 30,
          paddingHorizontal: 20,
        }}
      >
        <Image
          source={require('../assets/images/logo-tex-simple_white.png')}
          style={{
            borderRadius: 8,
            width: '50%',
            height: 60,
            resizeMode: 'contain',
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: '#0A455E',
          paddingTop: 0,
          paddingBottom: 20,
        }}
      >
        <Image
          source={{ uri: project.image }}
          style={{
            width: '100%',
            height: 200,
            resizeMode: 'contain',
            paddingHorizontal: 0,
            marginTop: 5,
          }}
        />
        <Text
          style={{ color: '#FFF', fontWeight: 'bold', paddingHorizontal: 20 }}
        >
          {project.title}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {project.subtitle}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {project.company}
        </Text>
      </View>

      <List.Item
        title='Editar proyecto'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='pencil'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />
      <List.Item
        title='Administrar acceso'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='account'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />
      <List.Item
        title='Configurar proyecto'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='cog'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />

      <Divider style={{ backgroundColor: '#0A455E' }} />

      <List.Item
        title='Ver notas'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='book'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />

      <View style={{ marginTop: 'auto' }}>
        <List.Item
          title='Ver proyectos'
          titleStyle={{ color: '#FFF' }}
          style={{ marginLeft: 20 }}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}
