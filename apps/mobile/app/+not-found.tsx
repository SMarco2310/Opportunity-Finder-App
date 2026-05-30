import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oups !' }} />
      <View className="flex-1 items-center justify-center p-5 bg-surface">
        <Text className="text-xl font-bold text-ink">{"Cette page n'existe pas."}</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-primary">{"Retour à l'accueil"}</Text>
        </Link>
      </View>
    </>
  );
}
