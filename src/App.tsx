import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useCallback } from "react";
import { StyleSheet, Text } from "react-native";

import ScrollableWrapper from "./components/ScrollableWrapper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      offsetY.set(event.contentOffset.y);
    },
  });

  const handleRefresh = useCallback((done: () => void) => {
    setTimeout(() => {
      done();
    }, 3000);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollableWrapper listOffsetY={offsetY} onRefresh={handleRefresh}>
          <Animated.FlatList
            bounces={false}
            data={Array.from({ length: 100 })}
            renderItem={() => <Text>Pull to refresh!</Text>}
            contentContainerStyle={styles.list}
            onScroll={scrollHandler}
          />
        </ScrollableWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  list: {
    flexGrow: 1,
    alignItems: "center",
  },
});
