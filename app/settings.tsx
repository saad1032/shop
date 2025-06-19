import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getUserTheme, setUserTheme } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const APP_VERSION = '1.0.0';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const res = await getUserTheme(token);
          if (res.data.theme) {
            setTheme(res.data.theme);
          }
        }
      } catch (e) {
        // fallback to local or default
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await setUserTheme(newTheme, token);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update theme on server.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature is coming soon!');
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    // Optionally sync with backend here
  };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Ionicons name="person-circle" size={48} color="#4F8EF7" style={{ marginRight: 16 }} />
          <View>
            <Text style={styles.profileName}>{user?.name || 'N/A'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.settingRow}>
          <Feather name="moon" size={22} color="#555" style={styles.icon} />
          <Text style={styles.label}>Dark Mode</Text>
          <View style={{ flex: 1 }} />
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            disabled={loading}
          />
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="notifications-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.label}>Notifications</Text>
          <View style={{ flex: 1 }} />
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
        </View>
      </View>

      {/* Security Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Security</Text>
        <TouchableOpacity style={styles.settingRowBtn} onPress={handleChangePassword}>
          <MaterialIcons name="lock-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.label}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingRowBtn, { marginTop: 8 }]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#e74c3c" style={styles.icon} />
          <Text style={[styles.label, { color: '#e74c3c' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>App Info</Text>
        <View style={styles.settingRowNoBorder}>
          <Feather name="info" size={20} color="#555" style={styles.icon} />
          <Text style={styles.label}>Version</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.value}>{APP_VERSION}</Text>
        </View>
        <View style={styles.settingRowNoBorder}>
          <Feather name="user" size={20} color="#555" style={styles.icon} />
          <Text style={styles.label}>Developer</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.value}>saad</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#f6f7fb',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4F8EF7',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  profileEmail: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
  value: {
    fontWeight: '600',
    color: '#555',
    fontSize: 16,
  },
});

export default SettingsScreen; 