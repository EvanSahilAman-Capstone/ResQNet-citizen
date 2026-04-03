import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { mockAlerts } from '../data/mockAlerts';

export default function AlertsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');

  const alerts = useMemo(() => {
    return mockAlerts.filter(item =>
      item.message.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  function priorityColor(priority: string) {
    const value = priority.toLowerCase();
    if (value === 'urgent') return '#D92D20';
    if (value === 'high') return '#F79009';
    return '#2563EB';
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search alerts..."
        placeholderTextColor="#98A2B3"
        style={styles.search}
      />

      <FlatList
        data={alerts}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('AlertDetails', { alert: item })}
          >
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>

            <Text style={styles.title}>{item.message}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.footerRow}>
              <Text style={styles.meta}>{item.timestamp}</Text>
              <Text style={styles.meta}>{item.radius} km radius</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No alerts found</Text>
            <Text style={styles.emptyText}>
              Try a different search term.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    color: '#101828',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  priorityText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: '#101828',
    fontWeight: '800',
    fontSize: 17,
    marginBottom: 8,
  },
  description: {
    color: '#475467',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  meta: {
    color: '#667085',
    fontSize: 12,
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 6,
  },
  emptyText: {
    color: '#667085',
  },
});