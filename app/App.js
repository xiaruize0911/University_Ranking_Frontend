import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchScreen from './Search';
import UniversityDetail from './DetailPage';
import SubjectRankingsPage from './SubjectRankings';
import RankingDetailPage from './RankingDetailPage';
import UniversitySourceRankingsPage from './UniversitySourceRankingsPage';
import MeScreen from './MeScreen';
import { formatSourceName } from '../utils/textFormatter';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { RankingsProvider } from '../contexts/RankingsContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import i18n from '../lib/i18n';
import { getAllUniversityNameTranslations } from '../lib/api';
import { setUniversityNameTranslations } from '../lib/universityNameTranslations';

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			retry: 2,
			refetchOnWindowFocus: false,
		},
	},
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen() {
	const { theme } = useTheme();

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.surface,
				},
				headerTintColor: theme.text,
				headerTitleStyle: {
					color: theme.text,
				},
			}}
		>
			<Stack.Screen
				name={i18n.t('college_rankings')}
				component={SearchScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="DetailPage"
				component={UniversityDetail}
				options={({ route }) => ({
					title: route.params.name || i18n.t('university_details'),
				})}
			/>
			<Stack.Screen
				name="UniversitySourceRankingsPage"
				component={UniversitySourceRankingsPage}
				options={({ route }) => ({
					title: route.params.universityName + ' ' + formatSourceName(route.params.source) + ' ' + i18n.t('rankings') || i18n.t('university_source_rankings'),
				})}
			/>
		</Stack.Navigator>
	)
}

function SubjectRankings() {
	const { theme } = useTheme();

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.surface,
				},
				headerTintColor: theme.text,
				headerTitleStyle: {
					color: theme.text,
				},
			}}
		>
			<Stack.Screen
				name={i18n.t('rankings_of_subjects_regions')}
				component={SubjectRankingsPage}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="RankingDetailPage"
				component={RankingDetailPage}
				options={({ route }) => ({
					title: route.params.name || route.params.normalized_name || i18n.t('university_details'),
				})}
			/>
			<Stack.Screen
				name="DetailPage"
				component={UniversityDetail}
				options={({ route }) => ({
					title: route.params.name || i18n.t('university_details'),
				})}
			/>
			<Stack.Screen
				name="UniversitySourceRankingsPage"
				component={UniversitySourceRankingsPage}
				options={({ route }) => ({
					title: route.params.universityName + ' ' + formatSourceName(route.params.source) + ' ' + i18n.t('rankings') || i18n.t('university_source_rankings'),
				})}
			/>
		</Stack.Navigator>
	)
}

function MeScreenStack() {
	const { theme } = useTheme();

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.surface,
				},
				headerTintColor: theme.text,
				headerTitleStyle: {
					color: theme.text,
				},
			}}
		>
			<Stack.Screen
				name="Profile"
				component={MeScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="DetailPage"
				component={UniversityDetail}
				options={({ route }) => ({
					title: route.params.name || i18n.t('university_details'),
				})}
			/>
			<Stack.Screen
				name="UniversitySourceRankingsPage"
				component={UniversitySourceRankingsPage}
				options={({ route }) => ({
					title: route.params.universityName + ' ' + formatSourceName(route.params.source) + ' ' + i18n.t('rankings') || i18n.t('university_source_rankings'),
				})}
			/>
		</Stack.Navigator>
	)
}

function AppContent() {
	const { theme } = useTheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheetModalProvider>
				<NavigationContainer>
					<Tab.Navigator
						screenOptions={{
							tabBarActiveTintColor: theme.primary,
							tabBarInactiveTintColor: theme.textSecondary,
							tabBarStyle: {
								backgroundColor: theme.background,
								borderTopColor: theme.border,
								borderTopWidth: 1,
								paddingBottom: 5,
								height: 85,
							},
							tabBarLabelStyle: {
								fontSize: 12,
								fontWeight: '600',
							},
							headerStyle: {
								backgroundColor: theme.surface,
							},
							headerTintColor: theme.text,
							headerTitleStyle: {
								color: theme.text,
							},
						}}
					>
						<Tab.Screen
							name="Home"
							component={HomeScreen}
							options={{
								headerShown: false,
								tabBarLabel: i18n.t('college_rankings'),
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
								tabBarLabel: i18n.t('subjects'),
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="list-outline" size={size} color={color} />
								),
							}}
						/>
						<Tab.Screen
							name="Me"
							component={MeScreenStack}
							options={{
								headerShown: false,
								tabBarLabel: i18n.t('me'),
								tabBarIcon: ({ color, size }) => (
									<Ionicons name="person-outline" size={size} color={color} />
								),
							}}
						/>
					</Tab.Navigator>
				</NavigationContainer>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}


// Fetch and cache university name translations at app startup
function useInitUniversityNameTranslations() {
	React.useEffect(() => {
		getAllUniversityNameTranslations()
			.then(setUniversityNameTranslations)
			.catch(e => console.warn('Failed to fetch university name translations', e));
	}, []);
}

export default function App() {
	useInitUniversityNameTranslations();
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<LanguageProvider>
					<RankingsProvider>
						<AppContent />
					</RankingsProvider>
				</LanguageProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
