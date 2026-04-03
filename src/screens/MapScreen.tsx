import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Mapbox, {
  PointAnnotation,
  ShapeSource,
  FillLayer,
  LineLayer,
  Camera,
  MapView,
} from '@rnmapbox/maps';
import { mockAlerts } from '../data/mockAlerts';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiYW1hbmEwMCIsImEiOiJjbW45Z3RiOTYwOGI0MndvNDB5Y3I3MDBkIn0.iep3PgJy1cwvBO6ckPcgoQ'
);

export default function MapScreen() {
  const first = mockAlerts[0];

  const center: [number, number] = first?.coordinates
    ? [first.coordinates[1], first.coordinates[0]]
    : [-79.3832, 43.6532];

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Camera zoomLevel={8} centerCoordinate={center} />

        {mockAlerts.map((item, index) => {
          const key = item._id || String(index);
          const point: [number, number] = [
            item.coordinates[1],
            item.coordinates[0],
          ];
          const radiusKm = Number(item.radius || 0);

          const color =
            item.priority?.toLowerCase() === 'urgent'
              ? '#D92D20'
              : item.priority?.toLowerCase() === 'high'
              ? '#F79009'
              : '#2563EB';

          return (
            <React.Fragment key={key}>
              <PointAnnotation id={`point-${key}`} coordinate={point}>
                <View style={styles.marker} />
              </PointAnnotation>

              {radiusKm > 0 ? (
                <ShapeSource
                  id={`circle-source-${key}`}
                  shape={createCircleGeoJSON(point, radiusKm, 64)}
                >
                  <FillLayer
                    id={`circle-fill-${key}`}
                    style={{
                      fillColor: color,
                      fillOpacity: 0.2,
                    }}
                  />
                  <LineLayer
                    id={`circle-line-${key}`}
                    style={{
                      lineColor: color,
                      lineWidth: 2,
                    }}
                  />
                </ShapeSource>
              ) : null}
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Live Safety Map</Text>
        <Text style={styles.overlayText}>
          {mockAlerts.length} active broadcast area(s)
        </Text>
      </View>
    </View>
  );
}

function createCircleGeoJSON(
  center: [number, number],
  radiusKm: number,
  points = 64
) {
  const [lng, lat] = center;
  const coords: number[][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    backgroundColor: 'rgba(11,18,32,0.88)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  overlayText: {
    color: '#CBD5E1',
    textAlign: 'center',
  },
  marker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D92D20',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});