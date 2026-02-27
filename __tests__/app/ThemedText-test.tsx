import * as React from 'react';
import { render } from '@testing-library/react-native';

import { ThemedText } from '../../components/ThemedText';

it(`renders correctly`, () => {
  const { toJSON } = render(<ThemedText>Snapshot test!</ThemedText>);
  expect(toJSON()).toMatchSnapshot();
});
