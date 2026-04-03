import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashIntroScreen({ navigation }: any) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseA = useRef(new Animated.Value(0.92)).current;
  const pulseB = useRef(new Animated.Value(0.78)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseA, {
            toValue: 1.16,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseB, {
            toValue: 1.28,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseA, {
            toValue: 0.92,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseB, {
            toValue: 0.78,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3200);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, pulseA, pulseB, riseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: riseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[styles.ringOuter, { transform: [{ scale: pulseB }] }]}
        />
        <Animated.View
          style={[styles.ringInner, { transform: [{ scale: pulseA }] }]}
        />

        <Animated.View
          style={[styles.orbit, { transform: [{ rotate: spin }] }]}
        >
          <View style={styles.orbitDot} />
        </Animated.View>

        <View style={styles.logoShell}>
          <View style={styles.logoFlameOuter}>
            <View style={styles.logoFlameInner} />
          </View>
        </View>

        <Text style={styles.brand}>ResQNet</Text>
        <Text style={styles.subtitle}>
          Wildfire alerts, route guidance, and emergency awareness.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06101D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  ringInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  orbit: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
  },
  orbitDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -7,
    backgroundColor: '#60A5FA',
  },
  logoShell: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#0B1730',
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  logoFlameOuter: {
    width: 34,
    height: 48,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#F97316',
    transform: [{ rotate: '-8deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFlameInner: {
    width: 16,
    height: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#FDE68A',
    transform: [{ rotate: '10deg' }],
  },
  brand: {
    marginTop: 28,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 10,
    color: '#C7D2FE',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
});