import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './Search';
import UniversityDetail from './DetailPage';
import SubjectRankingsPage from './SubjectRankings';
import RankingDetailPage from './RankingDetailPage';
import Ionicons from '@expo/vector-icons/Ionicons';

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
			<Stack.Screen
				name="RankingDetailPage"
				component={RankingDetailPage}
				options={({ route }) => ({
					title: route.params.name || route.params.normalized_name || 'University Details',
				})}
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

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={{
					tabBarActiveTintColor: '#4a90e2',
					tabBarInactiveTintColor: '#6c757d',
					tabBarStyle: {
						backgroundColor: '#ffffff',
						borderTopColor: '#e1e5e9',
						borderTopWidth: 1,
						paddingBottom: 5,
						height: 85,
					},
					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: '600',
					},

				}}
			>
				<Tab.Screen
					name="Home"
					component={HomeScreen}
					options={{
						headerShown: false,
						tabBarLabel: 'College Rankings',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="home-outline" size={size} color={color} />
						),
					}}
				/>
				<Tab.Screen
					name="Subject Rankings"
					component={SubjectRankings}
					options={{
						headerShown: false,
						tabBarLabel: 'Subject Rankings',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="list-outline" size={size} color={color} />
						),
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}
