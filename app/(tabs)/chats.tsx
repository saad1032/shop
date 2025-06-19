import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const DUMMY_CHATS = [
  {
    id: '1',
    name: 'Family Group',
    lastMessage: 'See you at dinner!',
    time: '8:45 PM',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    group: true,
  },
  {
    id: '2',
    name: 'Friends',
    lastMessage: "Let's meet at 7?",
    time: '7:30 PM',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    group: true,
  },
  {
    id: '3',
    name: 'Alice',
    lastMessage: 'Thanks for the help!',
    time: '6:10 PM',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    group: false,
  },
  {
    id: '4',
    name: 'Bob',
    lastMessage: 'No problem!',
    time: '5:55 PM',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    group: false,
  },
];

const GROUP_CALL_HEIGHT = 80;

export default function ChatsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showGroupCall, setShowGroupCall] = useState(false);
  const pullAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = () => {
    setRefreshing(true);
    Animated.timing(pullAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowGroupCall(true);
      setTimeout(() => {
        setShowGroupCall(false);
        pullAnim.setValue(0);
        setRefreshing(false);
      }, 1500);
    });
  };

  const renderGroupCall = () => (
    <Animated.View
      style={[
        styles.groupCallContainer,
        {
          opacity: pullAnim,
          transform: [
            {
              translateY: pullAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-GROUP_CALL_HEIGHT, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.groupCallButton}
        onPress={() => Alert.alert('Group Call', 'Start a group call!')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="call" size={28} color="#fff" />
        <Text style={styles.groupCallText}>Start Group Call</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.chatRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.time}>{item.time}</Text>
        {item.group && (
          <Ionicons name="people" size={20} color="#4F8EF7" style={{ marginTop: 4 }} />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {showGroupCall && renderGroupCall()}
      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F8EF7"
            title="Pull to reveal group call"
            titleColor="#4F8EF7"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  groupCallContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: GROUP_CALL_HEIGHT,
    backgroundColor: '#4F8EF7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  groupCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F8EF7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
  },
  groupCallText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  lastMessage: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  time: {
    fontSize: 13,
    color: '#aaa',
  },
}); 