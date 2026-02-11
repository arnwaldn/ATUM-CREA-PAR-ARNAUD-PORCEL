import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-3xl font-bold mb-4">
        Expo Starter
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Expo SDK 52 + Supabase + NativeWind
      </Text>

      {user ? (
        <Link href="/(tabs)" asChild>
          <Pressable className="bg-blue-500 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Go to App</Text>
          </Pressable>
        </Link>
      ) : (
        <View className="gap-4">
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="bg-blue-500 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">Sign In</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable className="border border-blue-500 px-6 py-3 rounded-lg">
              <Text className="text-blue-500 font-semibold">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
}
