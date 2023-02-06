import React from 'react';
import { Svg, Defs, Marker, Path } from 'react-native-svg';
import { Circle } from 'native-base';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Arrow = ({
  gestureHandlerEnd,
  animatedStyleEnd,
  gestureHandlerMid,
  animatedStyleMid,
  animatedPropsArrow,
  animatedPropsArrowHead,
  color,
  isVisible,
}) => {
  return (
    <>
      <Svg width="100%" height="100%">
        <Defs>
          <Marker
            id="Triangle"
            viewBox="0 0 10 10"
            refX="0"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="6"
            markerHeight="4"
            orient="auto"
          >
            <AnimatedPath
              animatedProps={animatedPropsArrowHead}
              stroke={color || 'black'}
              fill={color || 'black'}
            />
          </Marker>
        </Defs>
        <AnimatedPath
          animatedProps={animatedPropsArrow}
          stroke={color || 'black'}
          strokeWidth="6"
          markerEnd="url(#Triangle)"
        />
      </Svg>
      {isVisible && (
        <>
          <GestureDetector gesture={gestureHandlerMid}>
            <AnimatedCircle
              style={animatedStyleMid}
              position="absolute"
              size="10"
              bg="green.600"
            />
          </GestureDetector>
          <GestureDetector gesture={gestureHandlerEnd}>
            <AnimatedCircle
              style={animatedStyleEnd}
              position="absolute"
              size="10"
              bg="primary.600"
            />
          </GestureDetector>
        </>
      )}
    </>
  );
};

export default Arrow;