import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl font-bold text-gray-900 mb-4">
        {{APP_NAME}}
      </Text>
      <Text className="text-lg text-gray-600 text-center mb-8">
        {{APP_TAGLINE}}
      </Text>
      
      <Link href="/(auth)/login" asChild>
        <Pressable className="w-full bg-blue-600 py-4 rounded-xl mb-4">
          <Text className="text-white text-center font-semibold text-lg">
            Se connecter
          </Text>
        </Pressable>
      </Link>
      
      <Link href="/(auth)/register" asChild>
        <Pressable className="w-full border-2 border-gray-200 py-4 rounded-xl">
          <Text className="text-gray-900 text-center font-semibold text-lg">
            Créer un compte
          </Text>
        </Pressable>
      </Link>
    </View>
  )
}
