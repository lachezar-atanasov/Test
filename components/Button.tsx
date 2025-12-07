import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '../lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg items-center justify-center';
  const variantStyles = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    outline: 'bg-transparent border-2 border-blue-500',
  };
  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-blue-500 font-semibold',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant], disabled && 'opacity-50', className)}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3b82f6' : '#ffffff'} />
      ) : (
        <Text className={cn(textStyles[variant])}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
