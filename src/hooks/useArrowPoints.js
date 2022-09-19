import { useContext } from 'react';
import {
  runOnJS,
  useSharedValue,
  useAnimatedReaction,
  useAnimatedProps,
} from 'react-native-reanimated';
import { createPath, addArc, serialize } from 'react-native-redash';
import useDraggable from './useDraggable';
import { Context as PlayerContext } from '../context/PlayerContext';

const SNAP_THRESHOLD = 20; // min distance from straight line for curve
const DEFAULT_LENGTH = 100;

const triangleHeight = (a, b, c) => {
  'worklet';

  const distance = (a, b) => {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  };

  const ab = distance(a, b);
  const ac = distance(a, c);
  const bc = distance(b, c);

  const p = ab + ac + bc;
  const s = p / 2;

  const T = Math.sqrt(s * (s - ab) * (s - ac) * (s - bc));
  return (2 * T) / ab;
};

// determines if line is straight
const isStraight = (a, b, c) => {
  'worklet';
  return triangleHeight(a, b, c) < SNAP_THRESHOLD;
};

// gets a path object with one arc for three positions (sharedValues)
const getPath = (playerPos, posMid, posEnd) => {
  'worklet';
  const p = createPath(playerPos.value);
  addArc(p, posMid.value, posEnd.value);
  return p;
};

export default (player, isEditMode) => {
  const { updatePath } = useContext(PlayerContext);

  const { x: initPlayerX, y: initPlayerY } = player.initialPos;
  const { initialPathToNextPos } = player;

  // get last curve of an existing path
  const lastCurve =
    initialPathToNextPos?.curves[initialPathToNextPos.curves.length - 1];

  // endX defaults to X val of the player
  // endY defaults to player Y + DEFAULT_LENGTH to make vertical arrow
  const initEndX = lastCurve?.to.x || initPlayerX;
  const initEndY = lastCurve?.to.y || initPlayerY + DEFAULT_LENGTH;

  // handle curves in saved plays for midpoint
  // c2 === to on straight curves
  const isInitStraight =
    lastCurve?.c2.x === lastCurve?.to.x && lastCurve?.c2.y === lastCurve?.to.y;

  const initMidX =
    lastCurve && !isInitStraight
      ? (lastCurve.c2.x - initEndX) / (9 / 16) + initEndX //https://github.com/wcandillon/react-native-redash/blob/master/src/Paths.ts
      : (initPlayerX + initEndX) / 2;

  const initMidY =
    lastCurve && !isInitStraight
      ? (lastCurve.c2.y - initEndY) / (9 / 16) + initEndY
      : (initPlayerY + initEndY) / 2;

  // player/arrow position shared values
  const playerPos = useSharedValue({ x: initPlayerX, y: initPlayerY });
  const posEnd = useSharedValue({ x: initEndX, y: initEndY });
  const posMid = useSharedValue({ x: initMidX, y: initMidY });

  // setCurrentPath is a helper to update the state with current paths onEnd drag for player/position
  // https://docs.swmansion.com/react-native-reanimated/docs/api/miscellaneous/runOnJS/
  const updatePathWrapper = (path) => updatePath(player.id, path);
  const setCurrentPath = () => {
    'worklet';
    runOnJS(updatePathWrapper)(getPath(playerPos, posMid, posEnd));
  };

  // useDraggable returns gesture handlers for dragging positions
  const [gestureHandlerPlayer, animatedStylePlayer] = useDraggable(
    playerPos,
    isEditMode,
    setCurrentPath
  );

  const [gestureHandlerEnd, animatedStyleEnd] = useDraggable(
    posEnd,
    isEditMode,
    setCurrentPath
  );

  const [gestureHandlerMid, animatedStyleMid] = useDraggable(
    posMid,
    isEditMode,
    (pos) => {
      'worklet';
      // snap position to middle if line is almost straight
      if (isStraight(playerPos.value, posEnd.value, pos.value)) {
        pos.value = {
          ...pos.value,
          x: (playerPos.value.x + posEnd.value.x) / 2,
          y: (playerPos.value.y + posEnd.value.y) / 2,
        };
      }

      setCurrentPath();
    }
  );

  // moves midpoint when end or player are dragged
  const straightenOnDrag = useSharedValue(isInitStraight);
  useAnimatedReaction(
    () => {
      return [playerPos.value, posEnd.value];
    },
    (result) => {
      if (straightenOnDrag.value) {
        // console.log('here', player.id);
        posMid.value = {
          x: (result[0].x + result[1].x) / 2,
          y: (result[0].y + result[1].y) / 2,
        };
      }
      straightenOnDrag.value = true; // this is needed to keep middle pos on initial render
    }
  );

  // moves arrow svg
  const animatedPropsArrow = useAnimatedProps(() => {
    const p = getPath(playerPos, posMid, posEnd);
    return { d: serialize(p) };
  });

  return {
    gestureHandlerPlayer,
    animatedStylePlayer,
    gestureHandlerEnd,
    animatedStyleEnd,
    gestureHandlerMid,
    animatedStyleMid,
    animatedPropsArrow,
  };
};
