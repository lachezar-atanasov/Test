import { Stack } from 'expo-router';

export default function JobsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Jobs' }} />
      <Stack.Screen name="create" options={{ title: 'Create Job' }} />
      <Stack.Screen name="[id]" options={{ title: 'Job Details' }} />
      <Stack.Screen name="[id]/offer" options={{ title: 'Send Offer' }} />
    </Stack>
  );
}
