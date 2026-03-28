import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { WebView } from 'react-native-webview';
import { useAppStore, EmailMessage } from '../store/useAppStore';
import { markAsRead } from '../services/gmail';

const { width, height } = Dimensions.get('window');

export default function EmailDetail({
  email,
  onClose,
}: {
  email: EmailMessage;
  onClose: () => void;
}) {
  const { accessToken, markEmailRead } = useAppStore();

  useEffect(() => {
    if (email.isUnread && accessToken) {
      markAsRead(accessToken, email.id)
        .then(() => {
          markEmailRead(email.id);
        })
        .catch((err) => {
          console.error('Failed to mark as read', err);
        });
    }
  }, [email.id, email.isUnread, accessToken, markEmailRead]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, system-ui, sans-serif;
            line-height: 1.6;
            color: #202124;
            margin: 0;
            padding: 16px;
            background-color: #ffffff;
            word-break: break-word;
          }
          img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
          a { color: #1a73e8; text-decoration: none; }
          table { width: 100% !important; border-collapse: collapse; }
        </style>
      </head>
      <body>
        ${email.bodyHtml || email.bodyPlain || email.snippet}
      </body>
    </html>
  `;

  return (
    <MotiView
      from={{ translateX: width }}
      animate={{ translateX: 0 }}
      exit={{ translateX: width }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ArrowLeft size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.headerSubject} numberOfLines={1}>
          {email.subject || '(No Subject)'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.metaInfo}>
          <View style={styles.senderContainer}>
            <Text style={styles.senderName} numberOfLines={1}>
              {email.sender.split('<')[0].replace(/"/g, '').trim() || email.sender.split('@')[0]}
            </Text>
            <Text style={styles.senderEmail} numberOfLines={1}>
              {email.sender.match(/<([^>]+)>/)?.[1] || email.sender}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{format(email.date, 'MMM d')}</Text>
            <Text style={styles.timeText}>{format(email.date, 'h:mm a')}</Text>
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webview}
            scalesPageToFit={false}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusBadge}>
          <CheckCircle2 size={16} color="#00FF00" />
          <Text style={styles.statusText}>Marked as Read</Text>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerSubject: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#0A0A0A',
  },
  senderContainer: {
    flex: 1,
    marginRight: 16,
  },
  senderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  senderEmail: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  webview: {
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: '600',
  },
});
