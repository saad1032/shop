import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getCategories } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface Category {
  id: number;
  name: string;
}

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, logout } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    getCategories()
      .then(res => {
        const valid = Array.isArray(res.data.data)
          ? res.data.data.filter((cat: any) => cat && cat.id && cat.name)
          : [];
        setCategories(valid);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleCategoryPress = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/category',
      params: { id: category.id, name: category.name },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (user) {
      // User is logged in, show logout option
      handleLogout();
    } else {
      // User is not logged in, navigate to login page
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading your shopping experience...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <Animated.View 
          style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Profile/Logout Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.profileButtonGradient}
            >
              <Ionicons 
                name={user ? "person" : "person-outline"} 
                size={20} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.iconBackground}
            >
              <Ionicons name="shirt-outline" size={32} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.heroTitle}>TrendyWear</Text>
          <Text style={styles.heroSubtitle}>Discover Your Style</Text>
          <Text style={styles.heroDescription}>
            {user ? `Welcome back, ${user.name}! Explore our curated collection` : 'Welcome! Sign in to personalize your experience'}
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <Animated.View 
          style={[
            styles.sectionHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.sectionDivider} />
        </Animated.View>

        <FlatList
          data={categories}
          keyExtractor={item => item.id?.toString?.() ?? Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: Category; index: number }) =>
            item && item.name ? (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20 * (index + 1)]
                      })
                    }
                  ]
                }}
              >
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => handleCategoryPress(item)}
                >
                  <BlurView intensity={20} style={styles.cardBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.categoryIconContainer}>
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.categoryIcon}
                        >
                          <Ionicons name="pricetag" size={24} color="white" />
                        </LinearGradient>
                      </View>
                      
                      <View style={styles.categoryContent}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categorySubtext}>
                          Explore {item.name.toLowerCase()} collection
                        </Text>
                      </View>
                      
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#667eea" 
                        style={styles.chevron}
                      />
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ) : null
          }
          ListEmptyComponent={
            <Animated.View 
              style={[
                styles.emptyContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.emptyIcon}
                >
                  <Ionicons name="alert-circle-outline" size={32} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>No Categories Found</Text>
              <Text style={styles.emptyText}>
                Please check your connection or add categories in Strapi.
              </Text>
            </Animated.View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  heroSection: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  sectionDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  listContainer: {
    paddingBottom: 40,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  categoryIconContainer: {
    marginRight: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  categorySubtext: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  profileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
