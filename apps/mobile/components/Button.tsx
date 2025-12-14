import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from 'react-native';

interface Props extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export const Button: React.FC<Props> = ({ title, variant = 'primary', loading, disabled, style, ...rest }) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || loading) && styles.pressed,
        isDisabled && styles.disabled,
        style as any,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={variant === 'secondary' ? '#0f1316' : '#05080a'} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#05080a',
  },
  primary: {
    backgroundColor: '#36e27b',
    shadowColor: '#36e27b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  secondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  danger: {
    backgroundColor: '#ef4444',
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
