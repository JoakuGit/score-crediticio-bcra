import type { ReactNode } from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'children'> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...props}
      variant={variant === 'primary' ? 'contained' : 'outlined'}
      color={variant === 'primary' ? 'primary' : 'inherit'}
      sx={{
        minHeight: 46,
        borderRadius: 2.5,
        px: 2,
        fontWeight: 700,
      }}
    >
      {children}
    </MuiButton>
  );
}
