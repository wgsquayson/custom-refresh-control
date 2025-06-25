import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ScrollableWrapperProps } from "./types";
import { useCallback, useRef } from "react";
import { PanResponder, StyleSheet } from "react-native";
import RefreshControl from "../RefreshControl";

const MAX_PULL_DISTANCE = 70;
const ANIMATION_DURATION = 200;

export default function ScrollableWrapper({
  children,
  listOffsetY,
  onRefresh,
}: ScrollableWrapperProps) {
  const offsetY = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);

  const onPanRelease = useCallback(() => {
    offsetY.set(
      withTiming(isReadyToRefresh.get() ? 50 : 0, {
        duration: ANIMATION_DURATION,
      })
    );

    if (isReadyToRefresh.get()) {
      isReadyToRefresh.set(false);
      onRefresh(() =>
        offsetY.set(withTiming(0, { duration: ANIMATION_DURATION }))
      );
    }
  }, [isReadyToRefresh]);

  const panResponderRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        listOffsetY.get() <= 0 && gestureState.dy >= 0,
      onPanResponderMove: (_, gestureState) => {
        offsetY.set(Math.min(MAX_PULL_DISTANCE, gestureState.dy));

        if (offsetY.get() >= MAX_PULL_DISTANCE / 2 && !isReadyToRefresh.get()) {
          isReadyToRefresh.set(true);
        }

        if (offsetY.get() < MAX_PULL_DISTANCE / 2 && isReadyToRefresh.get()) {
          isReadyToRefresh.set(false);
        }
      },
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    })
  );

  const containerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: offsetY.get(),
        },
      ],
    };
  });

  return (
    <>
      <RefreshControl offsetY={offsetY} />
      <Animated.View
        style={[styles.container, containerStyles]}
        {...panResponderRef.current.panHandlers}
      >
        {children}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
