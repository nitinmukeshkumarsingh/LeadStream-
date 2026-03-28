import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Settings, RefreshCw, MailOpen } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore, EmailMessage } from '../store/useAppStore';
import { fetchUnreadEmails } from '../services/gmail';

const { width } = Dimensions.get('window');

export default function Inbox({
  onOpenSettings,
  onOpenEmail,
}: {
  onOpenSettings: () => void;
  onOpenEmail: (email: EmailMessage) => void;
}) {
  const { accessToken, sources, emails, setEmails, logout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEmails = async (silent = false) => {
    if (!accessToken || !sources.length) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const fetched = await fetchUnreadEmails(accessToken, sources);
      setEmails(fetched);
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        logout();
      } else {
        setError('Failed to fetch emails');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
    const interval = setInterval(() => loadEmails(true), 30000);
    return () => clearInterval(interval);
  }, [accessToken, sources]);

  const renderItem = ({ item, index }: { item: EmailMessage; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 50 }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onOpenEmail(item)}
        style={styles.emailCard}
      >
        {item.isUnread && <View style={styles.unreadIndicator} />}
        <View style={styles.emailHeader}>
          <Text style={styles.senderText} numberOfLines={1}>
            {item.sender.replace(/<.*>/, '').trim()}
          </Text>
          <Text style={styles.dateText}>
            {formatDistanceToNow(item.date, { addSuffix: true })}
          </Text>
        </View>
        <Text style={styles.subjectText} numberOfLines={1}>
          {item.subject || '(No Subject)'}
        </Text>
        <Text style={styles.snippetText} numberOfLines={2}>
          {item.snippet.replace(/<[^>]*>?/gm, '')}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LeadStream</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => loadEmails()} style={styles.actionButton}>
            <RefreshCw size={20} color={loading ? '#00FF00' : '#9CA3AF'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenSettings} style={styles.actionButton}>
            <Settings size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={emails}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadEmails}
            tintColor="#00FF00"
            colors={['#00FF00']}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MailOpen size={48} color="#374151" />
              <Text style={styles.emptyText}>No unread leads.</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          ) : null
        }
      />
      
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emailCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#00FF00',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    flex: 1,
    marginRight: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  snippetText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
  },
});
