import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, G, Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/config';

// rainbow gradient stops painted around the ring (always visible —
// the ring shows the spectrum; the orbiting dot shows where you are)
const COLOR_STOPS = [
  { t: 0.00, c: '#FFD700' },
  { t: 0.25, c: '#32CD32' },
  { t: 0.50, c: '#00BFFF' },
  { t: 0.75, c: '#9370DB' },
  { t: 1.00, c: '#FFD700' },
];

const RISK_COLOR_MAP = {
  tooCold: COLORS.tooCold,
  safe: COLORS.safe,
  caution: COLORS.caution,
  danger: COLORS.danger,
};

const RISK_LABEL_MAP = {
  tooCold: 'TOO COLD',
  safe: 'SAFE',
  caution: 'CAUTION',
  danger: 'TOO HOT',
};

// map risk → quadrant on the ring (0deg at top, increasing clockwise)
const angleForRisk = (risk) => {
  switch (risk) {
    case 'safe':    return 0;    // top
    case 'caution': return 90;   // right
    case 'danger':  return 180;  // bottom
    case 'tooCold': return 270;  // left
    default:        return 0;
  }
};

// color interpolation helpers
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const v = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};
const rgbToHex = ({ r, g, b }) => {
  const to = (n) => n.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
};
const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex({
    r: Math.round(A.r + (B.r - A.r) * t),
    g: Math.round(A.g + (B.g - A.g) * t),
    b: Math.round(A.b + (B.b - A.b) * t),
  });
};
const colorAt = (t) => {
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i], b = COLOR_STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const nt = (t - a.t) / (b.t - a.t);
      return mix(a.c, b.c, nt);
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1].c;
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const toRad = (deg) => (Math.PI * (deg - 90)) / 180; // 0deg at 12 o'clock
  const start = { x: cx + r * Math.cos(toRad(endDeg)),   y: cy + r * Math.sin(toRad(endDeg)) };
  const end   = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const TempGauge = ({ surfaceTemp, riskLevel, unit = 'F', gapDeg = 0, size = 300 }) => {
  const stroke = 10;
  const r = size / 2 - stroke / 2;

  const scale    = useRef(new Animated.Value(0.85)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const dotAngle = useRef(new Animated.Value(angleForRisk(riskLevel))).current;

  const riskColor = RISK_COLOR_MAP[riskLevel] || COLORS.safe;
  const riskLabel = RISK_LABEL_MAP[riskLevel] || 'SAFE';

  // mount: fade + scale in, then pulse the dot forever
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade,  { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.35, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ])
    ).start();
  }, [scale, fade, dotScale]);

  // glide the dot to the new quadrant when risk changes
  useEffect(() => {
    Animated.timing(dotAngle, {
      toValue: angleForRisk(riskLevel),
      duration: 700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [riskLevel, dotAngle]);

  // pre-bake the rainbow ring as 160 small arc segments
  const segments = useMemo(() => {
    const segs = [];
    const n = 160;
    const start = -90 + gapDeg / 2;
    const sweep = 360 - gapDeg;
    for (let i = 0; i < n; i++) {
      const t0 = i / n;
      const t1 = (i + 1) / n;
      const a0 = start + sweep * t0;
      const a1 = start + sweep * t1;
      const d = arcPath(size / 2, size / 2, r, a0, a1);
      const color = colorAt((t0 + t1) / 2);
      segs.push({ d, color });
    }
    return segs;
  }, [gapDeg, r, size]);

  const dotRotate = dotAngle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });
  const dotSize = 14;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Surface temperature ${surfaceTemp} degrees ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}. Risk: ${riskLabel}.`}
    >
      <Animated.View style={[{ width: size, height: size, transform: [{ scale }], opacity: fade }]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="innerDark" cx="30%" cy="30%" r="75%">
              <Stop offset="0%"   stopColor="rgba(28,28,44,0.95)" />
              <Stop offset="55%"  stopColor="rgba(14,14,24,0.97)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0.99)" />
            </RadialGradient>
          </Defs>

          {/* rainbow ring */}
          <G>
            {segments.map((s, i) => (
              <Path
                key={i}
                d={s.d}
                stroke={s.color}
                strokeWidth={stroke - 0.5}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </G>

          {/* inner dark glass disc — slightly larger to cover seam */}
          <Circle cx={size / 2} cy={size / 2} r={r - stroke + 2} fill="url(#innerDark)" />
        </Svg>

        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.centerWrap}>
            <Text
              style={styles.paws}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              🐾
            </Text>
            <Text style={[styles.label, { color: COLORS.text.muted }]}>SURFACE TEMP</Text>
            <Text style={[styles.temp, { color: riskColor }]}>
              {surfaceTemp}°{unit.toUpperCase()}
            </Text>
            <Text style={[styles.risk, { color: riskColor }]}>{riskLabel}</Text>
          </View>

          {/* orbiting indicator dot — risk-colored, glowing, pulsing */}
          <Animated.View
            style={{
              position: 'absolute',
              left: size / 2 - dotSize / 2,
              top:  size / 2 - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: 999,
              backgroundColor: riskColor,
              shadowColor: riskColor,
              shadowOpacity: 0.9,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
              zIndex: 20,
              transform: [
                { rotate: dotRotate },
                { translateY: -r },
                { scale: dotScale },
              ],
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap:       { alignItems: 'center', paddingVertical: 24 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  paws:       { fontSize: 30, opacity: 0.35, marginBottom: 4 },
  label:      { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 6 },
  temp:       { fontSize: 56, fontWeight: '900', marginBottom: 4 },
  risk:       { fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
});

export default TempGauge;
