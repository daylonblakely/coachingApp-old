import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Circle, Text, useDisclose } from 'native-base';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import usePlayerPosition from '../../hooks/usePlayerPosition';
import useArrowPoints from '../../hooks/useArrowPoints';
import usePlayerAnimation from '../../hooks/usePlayerAnimation';
import useIsBlinking from '../../hooks/useIsBlinking';
import Arrow from './Arrow';
import MenuIcon from '../../../../components/MenuIcon';
import StaggerModal from '../../../../components/StaggerModal';
import { setNextPath } from '../../utils/pathUtils';
import { Context as PlayContext } from '../../PlayContext';
import { PLAYER_CIRCLE_SIZE } from '../../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PlayerIcon = ({ playerId, arrowColor, label, animationProgress }) => {
  console.log('---------RENDERING PLAYER: ', label);
  const {
    state: { currentPlay, currentStep, isEditMode, pendingPassFromId },
    updateCurrentPlayerPath,
    addArrow,
    addDribble,
    addScreen,
    removePlayer,
    addBall,
    setPendingPassFromId,
    setPassAtCurrentStep,
    setPassFromPosSharedVal,
    setPassToPosSharedVal,
  } = useContext(PlayContext);

  // check if any players have the ball in the current step
  const stepHasBall = currentPlay.players.some(
    (p) => p?.steps[currentStep]?.hasBall === true
  );

  const { pathToNextPos, pathType, hasBall, receivesBall, passesBall } =
    currentPlay.players.find((p) => playerId === p?.id).steps[currentStep] ||
    {};

  const playerIsEligibleForPass = pendingPassFromId !== null && !hasBall;

  const [isBlinking] = useIsBlinking(playerIsEligibleForPass);

  const { isOpen, onToggle } = useDisclose();

  const {
    // position shared values
    playerPos,
    posMid,
    posEnd,
    // gesture handlers
    gestureHandlerPlayer,
    gestureHandlerEnd,
    gestureHandlerMid,
    // animated styles/props
    animatedStylePlayer,
    animatedStyleMid,
    animatedStyleEnd,
  } = usePlayerPosition(playerId, pathToNextPos, pathType);

  const { animatedPropsArrow, animatedPropsArrowHead } = useArrowPoints(
    playerPos,
    posMid,
    posEnd,
    pathToNextPos,
    pathType
  );

  usePlayerAnimation(playerPos, pathToNextPos, animationProgress);

  // set shared values for pass arrow
  const { passes } = currentPlay;
  useEffect(() => {
    if (!passes?.[currentStep]) {
      setPassFromPosSharedVal(null);
      setPassToPosSharedVal(null);
    } else if (passes?.[currentStep]?.from === playerId) {
      setPassFromPosSharedVal(playerPos);
    } else if (passes?.[currentStep]?.to === playerId) {
      setPassToPosSharedVal(playerPos);
    }
  }, [passes?.[currentStep]]);

  const menuIcons = [
    ...((hasBall && passesBall) || (!hasBall && !receivesBall)
      ? [
          {
            bg: 'yellow.400',
            icon: 'arrow-up',
            text: 'Add Arrow',
            onPress: () =>
              addArrow(playerId, setNextPath(playerPos, posMid, posEnd)),
          },
          {
            bg: 'yellow.400',
            icon: 'md-pin-sharp',
            text: 'Add Screen',
            onPress: () =>
              addScreen(playerId, setNextPath(playerPos, posMid, posEnd)),
          },
          ...(!stepHasBall
            ? [
                {
                  bg: 'blue.400',
                  icon: 'basketball-outline',
                  text: 'Add Ball',
                  onPress: () => addBall(playerId),
                },
              ]
            : []),
        ]
      : [
          {
            bg: 'yellow.400',
            icon: 'arrow-up',
            text: 'Add Dribble',
            onPress: () =>
              addDribble(playerId, setNextPath(playerPos, posMid, posEnd)),
          },
          ...(!receivesBall
            ? [
                {
                  bg: 'blue.400',
                  icon: 'basketball-outline',
                  text: 'Pass Ball',
                  onPress: () => {
                    setPendingPassFromId(playerId);
                  },
                },
              ]
            : []),
        ]),
    {
      bg: 'red.400',
      icon: 'arrow-undo',
      text: 'Remove Arrow',
      onPress: () => updateCurrentPlayerPath(playerId, null),
    },
    {
      bg: 'red.400',
      icon: 'remove-sharp',
      text: 'Remove Player',
      onPress: () => removePlayer(playerId),
    },
  ];

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!playerIsEligibleForPass) // dont open menu if pass is pending
    .runOnJS(true)
    .onStart(onToggle);

  gestureHandlerPlayer.enabled(!playerIsEligibleForPass); // dont move player if pass is pending

  // gesture handler for selecting pass recipient
  const setPassGesture = Gesture.Tap()
    .numberOfTaps(1)
    .enabled(playerIsEligibleForPass)
    .runOnJS(true)
    .onStart(() => setPassAtCurrentStep(playerId));

  const composed = Gesture.Race(
    gestureHandlerPlayer,
    doubleTapGesture,
    setPassGesture
  );

  return (
    <>
      <Arrow
        gestureHandlerEnd={gestureHandlerEnd}
        animatedStyleEnd={animatedStyleEnd}
        gestureHandlerMid={gestureHandlerMid}
        animatedStyleMid={animatedStyleMid}
        animatedPropsArrow={animatedPropsArrow}
        animatedPropsArrowHead={animatedPropsArrowHead}
        color={arrowColor}
        isEditMode={isEditMode}
      />
      <GestureDetector gesture={composed}>
        <AnimatedCircle
          style={animatedStylePlayer}
          position="absolute"
          size={PLAYER_CIRCLE_SIZE}
          borderWidth={hasBall ? '3' : '0'}
          _dark={{
            borderColor: 'white',
            backgroundColor: isBlinking ? 'primary.700' : 'primary.200',
          }}
          _light={{
            borderColor: 'black',
            backgroundColor: isBlinking ? 'primary.700' : 'primary.500',
          }}
        >
          <Text
            fontSize={hasBall ? 'xl' : '2xl'}
            bold
            _dark={{ color: 'black' }}
            _light={{ color: 'white' }}
          >
            {label}
          </Text>
        </AnimatedCircle>
      </GestureDetector>
      <StaggerModal isOpen={isOpen} onToggle={onToggle}>
        {menuIcons.map(({ bg, icon, text, onPress }, i) => (
          <MenuIcon
            bg={bg}
            icon={icon}
            text={text}
            onPress={() => {
              onPress();
              onToggle();
            }}
            key={i}
          />
        ))}
      </StaggerModal>
    </>
  );
};

PlayerIcon.propTypes = {
  playerId: PropTypes.number.isRequired,
  arrowColor: PropTypes.string,
  label: PropTypes.string,
  animationProgress: PropTypes.object,
};

export default PlayerIcon;
