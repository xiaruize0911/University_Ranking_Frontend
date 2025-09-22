import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
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

// Anime-themed Loading Component with Forced Watch
function LoadingScreen({ onLoadingComplete }) {
	const { currentLanguage } = useLanguage();
	const { isDarkMode } = useTheme();
	const [fadeAnim] = useState(new Animated.Value(0));
	const [scaleAnim] = useState(new Animated.Value(0.5));
	const [progressAnim] = useState(new Animated.Value(0));
	const [textAnim] = useState(new Animated.Value(0));
	const [particleAnim1] = useState(new Animated.Value(0));
	const [particleAnim2] = useState(new Animated.Value(0));
	const [particleAnim3] = useState(new Animated.Value(0));
	const [showSkipButton, setShowSkipButton] = useState(false);
	const [isComplete, setIsComplete] = useState(false);

	// Language-specific content
	const loadingTexts = {
		en: {
			mainTitle: 'University Rankings',
			subTitle: 'University Rankings',
			tagline: '"Together, one step towards the future"',
			loadingText: 'Loading data...',
			completeText: 'Ready!',
			skipButton: 'Tap to Start'
		},
		zh: {
			mainTitle: '大学排名',
			subTitle: 'University Rankings',
			tagline: '"一起迈向未来的步伐"',
			loadingText: '数据加载中...',
			completeText: '准备完成！',
			skipButton: '点击开始'
		}
	};

	const currentTexts = loadingTexts[currentLanguage] || loadingTexts.en;

	// Dynamic styles based on theme
	const getLoadingStyles = (isDark) => ({
		loadingContainer: {
			flex: 1,
			backgroundColor: isDark ? '#0f0f23' : '#f0f8ff', // Dark blue-black vs light blue-white
			justifyContent: 'center',
			alignItems: 'center',
		},
		animeMainTitle: {
			fontSize: 32,
			fontWeight: 'bold',
			color: isDark ? '#ffffff' : '#2c3e50', // White vs dark text
			textAlign: 'center',
			marginBottom: 8,
			textShadowColor: '#4a90e2',
			textShadowOffset: { width: 0, height: 0 },
			textShadowRadius: 10,
			fontFamily: 'serif',
		},
		animeTagline: {
			fontSize: 14,
			color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(44, 62, 80, 0.7)', // Light white vs dark gray
			textAlign: 'center',
			fontStyle: 'italic',
			textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(74, 144, 226, 0.3)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
		},
		progressBarBackground: {
			width: '100%',
			height: 8,
			backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(74, 144, 226, 0.2)', // Light white vs light blue
			borderRadius: 4,
			marginBottom: 16,
			overflow: 'hidden',
			borderWidth: 1,
			borderColor: isDark ? 'rgba(74, 144, 226, 0.3)' : 'rgba(74, 144, 226, 0.4)',
		},
		progressText: {
			fontSize: 16,
			color: isDark ? '#ffffff' : '#2c3e50', // White vs dark text
			fontWeight: '600',
			textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(74, 144, 226, 0.3)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 3,
		},
		skipButtonText: {
			fontSize: 18,
			color: isDark ? '#ffffff' : '#2c3e50', // White vs dark text
			fontWeight: 'bold',
			textAlign: 'center',
			textShadowColor: '#4a90e2',
			textShadowOffset: { width: 0, height: 0 },
			textShadowRadius: 8,
		},
	});

	const loadingStyles = getLoadingStyles(isDarkMode);

	useEffect(() => {
		// Start the anime-style loading sequence
		const startAnimeLoading = async () => {
			// Phase 1: Dramatic entrance
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 1000,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 15,
					friction: 5,
					useNativeDriver: true,
				}),
			]).start();

			// Wait a bit then start the main sequence
			setTimeout(() => {
				// Phase 2: Text animation
				Animated.timing(textAnim, {
					toValue: 1,
					duration: 800,
					easing: Easing.out(Easing.elastic(1)),
					useNativeDriver: true,
				}).start();

				// Phase 3: Progress bar animation (forced 3-second watch)
				setTimeout(() => {
					Animated.timing(progressAnim, {
						toValue: 1,
						duration: 3000, // 3 seconds of forced watching
						easing: Easing.linear,
						useNativeDriver: false,
					}).start(() => {
						// Phase 4: Completion effects
						setIsComplete(true);
						setShowSkipButton(true);

						// Particle effects
						Animated.stagger(200, [
							Animated.spring(particleAnim1, {
								toValue: 1,
								tension: 20,
								friction: 7,
								useNativeDriver: true,
							}),
							Animated.spring(particleAnim2, {
								toValue: 1,
								tension: 20,
								friction: 7,
								useNativeDriver: true,
							}),
							Animated.spring(particleAnim3, {
								toValue: 1,
								tension: 20,
								friction: 7,
								useNativeDriver: true,
							}),
						]).start();

						// No auto-advance - user must tap the button
					});
				}, 500);
			}, 800);
		};

		startAnimeLoading();
	}, []);

	const progressWidth = progressAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	});

	const particleStyle = (anim) => ({
		opacity: anim,
		transform: [
			{
				scale: anim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 1.5],
				}),
			},
			{
				translateY: anim.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -50],
				}),
			},
		],
	});

	return (
		<View style={loadingStyles.loadingContainer}>
			{/* Background particles */}
			<View style={styles.particlesContainer}>
				<Animated.Text style={[styles.particle, styles.particle1, particleStyle(particleAnim1)]}>
					✨
				</Animated.Text>
				<Animated.Text style={[styles.particle, styles.particle2, particleStyle(particleAnim2)]}>
					⭐
				</Animated.Text>
				<Animated.Text style={[styles.particle, styles.particle3, particleStyle(particleAnim3)]}>
					🌟
				</Animated.Text>
			</View>

			<Animated.View
				style={[
					styles.loadingContent,
					{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					},
				]}
			>
				{/* Anime-style logo */}
				<View style={styles.animeLogoContainer}>
					<View style={styles.animeLogo}>
						<Text style={styles.animeLogoText}>🎓</Text>
						<View style={styles.animeGlow} />
					</View>
				</View>

				{/* Anime-style title with dramatic effect */}
				<Animated.View
					style={[
						styles.animeTitleContainer,
						{
							opacity: textAnim,
							transform: [
								{
									scale: textAnim.interpolate({
										inputRange: [0, 0.5, 1],
										outputRange: [0.8, 1.2, 1],
									}),
								},
							],
						},
					]}
				>
					<Text style={loadingStyles.animeMainTitle}>{currentTexts.mainTitle}</Text>
					<Text style={styles.animeSubTitle}>{currentTexts.subTitle}</Text>
					<Text style={loadingStyles.animeTagline}>{currentTexts.tagline}</Text>
				</Animated.View>

				{/* Progress bar with anime styling */}
				<View style={styles.progressContainer}>
					<View style={loadingStyles.progressBarBackground}>
						<Animated.View
							style={[
								styles.progressBarFill,
								{ width: progressWidth },
							]}
						/>
					</View>
					<Text style={loadingStyles.progressText}>
						{isComplete ? currentTexts.completeText : currentTexts.loadingText}
					</Text>
				</View>

				{/* Skip button (only shows after completion) */}
				{showSkipButton && (
					<Animated.View
						style={[
							styles.skipButtonContainer,
							{
								opacity: Animated.add(particleAnim1, particleAnim2, particleAnim3).interpolate({
									inputRange: [0, 3],
									outputRange: [0, 1],
								}),
							},
						]}
					>
						<TouchableOpacity onPress={onLoadingComplete} activeOpacity={0.8}>
							<Text style={loadingStyles.skipButtonText}>{currentTexts.skipButton}</Text>
						</TouchableOpacity>
					</Animated.View>
				)}
			</Animated.View>
		</View>
	);
}

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
	const [showAnimeLoading, setShowAnimeLoading] = useState(true);

	useInitUniversityNameTranslations(setIsLoading);

	const handleAnimeLoadingComplete = () => {
		setShowAnimeLoading(false);
	};

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<LanguageProvider>
					<RankingsProvider>
						{showAnimeLoading ? (
							<LoadingScreen onLoadingComplete={handleAnimeLoadingComplete} />
						) : isLoading ? (
							<LoadingScreen onLoadingComplete={() => { }} />
						) : (
							<AppContent />
						)}
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
