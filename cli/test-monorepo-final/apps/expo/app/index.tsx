import { Text, View } from "react-native";

export default function Index() {
	return (
		<View className="flex-1 items-center justify-center bg-white">
			<Text className="font-bold text-4xl text-blue-600">Welcome to Expo!</Text>
			<Text className="mt-4 text-gray-700 text-lg">
				Edit app/index.tsx to get started
			</Text>
		</View>
	);
}
