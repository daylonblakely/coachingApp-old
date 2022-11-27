import { useContext } from 'react';
import { Circle, Text, useDisclose } from 'native-base';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import usePlayerPosition from '../../hooks/usePlayerPosition';
import usePlayerAnimation from '../../hooks/usePlayerAnimation';
import Arrow from './Arrow';
import MenuIcon from '../MenuIcon';
import StaggerModal from '../StaggerModal';
import { Context as PlayContext } from '../../context/PlayContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PlayerIcon = ({ playerId, arrowColor, label, animationProgress }) => {
  console.log('---------RENDERING PLAYER: ', label);
  const {
    state: { currentPlay, runStep },
  } = useContext(PlayContext);

  const { pathToNextPos } = currentPlay.players.find(
    ({ id }) => playerId === id
  ).steps[runStep];

  const { isOpen, onToggle } = useDisclose();
  const menuIcons = [
    { bg: 'yellow.400', icon: 'add-sharp', text: 'Add Arrow' },
    { bg: 'yellow.400', icon: 'add-sharp', text: 'Add Dribble' },
    { bg: 'red.400', icon: 'arrow-undo', text: 'Reset' },
  ];

  const {
    // position shared values
    playerPos,
    // gesture handlers
    gestureHandlerPlayer,
    gestureHandlerEnd,
    gestureHandlerMid,
    // animated styles/props
    animatedStylePlayer,
    animatedStyleMid,
    animatedStyleEnd,
    animatedPropsArrow,
  } = usePlayerPosition(playerId);

  usePlayerAnimation(playerPos, playerId, animationProgress);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onStart(onToggle);

  const composed = Gesture.Race(gestureHandlerPlayer, doubleTapGesture);

  return (
    <>
      {pathToNextPos && (
        <Arrow
          gestureHandlerEnd={gestureHandlerEnd}
          animatedStyleEnd={animatedStyleEnd}
          gestureHandlerMid={gestureHandlerMid}
          animatedStyleMid={animatedStyleMid}
          animatedPropsArrow={animatedPropsArrow}
          color={arrowColor}
        />
      )}

      <GestureDetector gesture={composed}>
        <AnimatedCircle
          style={animatedStylePlayer}
          position="absolute"
          size="xs"
          bg="secondary.600"
        >
          <Text color="white" fontSize="xl">
            {label}
          </Text>
        </AnimatedCircle>
      </GestureDetector>
      <StaggerModal isOpen={isOpen} onToggle={onToggle}>
        {menuIcons.map(({ bg, icon, text, onPress }, i) => (
          <MenuIcon bg={bg} icon={icon} text={text} onPress={onPress} key={i} />
        ))}
      </StaggerModal>
    </>
  );
};

export default PlayerIcon;
