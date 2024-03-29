import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

export default (pos, isDraggable, onEnd, offsetX = 0, offsetY = 0) => {
  const context = useSharedValue({ x: pos.value.x, y: pos.value.y });
  const gestureHandler = Gesture.Pan()
    .onStart(() => {
      context.value = { x: pos.value.x, y: pos.value.y };
    })
    .onUpdate((e) => {
      if (isDraggable) {
        pos.value = {
          x: e.translationX + context.value.x,
          y: e.translationY + context.value.y,
        };
      }
    })
    .onEnd(() => {
      if (onEnd && isDraggable) {
        onEnd(pos);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: pos.value.x - offsetX },
        { translateY: pos.value.y - offsetY },
      ],
    };
  });

  return [gestureHandler, animatedStyle];
};
