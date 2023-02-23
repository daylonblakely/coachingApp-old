import React, { useContext } from 'react';
import { Box, HStack, useDisclose, useToast } from 'native-base';
import FooterIcon from './FooterIcon';
import StaggerModal from '../../StaggerModal';
import MenuIcon from '../../MenuIcon';
import { Context as PlayContext } from '../../../context/PlayContext';

const PlayFooter = () => {
  const {
    state: { currentStep, shouldAnimatePlay, shouldAnimateStep, currentPlay },
    runPlayAnimation,
    currentStepAnimation,
    setcurrentStep,
  } = useContext(PlayContext);

  const { isOpen, onToggle } = useDisclose();
  const toast = useToast();
  const stepToastId = 'step_toast';

  const isAnimating = shouldAnimatePlay || shouldAnimateStep;

  // check if any players move during the current step
  const stepHasArrows =
    currentPlay &&
    currentPlay.players.some(
      (p) => p.steps[currentStep].pathToNextPos !== null
    );

  const footerIcons = [
    { icon: 'save', text: 'Save' },
    {
      icon: 'play-skip-back',
      text: 'Last Step',
      onPress: () => {
        if (currentStep > 0) setcurrentStep(currentStep - 1);
      },
    },
    {
      icon: 'play',
      text: 'Run Play',
      onPress: runPlayAnimation,
    },
    {
      icon: 'play-skip-forward',
      text: 'Next Step',
      onPress: () => {
        stepHasArrows
          ? currentStepAnimation()
          : !toast.isActive(stepToastId) &&
            toast.show({
              id: stepToastId,
              title: 'Nothing to animate!',
              variant: 'solid',
              status: 'info',
            });
      },
    },
  ];

  const menuIcons = [
    { bg: 'yellow.400', icon: 'add-sharp', text: 'Add Offense' },
    { bg: 'yellow.400', icon: 'add-sharp', text: 'Add Defense' },
    {
      bg: 'red.400',
      icon: 'arrow-undo',
      text: 'Reset',
      onPress: () => setcurrentStep(0),
    },
  ];

  //   putting a bg on the parent Box prevents clicks to Fab for some reason
  return (
    <Box>
      <HStack justifyContent="flex-start" variant="card" borderTopWidth="1">
        {footerIcons.map(({ icon, text, onPress }, i) => (
          <FooterIcon
            disabled={isAnimating}
            icon={icon}
            text={text}
            onPress={onPress}
            key={i}
          />
        ))}
      </HStack>
      <Box position="absolute" top="-50%" right="5">
        <MenuIcon
          bg="primary.700"
          icon="ellipsis-horizontal"
          onPress={onToggle}
        />
      </Box>
      <StaggerModal isOpen={isOpen} onToggle={onToggle}>
        {menuIcons.map(({ bg, icon, text, onPress }, i) => (
          <MenuIcon
            disabled={isAnimating}
            bg={bg}
            icon={icon}
            text={text}
            onPress={onPress}
            key={i}
          />
        ))}
      </StaggerModal>
    </Box>
  );
};

export default PlayFooter;
