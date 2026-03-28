import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Plus, Trash2, ArrowRight, LogOut } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';

export default function Setup({ onComplete }: { onComplete: () => void }) {
  const { sources, addSource, removeSource, logout } = useAppStore();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !sources.includes(trimmed)) {
      addSource(trimmed);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateX: 20 }}
        animate={{ opacity: 1, translateX: 0 }}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Target Sources</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <LogOut size={16} color="#9CA3AF" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description}>
          Add the email addresses or domains you want to monitor (e.g., formsubmit.co, leads@client.com).
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Enter email or domain..."
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!input.trim()}
            style={[styles.addButton, !input.trim() && styles.disabledButton]}
          >
            <Plus size={24} color="#00FF00" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list}>
          <AnimatePresence>
            {sources.length === 0 ? (
              <MotiView
                key="empty"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.emptyContainer}
              >
                <Text style={styles.emptyText}>No sources added yet.</Text>
              </MotiView>
            ) : (
              sources.map((source) => (
                <MotiView
                  key={source}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={styles.sourceItem}
                >
                  <Text style={styles.sourceLabel}>{source}</Text>
                  <TouchableOpacity
                    onPress={() => removeSource(source)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color="#F87171" />
                  </TouchableOpacity>
                </MotiView>
              ))
            )}
          </AnimatePresence>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onComplete}
            disabled={sources.length === 0}
            style={[styles.continueButton, sources.length === 0 && styles.disabledButton]}
          >
            <Text style={styles.continueText}>Continue to Inbox</Text>
            <ArrowRight size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    paddingTop: 64,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  logoutText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#374151',
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4B5563',
    fontSize: 16,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sourceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  continueText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
