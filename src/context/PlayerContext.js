import createDataContext from './createDataContext';

const playerReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const { Provider, Context } = createDataContext(
  playerReducer,
  {},
  {
    isEditMode: true,
    players: {
      1: {
        label: '1',
        initialPos: { x: 49.72498667240143, y: 333.2830505371094 },
        hasBall: false,
        pathToNextPos: {
          close: false,
          curves: [
            {
              c1: {
                x: 45.52826250344515,
                y: 200.82778292894363,
              },
              c2: {
                x: 129.6306822374463,
                y: 97.47234910726547,
              },
              to: {
                x: 241.95908892154694,
                y: 97.04205894470215,
              },
            },
          ],
          move: {
            x: 49.72498667240143,
            y: 333.2830505371094,
          },
        },
      },
      2: {
        label: '2',
        initialPos: { x: 100, y: 300 },
        hasBall: false,
        pathToNextPos: {
          move: { y: 300, x: 100 },
          curves: [
            {
              c1: { y: 300, x: 100 },
              c2: { y: 240, x: 300 },
              to: { y: 240, x: 300 },
            },
          ],
          close: false,
        },
      },
      3: {
        label: '3',
        initialPos: { x: 300, y: 200 },
        hasBall: false,
        pathToNextPos: {
          move: { y: 200, x: 300 },
          curves: [
            {
              c1: { y: 200, x: 300 }, //for a strait line this is the same as move
              c2: { y: 340, x: 200 }, // this is the same as to
              to: { y: 340, x: 200 },
            },
          ],
          close: false,
        },
      },
    },
  }
);