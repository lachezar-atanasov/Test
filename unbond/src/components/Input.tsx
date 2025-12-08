import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  input: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
