import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './Search';
import UniversityDetail from './DetailPage';
import SubjectRankingsPage from './SubjectRankings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="College Rankings"
				component={SearchScreen}
			/>
			<Stack.Screen
				name="DetailPage"
				component={UniversityDetail}
				options={({ route }) => ({
					title: route.params.name || 'University Details',
				})}
			/>
		</Stack.Navigator>
	)
}

function SubjectRankings() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="SubjectRankingsPage"
				component={SubjectRankingsPage}
			/>
		</Stack.Navigator>
	)
}

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator>
				<Tab.Screen
					name="Home"
					component={HomeScreen}
					options={{ headerShown: false }}
				/>
				<Tab.Screen
					name="Subject Rankings"
					component={SubjectRankings}
					options={{ headerShown: false }}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}
