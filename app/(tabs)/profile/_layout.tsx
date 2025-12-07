import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="master-setup" options={{ title: 'Master Setup' }} />
    </Stack>
  );
}
