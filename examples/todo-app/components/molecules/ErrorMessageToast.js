import React from 'react';
import { Mutation } from 'react-apollo';

import Overlay from '../atomics/Overlay';
import Heading from '../atomics/Heading';
import CloseButton from '../atomics/CloseButton';

import ERROR_MESSAGES_RESET from './ErrorMessageToastResetMutation.gql';

export default ({ message }) => (
  <Mutation mutation={ERROR_MESSAGES_RESET}>
    {resetErrorMessages => (
      <Overlay>
        <CloseButton onClick={resetErrorMessages}>X</CloseButton>
        <Heading>{message}</Heading>
      </Overlay>
    )}
  </Mutation>
);
