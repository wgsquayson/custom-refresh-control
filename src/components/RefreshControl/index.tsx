import {
  AnimatedProp,
  Canvas,
  Group,
  Path,
  Skia,
  SkPoint,
  Transforms3d,
} from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { RefreshControlProps } from "./types";

const SIZE = 40;
const STROKE_WIDTH = 5;

const origin: AnimatedProp<SkPoint> = {
  x: SIZE / 2,
  y: SIZE / 2,
};
const transform: AnimatedProp<Transforms3d> = [
  {
    rotate: -Math.PI / 2,
  },
];
const radius = SIZE / 2 - STROKE_WIDTH;
const path = Skia.Path.Make();
path.addCircle(SIZE / 2, SIZE / 2, radius);

const ANIMATION_DURATION = 200;

export default function RefreshControl({ offsetY }: RefreshControlProps) {
  const { top } = useSafeAreaInsets();

  const scale = useSharedValue(1);

  const isRefreshing = useDerivedValue(() => offsetY.get() >= 50, [offsetY]);
  const progress = useDerivedValue(
    () => interpolate(offsetY.get(), [25, 50], [0, 1], Extrapolation.CLAMP),
    [offsetY]
  );

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: top },
        {
          scale: scale.get(),
        },
      ],
    };
  });

  useAnimatedReaction(
    () => {
      return {
        pg: progress.get(),
      };
    },
    ({ pg }) => {
      if (pg === 1) {
        scale.set(
          withSequence(
            withTiming(1.25, { duration: ANIMATION_DURATION }),
            withTiming(1, { duration: ANIMATION_DURATION })
          )
        );

        return runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
      }

      if (pg > 0.5) {
        return runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }

      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  );

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      <Canvas style={styles.canvas}>
        <Group origin={origin} transform={transform}>
          <Path
            start={0}
            path={path}
            end={progress}
            style="stroke"
            strokeCap="round"
            color="#141414"
            strokeWidth={STROKE_WIDTH}
          />
        </Group>
      </Canvas>
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
});
