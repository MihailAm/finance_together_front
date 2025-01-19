import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { AccountSchema } from '../types/AccountSchema'; // Типы для аккаунтов

interface AccountSliderProps {
  accounts: AccountSchema[];
}

const { width } = Dimensions.get('window'); // Получаем ширину экрана

const AccountSlider: React.FC<AccountSliderProps> = ({ accounts }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Индекс текущей карточки

  // Функция для обработки изменения позиции прокрутки
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index); // Устанавливаем текущую карточку
    }
  });

  const renderAccount = ({ item }: { item: AccountSchema }) => (
    <View style={styles.card}>
      {/* Можно добавить иконку или картинку для карточки */}
      <Image
        source={require('../../assets/card.png')} // Путь к иконке карты (например, изображение карты)
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.account_name}</Text>
        <Text style={styles.cardBalance}>${item.balance}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        snapToInterval={width} // Каждая карточка будет занимать всю ширину экрана
        decelerationRate="fast" // Плавная прокрутка
        snapToAlignment="center" // Центрируем карточку
        pagingEnabled={true} // Включаем постраничную прокрутку
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50, // Считаем элемент видимым, если более 50% карты в пределах экрана
        }}
      />
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          {currentIndex + 1} / {accounts.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width - 40, // Карточка будет шириной экрана минус отступы
    marginHorizontal: 10, // Отступы между карточками
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200, // Ограничиваем высоту карточки
  },
  cardImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardBalance: {
    fontSize: 16,
    color: '#4CAF50', // Зеленый цвет для баланса
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AccountSlider;
