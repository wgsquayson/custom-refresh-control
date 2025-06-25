import { PropsWithChildren } from "react";
import { SharedValue } from "react-native-reanimated";

export type ScrollableWrapperProps = PropsWithChildren & {
  listOffsetY: SharedValue<number>;
  onRefresh: (done: () => void) => void;
};
