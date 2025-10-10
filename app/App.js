import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity, Platform } from 'react-native';
import SearchScreen from './Search';
import UniversityDetail from './DetailPage';
import SubjectRankingsPage from './SubjectRankings';
import RankingDetailPage from './RankingDetailPage';
import UniversitySourceRankingsPage from './UniversitySourceRankingsPage';
import MeScreen from './MeScreen';
import FavoritesScreen from './FavoritesScreen';
import { formatSourceName } from '../utils/textFormatter';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { RankingsProvider } from '../contexts/RankingsContext';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import i18n from '../lib/i18n';
import { getAllUniversityNameTranslations } from '../lib/api';
import { setUniversityNameTranslations } from '../lib/universityNameTranslations';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

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



const { width, height } = Dimensions.get('window');



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
				name="i18.t('Profile')"
				component={MeScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="FavoritesScreen"
				component={FavoritesScreen}
				options={{
					title: i18n.t('favorite_universities'),
					headerShown: false,
				}}
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
	// Keep SafeAreaProvider at this level, then use an inner component
	// that reads the insets hook (so the hook is used below the provider).
	return (
		<SafeAreaProvider>
			<AppContentInner />
		</SafeAreaProvider>
	);
}

function AppContentInner() {
	const insets = useSafeAreaInsets();
	const { theme } = useTheme();

	const paddingTop = Platform.OS === 'android' ? insets.top : 0;
	const paddingBottom = Platform.OS == 'android' ? insets.bottom : 0;

	return (
		<GestureHandlerRootView style={{ flex: 1, paddingTop, paddingBottom, backgroundColor: theme.surface }}>
			<BottomSheetModalProvider>
				<NavigationContainer>
					<Tab.Navigator
						screenOptions={{
							tabBarActiveTintColor: theme.primary,
							tabBarInactiveTintColor: theme.textSecondary,
							tabBarStyle: {
								// make tab bar background match header/padding
								backgroundColor: theme.surface,
								borderTopColor: theme.border,
								borderTopWidth: 1,
								paddingBottom: 0,
								height: 85,
								elevation: 0, // Android
								shadowColor: 'transparent', // iOS
								shadowOpacity: 0,
								shadowOffset: { height: 0 },
								shadowRadius: 0,
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
							name="Profile"
							component={MeScreenStack}
							options={{
								headerShown: false,
								tabBarLabel: i18n.t('Profile'),
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
function useInitUniversityNameTranslations(setLoading) {
	React.useEffect(() => {
		setLoading(true);
		getAllUniversityNameTranslations()
			.then(setUniversityNameTranslations)
			.catch(e => console.warn('Failed to fetch university name translations', e))
			.finally(() => setLoading(false));
	}, [setLoading]);
}

export default function App() {
	const [isLoading, setIsLoading] = useState(true);

	useInitUniversityNameTranslations(setIsLoading);

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

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		backgroundColor: '#0f0f23', // Dark anime-style background
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingContent: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	particlesContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	particle: {
		position: 'absolute',
		fontSize: 24,
	},
	particle1: {
		top: '20%',
		left: '20%',
	},
	particle2: {
		top: '30%',
		right: '25%',
	},
	particle3: {
		bottom: '25%',
		left: '25%',
	},
	animeLogoContainer: {
		marginBottom: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	animeLogo: {
		position: 'relative',
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: 'rgba(74, 144, 226, 0.2)',
		borderWidth: 3,
		borderColor: '#4a90e2',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#4a90e2',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 20,
		elevation: 10,
	},
	animeLogoText: {
		fontSize: 48,
		textAlign: 'center',
		zIndex: 2,
	},
	animeGlow: {
		position: 'absolute',
		top: -10,
		left: -10,
		right: -10,
		bottom: -10,
		borderRadius: 70,
		backgroundColor: 'rgba(74, 144, 226, 0.1)',
		borderWidth: 2,
		borderColor: 'rgba(74, 144, 226, 0.3)',
	},
	animeTitleContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	animeMainTitle: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#ffffff',
		textAlign: 'center',
		marginBottom: 8,
		textShadowColor: '#4a90e2',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 10,
		fontFamily: 'serif', // Anime-style font
	},
	animeSubTitle: {
		fontSize: 18,
		color: '#4a90e2',
		textAlign: 'center',
		marginBottom: 12,
		fontWeight: '600',
		textShadowColor: 'rgba(74, 144, 226, 0.5)',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 5,
	},
	animeTagline: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.8)',
		textAlign: 'center',
		fontStyle: 'italic',
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	progressContainer: {
		alignItems: 'center',
		width: '80%',
		maxWidth: 300,
	},
	progressBarBackground: {
		width: '100%',
		height: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 4,
		marginBottom: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(74, 144, 226, 0.3)',
	},
	progressBarFill: {
		height: '100%',
		backgroundColor: '#4a90e2',
		borderRadius: 4,
		shadowColor: '#4a90e2',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
		elevation: 5,
	},
	progressText: {
		fontSize: 16,
		color: '#ffffff',
		fontWeight: '600',
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	skipButtonContainer: {
		marginTop: 30,
		paddingHorizontal: 30,
		paddingVertical: 15,
		backgroundColor: 'rgba(74, 144, 226, 0.2)',
		borderRadius: 25,
		borderWidth: 2,
		borderColor: '#4a90e2',
		shadowColor: '#4a90e2',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 15,
		elevation: 8,
	},
	skipButtonText: {
		fontSize: 18,
		color: '#ffffff',
		fontWeight: 'bold',
		textAlign: 'center',
		textShadowColor: '#4a90e2',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
	},
});
