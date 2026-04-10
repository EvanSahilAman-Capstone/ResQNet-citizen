import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  ShapeSource,
  FillLayer,
  LineLayer,
  UserLocation,
  Location,
} from '@rnmapbox/maps';
import {
  Plane,
  Flame,
  Shield,
  RefreshCw,
  Navigation2,
  Plus,
  Minus,
  LocateFixed,
} from 'lucide-react-native';
import {
  fetchBroadcasts,
  fetchSafeZones,
  fetchEvacuationRoute,
} from '../services/api';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiZHV0dGFzYWgiLCJhIjoiY21reWk1MWdhMDdwczNlcHJxenlxbmRwcyJ9.0IS1a4DU496E7mnS2oJMAg'
);

type BroadcastItem = {
  _id?: string;
  coordinates?: [number, number];
  priority?: string;
  radius?: number;
  message?: string;
  description?: string;
  timestamp?: string;
};

type SafeZoneItem = {
  _id?: string;
  safe_zone_id?: string;
  name?: string;
  coordinates?: [number, number];
  radius_m?: number;
  status?: string;
};

type RouteResponse = {
  route?: [number, number][];
  distance_km?: number;
  duration_min?: number;
  hazard_intersections?: number;
  safety_score?: number;
  warnings?: string[];
  destination_name?: string;
  destination_coords?: [number, number];
};

