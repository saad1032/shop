import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getProductsByCategory } from '../api/api';

const { width, height } = Dimensions.get('window');
const STRAPI_BASE_URL = 'http://localhost:1337'; 

interface Product {
  id: number;
  title: string;
  price: number;
  
  image?: 
    | { url?: string; }[] 
    | { data?: { attributes?: { url?: string; formats?: any; } } }; 
  attributes?: {
    title?: string;
    price?: number;
    image?: {
      data?: {
        attributes?: {
          url?: string;
          formats?: {
            thumbnail?: { url?: string };
            small?: { url?: string };
            medium?: { url?: string };
            large?: { url?: string };
          };
        };
      };
    };
    images?: {
      data?: {
        attributes?: {
          url?: string;
          formats?: {
            thumbnail?: { url?: string };
            small?: { url?: string };
            medium?: { url?: string };
            large?: { url?: string };
          };
        };
      }[];
    };
    photo?: {
      data?: {
        attributes?: {
          url?: string;
          formats?: {
            thumbnail?: { url?: string };
            small?: { url?: string };
            medium?: { url?: string };
            large?: { url?: string };
          };
        };
      };
    };
  };
}

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    getProductsByCategory(id)
      .then(res => {
        console.log('Category API Response:', JSON.stringify(res.data, null, 2));
        const valid = Array.isArray(res.data.data)
          ? res.data.data.filter((prod: any) => prod && prod.id && (prod.title || prod.attributes?.title))
          : [];
        setProducts(valid);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setProducts([]);
        Alert.alert('Error', 'Failed to load products. Please check your connection.');
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleProductPress = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    router.push({ pathname: '/product-detail', params: { id: product.id } });
  };

  const getProductImage = (product: Product) => {
    console.log('Processing product for image:', product.id);
    
    let imageUrl: string | null = null;

    if (Array.isArray(product.image) && product.image[0]?.url) {
      imageUrl = product.image[0].url;
      console.log('Found direct product image array structure:', imageUrl);
    }
    else if (product.attributes?.image?.data?.attributes?.url) {
      imageUrl = product.attributes.image.data.attributes.url;
      console.log('Found nested attributes image:', imageUrl);
    }
    else if (Array.isArray(product.attributes?.images?.data) && product.attributes?.images?.data[0]?.attributes?.url) {
      imageUrl = product.attributes.images.data[0].attributes.url;
      console.log('Found attributes images array:', imageUrl);
    }

    else if (product.attributes?.photo?.data?.attributes?.url) {
      imageUrl = product.attributes.photo.data.attributes.url;
      console.log('Found attributes photo field:', imageUrl);
    }

    else if (!Array.isArray(product.image) && (product.image as any)?.data?.attributes?.url) {
      imageUrl = (product.image as any).data.attributes.url;
      console.log('Found direct product image nested structure (fallback):', imageUrl);
    }
    
    if (imageUrl) {

      if (imageUrl.startsWith('/')) {
        const fullUrl = `${STRAPI_BASE_URL}${imageUrl}`;
        console.log('Constructed full URL (relative):', fullUrl);
        return fullUrl;
      }
  
      if (imageUrl.startsWith('http')) {
        console.log('Using full URL (absolute):', imageUrl);
        return imageUrl;
      }
    
      const fullUrl = `${STRAPI_BASE_URL}/uploads/${imageUrl}`;
      console.log('Constructed uploads URL (filename):', fullUrl);
      return fullUrl;
    }
    
    console.log('No image found for product, using placeholder');
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'; 
  };

  const getProductTitle = (product: Product) => {
    return product.title || product.attributes?.title || 'Product';
  };

  const getProductPrice = (product: Product) => {
    return product.price || product.attributes?.price || 0;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading {name} products...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerSection}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.headerIcon}
            >
              <Ionicons name="grid-outline" size={24} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </Text>
        </Animated.View>
      </LinearGradient>

      {}
      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          keyExtractor={item => item.id?.toString?.() ?? Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: Product; index: number }) =>
            item && getProductTitle(item) ? (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10 * (index + 1)] 
                      })
                    }
                  ]
                }}
              >
                <TouchableOpacity
                  style={styles.productCard}
                  activeOpacity={0.8}
                  onPress={() => handleProductPress(item)}
                >
                  <BlurView intensity={20} style={styles.cardBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                      style={styles.cardGradient}
                    >
                      
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: getProductImage(item) }}
                          style={styles.productImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.error('Image load error for product', item.id, error);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully for product', item.id);
                          }}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.1)']}
                          style={styles.imageOverlay}
                        />
                      </View>
                      
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {getProductTitle(item)}
                        </Text>
                        <Text style={styles.productPrice}>
                          ${getProductPrice(item).toFixed(2)}
                        </Text>
                      </View>
                      
                    
                      <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => handleProductPress(item)}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.quickActionGradient}
                        >
                          <Ionicons name="eye-outline" size={16} color="white" />
                        </LinearGradient>
                      </TouchableOpacity>
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
                  <Ionicons name="bag-outline" size={32} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>
                No products available in this category yet.
              </Text>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => {
                  console.log('Current products:', products);
                  Alert.alert('Debug Info', `Products loaded: ${products.length}\nCheck console for details.`);
                }}
              >
                <Text style={styles.debugButtonText}>Debug Info</Text>
              </TouchableOpacity>
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
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontWeight: '500',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  listContainer: {
    paddingBottom: 40,
  },
  row: {
    
  },
  productCard: {
    width: '100%', 
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1, 
  },
  cardGradient: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },
  imageContainer: {
    width: 40, 
    height: 40, 
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10, 
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  productInfo: {
    flex: 1, 
    paddingVertical: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  quickAction: {
    position: 'relative',
    top: 0,
    right: 0,
    marginLeft: 10, 
  },
  quickActionGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 