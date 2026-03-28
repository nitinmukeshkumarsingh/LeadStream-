import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { MotiView } from 'moti';
import { Mail } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function Login() {
  const setAccessToken = useAppStore((state) => state.setAccessToken);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setAccessToken(authentication.accessToken);
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Mail size={40} color="#00FF00" />
        </View>
        
        <Text style={styles.title}>LeadStream</Text>
        <Text style={styles.subtitle}>
          Zero clutter. Aggressive monitoring. Never miss a business inquiry again.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => promptAsync()}
          disabled={!request}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Connect Gmail</Text>
        </TouchableOpacity>
        
        <Text style={styles.footer}>
          By connecting, you allow LeadStream to read and modify your emails to clear unread statuses.
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  button: {
    width: '100%',
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 24,
    textAlign: 'center',
  },
});