export default function MapScreen() {
  const cameraRef = useRef<Camera>(null);

  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [safeZonesData, setSafeZonesData] = useState<{ safe_zones: SafeZoneItem[]; count: number }>({
    safe_zones: [],
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routing, setRouting] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [currentZoom, setCurrentZoom] = useState(13.5);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setLocationGranted(true);
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'ResQNet needs location to show hazards and route you safely.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setLocationGranted(isGranted);
      return isGranted;
    } catch (error) {
      console.log('Permission error:', error);
      setLocationGranted(false);
      return false;
    }
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [broadcastsData, safeZonesResponse] = await Promise.all([
        fetchBroadcasts(),
        fetchSafeZones(),
      ]);

      setBroadcasts(Array.isArray(broadcastsData) ? broadcastsData : []);
      setSafeZonesData(
        safeZonesResponse && Array.isArray(safeZonesResponse.safe_zones)
          ? safeZonesResponse
          : { safe_zones: [], count: 0 }
      );
    } catch (error) {
      console.log('Load error:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission().then(() => loadData());
  }, [requestLocationPermission, loadData]);

  const getPriorityColors = (priority?: string) => {
    const value = (priority || '').toLowerCase();

    if (value === 'urgent' || value === 'severe') {
      return { fill: '#EF4444', stroke: '#DC2626', marker: '#DC2626' };
    }
    if (value === 'high') {
      return { fill: '#F59E0B', stroke: '#D97706', marker: '#F59E0B' };
    }
    if (value === 'medium') {
      return { fill: '#F97316', stroke: '#EA580C', marker: '#F97316' };
    }

    return { fill: '#EAB308', stroke: '#CA8A04', marker: '#CA8A04' };
  };

  const realBroadcasts = useMemo(() => {
    return broadcasts
      .filter(item => item.coordinates && Array.isArray(item.coordinates) && item.coordinates.length === 2)
      .map((item, index) => ({
        id: item._id || `broadcast-${index}`,
        coordinates: [
          Number(item.coordinates![1]),
          Number(item.coordinates![0]),
        ] as [number, number],
        priority: item.priority || 'medium',
        radiusKm: Number(item.radius || 0),
        colors: getPriorityColors(item.priority),
      }));
  }, [broadcasts]);

  const realSafeZones = useMemo(() => {
    return (safeZonesData.safe_zones || [])
      .filter(
        item =>
          item.coordinates &&
          Array.isArray(item.coordinates) &&
          item.coordinates.length === 2 &&
          item.status !== 'closed'
      )
      .map((item, index) => ({
        id: item.safe_zone_id || item._id || `safezone-${index}`,
        coordinates: [
          Number(item.coordinates![0]),
          Number(item.coordinates![1]),
        ] as [number, number], // safe zones are GeoJSON [lng, lat]
        radiusKm: Number(item.radius_m || 0) / 1000,
        name: item.name || 'Safe Zone',
      }));
  }, [safeZonesData]);

  const routeGeoJSON = useMemo(() => {
    if (!routeData?.route || !routeData.route.length) return null;

    const coords = routeData.route.map(([lat, lng]) => [lng, lat]);

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: coords,
      },
      properties: {},
    };
  }, [routeData]);

  const createCircleGeoJSON = (
    center: [number, number],
    radiusKm: number,
    points = 72
  ) => {
    const [lng, lat] = center;
    const coords: number[][] = [];

    const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      coords.push([
        lng + distanceX * Math.cos(theta),
        lat + distanceY * Math.sin(theta),
      ]);
    }

    coords.push(coords[0]);

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords],
      },
      properties: {},
    };
  };

  const centerOnUser = useCallback(() => {
    if (!cameraRef.current || !userCoords) return;

    cameraRef.current.setCamera({
      centerCoordinate: userCoords,
      zoomLevel: 14.5,
      animationMode: 'flyTo',
      animationDuration: 900,
    });
    setCurrentZoom(14.5);
  }, [userCoords]);

  const centerOnAll = useCallback(() => {
    if (!cameraRef.current || (!realBroadcasts.length && !realSafeZones.length && !userCoords)) {
      return;
    }

    const allCoords: [number, number][] = [
      ...(userCoords ? [userCoords] : []),
      ...realBroadcasts.map(item => item.coordinates),
      ...realSafeZones.map(item => item.coordinates),
    ];

    if (routeData?.route?.length) {
      routeData.route.forEach(([lat, lng]) => {
        allCoords.push([lng, lat]);
      });
    }

    if (!allCoords.length) return;

    let minLng = allCoords[0][0];
    let maxLng = allCoords[0][0];
    let minLat = allCoords[0][1];
    let maxLat = allCoords[0][1];

    allCoords.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    cameraRef.current.fitBounds([minLng, maxLat], [maxLng, minLat], 100, 1000);
  }, [realBroadcasts, realSafeZones, userCoords, routeData]);

  const zoomIn = useCallback(() => {
    const nextZoom = Math.min(currentZoom + 1, 18);
    cameraRef.current?.zoomTo(nextZoom, 250);
    setCurrentZoom(nextZoom);
  }, [currentZoom]);

  const zoomOut = useCallback(() => {
    const nextZoom = Math.max(currentZoom - 1, 5);
    cameraRef.current?.zoomTo(nextZoom, 250);
    setCurrentZoom(nextZoom);
  }, [currentZoom]);

  const routeToNearestSafeZone = useCallback(async () => {
    if (!userCoords) {
      console.log('No user location available for routing');
      return;
    }

    try {
      setRouting(true);
      const response = await fetchEvacuationRoute(userCoords);
      setRouteData(response);

      setTimeout(() => {
        centerOnAll();
      }, 250);
    } catch (error) {
      console.log('Routing error:', error);
    } finally {
      setRouting(false);
    }
  }, [userCoords, centerOnAll]);

  const handleUserLocationUpdate = useCallback((location: Location) => {
    const longitude = location?.coords?.longitude;
    const latitude = location?.coords?.latitude;

    if (typeof longitude !== 'number' || typeof latitude !== 'number') return;
    setUserCoords([longitude, latitude]);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading safety map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.routeButton} onPress={routeToNearestSafeZone} disabled={routing}>
          {routing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Navigation2 size={18} color="#FFFFFF" />
          )}
          <Text style={styles.routeButtonText}>Route to nearest safe zone</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.overlayTitle}>Live Safety Map</Text>
          <Text style={styles.overlayText}>
            {realBroadcasts.length} hazards · {realSafeZones.length} safe zones
          </Text>
          {routeData ? (
            <Text style={styles.routeMeta}>
              {routeData.distance_km?.toFixed(2)} km · {routeData.duration_min?.toFixed(1)} min · safety {routeData.safety_score}
            </Text>
          ) : null}
        </View>
      </View>

      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        scaleBarEnabled={false}
        logoEnabled={false}
        compassEnabled={false}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={userCoords || [-79.6877, 43.4675]}
          zoomLevel={13.5}
        />

        {locationGranted ? (
          <UserLocation visible={true} onUpdate={handleUserLocationUpdate} />
        ) : null}

        {userCoords ? (
          <PointAnnotation id="user-location-marker" coordinate={userCoords}>
            <View style={styles.userMarker}>
              <Plane size={18} color="#FFFFFF" />
            </View>
          </PointAnnotation>
        ) : null}

        {realBroadcasts.map(item => (
          <React.Fragment key={item.id}>
            {item.radiusKm > 0 ? (
              <ShapeSource
                id={`broadcast-source-${item.id}`}
                shape={createCircleGeoJSON(item.coordinates, item.radiusKm)}
              >
                <FillLayer
                  id={`broadcast-fill-${item.id}`}
                  style={{
                    fillColor: item.colors.fill,
                    fillOpacity: 0.18,
                  }}
                />
                <LineLayer
                  id={`broadcast-line-${item.id}`}
                  style={{
                    lineColor: item.colors.stroke,
                    lineWidth: 2.2,
                    lineOpacity: 0.95,
                  }}
                />
              </ShapeSource>
            ) : null}

            <PointAnnotation
              id={`broadcast-marker-${item.id}`}
              coordinate={item.coordinates}
            >
              <View
                style={[
                  styles.broadcastMarker,
                  { backgroundColor: item.colors.marker },
                ]}
              >
                <Flame size={16} color="#FFFFFF" />
              </View>
            </PointAnnotation>
          </React.Fragment>
        ))}

        {realSafeZones.map(item => (
          <React.Fragment key={item.id}>
            {item.radiusKm > 0 ? (
              <ShapeSource
                id={`safezone-source-${item.id}`}
                shape={createCircleGeoJSON(item.coordinates, item.radiusKm)}
              >
                <FillLayer
                  id={`safezone-fill-${item.id}`}
                  style={{
                    fillColor: '#22C55E',
                    fillOpacity: 0.16,
                  }}
                />
                <LineLayer
                  id={`safezone-line-${item.id}`}
                  style={{
                    lineColor: '#16A34A',
                    lineWidth: 2.2,
                    lineOpacity: 0.95,
                  }}
                />
              </ShapeSource>
            ) : null}

            <PointAnnotation
              id={`safezone-marker-${item.id}`}
              coordinate={item.coordinates}
            >
              <View style={styles.safeZoneMarker}>
                <Shield size={16} color="#FFFFFF" />
              </View>
            </PointAnnotation>
          </React.Fragment>
        ))}

        {routeGeoJSON ? (
          <ShapeSource id="route-source" shape={routeGeoJSON}>
            <LineLayer
              id="route-line"
              style={{
                lineColor: '#0EA5E9',
                lineWidth: 5,
                lineOpacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        ) : null}
      </MapView>

      <View style={styles.rightControls}>
        <TouchableOpacity style={styles.fabPrimary} onPress={centerOnUser}>
          <LocateFixed size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={centerOnAll}>
          <Text style={styles.fabText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={zoomIn}>
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={zoomOut}>
          <Minus size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fabRefresh} onPress={loadData} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size={16} color="#94A3B8" />
          ) : (
            <RefreshCw size={18} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  topControls: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  routeButton: {
    backgroundColor: '#16A34A',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 10,
    marginBottom: 12,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  infoCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(11,18,32,0.95)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    elevation: 10,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  overlayText: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
  },
  routeMeta: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },

  rightControls: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    gap: 12,
    zIndex: 20,
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabRefresh: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  userMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0EA5E9',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  broadcastMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  safeZoneMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09121F',
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 12,
    fontSize: 16,
  },
});