import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup, clearAuthData } = useAuth();

  const handleSubmit = async () => {
    console.log('=== SUBMIT BUTTON PRESSED ===');
    console.log('Submit pressed - isLogin:', isLogin);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('FullName:', fullName);
    console.log('ConfirmPassword:', confirmPassword);
    console.log('Loading state:', loading);
    
    if (loading) {
      console.log('Already loading, ignoring button press');
      return;
    }
    
    // Basic validation
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
    } else {
      if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    console.log('Validation passed, starting authentication...');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        console.log('Calling login function...');
        const success = await login(email, password);
        console.log('Login result:', success);
        if (!success) {
          Alert.alert('Error', 'Login failed. Please try again.');
        }
      } else {
        console.log('Calling signup function...');
        const success = await signup(email, password, fullName);
        console.log('Signup result:', success);
        if (!success) {
          Alert.alert('Error', 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Simple Form */}
      <View style={styles.simpleForm}>
        <Text style={styles.formTitle}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>

        {/* Full Name Input - Only for Signup */}
        {!isLogin && (
          <View style={styles.simpleInputContainer}>
            <Text style={styles.inputLabel}>Full Name:</Text>
            <TextInput
              style={styles.simpleTextInput}
              placeholder="Enter your full name"
              placeholderTextColor="#a0aec0"
              value={fullName}
              onChangeText={(text) => {
                console.log('Full name input changed:', text);
                setFullName(text);
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Email Input */}
        <View style={styles.simpleInputContainer}>
          <Text style={styles.inputLabel}>Email:</Text>
          <TextInput
            style={styles.simpleTextInput}
            placeholder="Enter your email"
            placeholderTextColor="#a0aec0"
            value={email}
            onChangeText={(text) => {
              console.log('Email input changed:', text);
              setEmail(text);
            }}
            onFocus={() => console.log('Email input focused')}
            onBlur={() => console.log('Email input blurred')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.simpleInputContainer}>
          <Text style={styles.inputLabel}>Password:</Text>
          <TextInput
            style={styles.simpleTextInput}
            placeholder="Enter your password"
            placeholderTextColor="#a0aec0"
            value={password}
            onChangeText={(text) => {
              console.log('Password input changed:', text);
              setPassword(text);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#667eea" 
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input - Only for Signup */}
        {!isLogin && (
          <View style={styles.simpleInputContainer}>
            <Text style={styles.inputLabel}>Confirm Password:</Text>
            <TextInput
              style={styles.simpleTextInput}
              placeholder="Confirm your password"
              placeholderTextColor="#a0aec0"
              value={confirmPassword}
              onChangeText={(text) => {
                console.log('Confirm password input changed:', text);
                setConfirmPassword(text);
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={toggleConfirmPasswordVisibility}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#667eea" 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.simpleSubmitButton}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.simpleSubmitText}>
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </Text>
        </TouchableOpacity>

        {/* Toggle Mode */}
        <TouchableOpacity
          style={styles.simpleToggleButton}
          onPress={toggleMode}
        >
          <Text style={styles.simpleToggleText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  simpleForm: {
    flex: 1,
    padding: 24,
    zIndex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  simpleInputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  simpleTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eyeButton: {
    padding: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  simpleSubmitButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  simpleSubmitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  simpleToggleButton: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
  },
  simpleToggleText: {
    fontSize: 14,
    color: 'white',
    textDecorationLine: 'underline',
  },
}); 