import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { fetchBroadcasts } from '../services/api';
import * as Location from 'expo-location';

export default function AlertsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  const loadAlerts = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchBroadcasts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Failed to load alerts:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const sortedAlerts = useMemo(() => {
    if (!userCoords || !alerts.length) return alerts.filter(item =>
      item.message?.toLowerCase().includes(search.toLowerCase())
    );

    return alerts
      .filter(item => item.coordinates?.length === 2 &&
        item.message?.toLowerCase().includes(search.toLowerCase()))
      .map(item => ({
        ...item,
        distanceKm: haversineKm(
          userCoords[1], userCoords[0],
          Number(item.coordinates![0]), Number(item.coordinates![1])
        )
      }))
      .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
  }, [alerts, search, userCoords]);

  const priorityColor = (priority?: string) => {
    const value = (priority || '').toLowerCase();
    if (value === 'urgent') return '#EF4444';
    if (value === 'high') return '#F59E0B';
    return '#3B82F6';
  };

  const onRefresh = useCallback(() => loadAlerts(), [loadAlerts]);

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search alerts..."
        placeholderTextColor="#94A3B8"
        style={styles.search}
      />
      <FlatList
        data={sortedAlerts}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('AlertDetails', { alert: item })}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{item.priority?.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{item.message}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.meta}>{item.timestamp}</Text>
              <Text style={styles.meta}>{item.radius || 0} km radius</Text>
              {item.distanceKm && (
                <Text style={[styles.meta, styles.distance]}>
                  {item.distanceKm < 1 ? '< 1 km' : `${item.distanceKm.toFixed(1)} km`}
                </Text>
              )}
            </View>
          </Pressable>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No alerts found</Text>
            <Text style={styles.emptyText}>
              {search ? 'Try different search.' : 'No active broadcasts nearby.'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09121F', padding: 16 },
  search: {
    backgroundColor: '#0D1B2A', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF',
    fontSize: 16, fontWeight: '500',
  },
  card: {
    backgroundColor: '#0D1B2A', borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  priorityBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 12,
  },
  priorityText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  title: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, marginBottom: 8 },
  description: { color: '#CBD5E1', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  meta: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  distance: { color: '#3B82F6', fontWeight: '700' },
  emptyBox: { marginTop: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  emptyText: { color: '#94A3B8', fontSize: 16, textAlign: 'center' },
});