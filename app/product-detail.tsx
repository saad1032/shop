import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getProductById, getProductByIdFallback } from '../api/api';

const { width, height } = Dimensions.get('window');
const STRAPI_BASE_URL = 'http://localhost:1337'; // Match your api.js BASE_URL

interface Product {
  id: number;
  title?: string;
  description?: any;
  price?: number;
  size?: string;
  colour?: string;
  available?: boolean;
  image?: {
    url?: string; // Direct image URL
  }[]; // Array of images, possibly direct URL
  attributes?: {
    title?: string;
    description?: any;
    price?: number;
    size?: string;
    colour?: string;
    available?: boolean;
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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    const productId = typeof id === 'string' ? id : String(id);
    setLoading(true);
    getProductById(productId)
      .then(async res => {
        console.log('Product Detail API response:', JSON.stringify(res.data, null, 2));
        if (!res.data || !res.data.data) {
          // Try fallback if not found
          const fallbackRes = await getProductByIdFallback(productId);
          if (!fallbackRes.data || !fallbackRes.data.data) {
            setError(`Product not found. Raw response: ${JSON.stringify(res.data)}`);
            setProduct(null);
          } else {
            setProduct(fallbackRes.data.data);
            setError(null);
          }
        } else {
          setProduct(res.data.data);
          setError(null);
        }
      })
      .catch(async (err) => {
        console.error('Product detail fetch error:', err);
        // Try fallback if main call fails
        try {
          const fallbackRes = await getProductByIdFallback(productId);
          if (!fallbackRes.data || !fallbackRes.data.data) {
            if (err.response && err.response.data && err.response.data.error) {
              setError(`API Error: ${err.response.data.error.message}`);
            } else if (err.message) {
              setError(`Error: ${err.message}`);
            } else {
              setError('Cannot connect to backend. Please check your server.');
            }
            setProduct(null);
          } else {
            setProduct(fallbackRes.data.data);
            setError(null);
          }
        } catch (fallbackErr) {
          setError('Product not found and fallback failed.');
          setProduct(null);
        }
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

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </LinearGradient>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={50} color="#ea5455" />
        <Text style={styles.errorText}>{error || 'Product not found.'}</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            console.log('Current product data:', product);
            Alert.alert('Debug Info', `Product data: ${product ? 'Loaded' : 'Not loaded'}\nCheck console for details.`);
          }}
        >
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getProductAttribute = (attrName: string, defaultValue: any) => {
    if (product?.attributes && typeof product.attributes === 'object' && product.attributes !== null && attrName in product.attributes) {
      return (product.attributes as any)[attrName];
    }
    if (product && typeof product === 'object' && product !== null && attrName in product) {
      return (product as any)[attrName];
    }
    return defaultValue;
  };

  const title = getProductAttribute('title', 'No title');
  const description = getProductAttribute('description', 'No description');
  const price = getProductAttribute('price', 0);
  const size = getProductAttribute('size', 'N/A');
  const colour = getProductAttribute('colour', 'N/A');
  const available = getProductAttribute('available', false);

  const getProductImage = () => {
    console.log('Processing product for image:', product.id);
    
    let imageUrl: string | null = null;

    if (Array.isArray(product.image) && product.image[0]?.url) {
      imageUrl = product.image[0].url;
      console.log('Found direct product image array structure:', imageUrl);
    }
    else if (product.image && typeof product.image === 'object' && 'data' in product.image && (product.image as any).data?.attributes?.url) {
      imageUrl = (product.image as any).data.attributes.url;
      console.log('Found direct product image nested structure:', imageUrl);
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
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06f2e0?w=800&h=600&fit=crop';
  };

  const productImageUrl = getProductImage();

  // Handle rich text (blocks) for description
  let descriptionText = '';
  if (Array.isArray(description)) {
    descriptionText = description.map((block: any) => {
      if (block.type === 'paragraph' && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text).join('');
      }
      return '';
    }).join('\n');
  } else {
    descriptionText = description;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
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
              <Ionicons name="cube-outline" size={24} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSubtitle}>Product Details</Text>
        </Animated.View>
      </LinearGradient>

      {/* Product Image Section */}
      <View style={styles.imageSection}>
        <Animated.View 
          style={[
            styles.imageCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }
          ]}
        >
          <Image 
            source={{ uri: productImageUrl }}
            style={styles.productImage}
            resizeMode="contain"
            onError={(error) => {
              console.error('Product image load error:', error.nativeEvent.error);
              Alert.alert('Image Error', `Failed to load image for ${title}. Check URL and network.`);
            }}
            onLoad={() => console.log('Product image loaded successfully')}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)']}
            style={styles.imageOverlay}
          />
        </Animated.View>
      </View>

      {/* Product Details Section */}
      <ScrollView 
        style={styles.detailsContainer}
        contentContainerStyle={styles.detailsContent}
      >
        <Animated.View 
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.productTitle}>{title}</Text>
          <Text style={styles.productPrice}>${price.toFixed(2)}</Text>

          <View style={styles.attributeRow}>
            <View style={styles.attributeItem}>
              <Ionicons name="brush-outline" size={18} color="#667eea" style={styles.attributeIcon} />
              <Text style={styles.attributeLabel}>Colour:</Text>
              <Text style={styles.attributeValue}>{colour}</Text>
            </View>
            <View style={styles.attributeItem}>
              <Ionicons name="swap-horizontal-outline" size={18} color="#667eea" style={styles.attributeIcon} />
              <Text style={styles.attributeLabel}>Size:</Text>
              <Text style={styles.attributeValue}>{size}</Text>
            </View>
            <View style={styles.attributeItem}>
              <Ionicons 
                name={available ? "checkmark-circle-outline" : "close-circle-outline"}
                size={18}
                color={available ? "#28c76f" : "#ea5455"}
                style={styles.attributeIcon}
              />
              <Text style={[styles.attributeValue, available ? styles.inStockText : styles.outOfStockText]}>
                {available ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{descriptionText}</Text>
          </View>
        </Animated.View>

        {/* Add to Cart Button (Example) */}
        <Animated.View 
          style={[
            styles.addToCartContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.addToCartButton}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Added to Cart', `"${title}" has been added to your cart!`);
            }}
          >
            <LinearGradient
              colors={['#28c76f', '#1abc9c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addToCartGradient}
            >
              <Ionicons name="cart-outline" size={24} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScrollView>
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
    backgroundColor: '#667eea',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    color: '#ea5455',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 20,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
  imageSection: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 20,
    zIndex: 1,
  },
  imageCard: {
    width: 200, // Reduced width for the image container
    height: 200, // Reduced height for the image container
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsContent: {
    paddingBottom: 40,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  productTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
    textAlign: 'center',
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
    flexWrap: 'wrap',
  },
  attributeItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 5,
  },
  attributeIcon: {
    marginRight: 8,
  },
  attributeLabel: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
    marginRight: 4,
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  inStockText: {
    color: '#28c76f',
  },
  outOfStockText: {
    color: '#ea5455',
  },
  descriptionSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  addToCartContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addToCartButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#28c76f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});