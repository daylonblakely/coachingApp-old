import { useContext, useEffect, useState } from 'react';
import {
  runOnJS,
  useSharedValue,
  useAnimatedReaction,
  useAnimatedProps,
} from 'react-native-reanimated';
import { serialize } from 'react-native-redash';
import useDraggable from './useDraggable';
import { getInitialPositions, getPath, isStraight } from '../utils/pathUtils';
import { Context as PlayContext } from '../context/PlayContext';

export default (playerId) => {
  const {
    state: {
      runStep,
      isEditMode,
      currentPlay,
      shouldAnimatePlay,
      shouldAnimateStep,
    },
    updateCurrentPlayerPath,
  } = useContext(PlayContext);
  console.log(runStep);

  const shouldEdit = isEditMode && !shouldAnimatePlay && !shouldAnimateStep;

  const { pathToNextPos } = currentPlay.players.find(
    ({ id }) => playerId === id
  ).steps[runStep];

  //   initial values for position shared values
  const [{ initPlayerX, initPlayerY, initEndX, initEndY, initMidX, initMidY }] =
    useState(() => getInitialPositions(pathToNextPos));

  const playerPos = useSharedValue({
    x: initPlayerX,
    y: initPlayerY,
  });
  const posMid = useSharedValue({ x: initMidX, y: initMidY });
  const posEnd = useSharedValue({ x: initEndX, y: initEndY });

  // setCurrentPath is a helper to update the state with current paths onEnd drag for player/position
  // https://docs.swmansion.com/react-native-reanimated/docs/api/miscellaneous/runOnJS/
  const updatePathWrapper = (path) => updateCurrentPlayerPath(playerId, path);
  const setCurrentPath = () => {
    'worklet';
    if (shouldEdit) {
      runOnJS(updatePathWrapper)(
        getPath(playerPos.value, posMid.value, posEnd.value)
      );
    }
  };

  // useDraggable returns gesture handlers for dragging positions
  const [gestureHandlerPlayer, animatedStylePlayer] = useDraggable(
    playerPos,
    shouldEdit && runStep === 0,
    setCurrentPath
  );

  const [gestureHandlerMid, animatedStyleMid] = useDraggable(
    posMid,
    shouldEdit,
    (pos) => {
      'worklet';
      // snap position to middle if line is almost straight
      if (isStraight(playerPos.value, posEnd.value, pos.value) && shouldEdit) {
        pos.value = {
          ...pos.value,
          x: (playerPos.value.x + posEnd.value.x) / 2,
          y: (playerPos.value.y + posEnd.value.y) / 2,
        };
      }

      setCurrentPath();
    }
  );

  const [gestureHandlerEnd, animatedStyleEnd] = useDraggable(
    posEnd,
    shouldEdit,
    setCurrentPath
  );

  // moves midpoint when end or player are dragged
  // don't move midpoint on first render in useAnimatedReaction
  const shouldMoveMid = useSharedValue(false);
  useAnimatedReaction(
    () => {
      return {
        x: (playerPos.value.x + posEnd.value.x) / 2,
        y: (playerPos.value.y + posEnd.value.y) / 2,
      };
    },
    (result) => {
      if (shouldMoveMid.value && shouldEdit) {
        posMid.value = result;
      }
      shouldMoveMid.value = true;
    },
    [isEditMode, shouldEdit]
  );

  // moves arrow svg
  const shouldMoveArrow = useSharedValue(false);
  const animatedPropsArrow = useAnimatedProps(() => {
    if (!shouldEdit && !shouldMoveArrow.value) return {};
    shouldMoveArrow.value = false; //set to false to prevent moving arrow while animating
    const p = getPath(playerPos.value, posMid.value, posEnd.value);
    return { d: serialize(p) };
  }, [shouldEdit]);

  // updates the player/arrow positions when the run step changes
  // this happens when the animation ends at the current step
  useEffect(() => {
    console.log('step changed...');
    const { initPlayerX, initPlayerY, initEndX, initEndY, initMidX, initMidY } =
      getInitialPositions(pathToNextPos);

    shouldMoveMid.value = false; //prevent useAnimatedReaction from updating midpoint
    shouldMoveArrow.value = true; //allows the arrow svg to move inbetween steps when running a play
    playerPos.value = { x: initPlayerX, y: initPlayerY };
    posEnd.value = { x: initEndX, y: initEndY };
    posMid.value = { x: initMidX, y: initMidY };
  }, [runStep]);

  return {
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
  };
};
