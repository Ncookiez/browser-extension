import React from 'react';
import Switch from 'react-switch';

import { Box } from '../Box/Box';

interface ToggleProps {
  accentColor?: string;
  checked: boolean;
  disabled?: boolean;
  handleChange: (checked: boolean) => void;
  testId?: string;
}

const Toggle = ({
  accentColor,
  checked,
  handleChange,
  disabled = false,
  testId,
}: ToggleProps) => {
  return (
    <Box testId={testId}>
      <Switch
        onChange={handleChange}
        checked={checked}
        className="react-switch"
        height={23}
        width={38}
        handleDiameter={19}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor={accentColor || '#268FFF'}
        activeBoxShadow={accentColor || '#268FFF'}
        disabled={disabled}
      />
    </Box>
  );
};

export { Toggle };
