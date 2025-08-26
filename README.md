# University Ranking App

A comprehensive React Native mobile application for exploring university rankings, comparing institutions, and managing favorite universities. Built with Expo and featuring a modern, theme-aware interface.

## 📱 Features

### Core Functionality
- **University Search**: Search and filter universities by name, country, and ranking source
- **Detailed University Information**: View comprehensive details including rankings, statistics, and descriptions
- **Subject Rankings**: Browse rankings by different subjects and sources (US News, QS World Rankings)
- **Favorites Management**: Save and manage favorite universities with persistent storage
- **Theme Support**: Switch between light and dark themes with automatic preference saving

### User Experience
- **Responsive Design**: Optimized for both iOS and Android devices
- **Intuitive Navigation**: Bottom tab navigation with smooth transitions
- **Profile Management**: User preferences and favorites stored locally
- **Real-time Updates**: Automatic refresh of favorites when navigating between screens

## 🛠 Tech Stack

### Frontend
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (53.0.20) - Development platform and deployment
- **React Navigation** (7.1.6) - Navigation library
- **React Native Reanimated** (3.17.4) - Animations and gestures

### UI Components
- **React Native Elements** - UI component library
- **React Native Vector Icons** - Icon system
- **React Native Gesture Handler** - Touch and gesture handling
- **Gorhom Bottom Sheet** - Modal bottom sheets

### Data Management
- **AsyncStorage** - Local data persistence
- **Expo File System** - File management for user profiles
- **Axios** - HTTP client for API requests

### Development Tools
- **Expo Dev Client** - Custom development builds
- **Metro** - JavaScript bundler
- **ESLint/Babel** - Code quality and transpilation

## 📁 Project Structure

```
University_Ranking_Frontend/
├── app/                     # Main application screens
│   ├── App.js              # Root navigation component
│   ├── DetailPage.js       # University detail view
│   ├── MeScreen.js         # User profile and settings
│   ├── RankingDetailPage.js # Ranking details
│   ├── Search.js           # Search and filter interface
│   └── SubjectRankings.js  # Subject-based rankings
├── components/             # Reusable UI components
│   ├── Button.js          # Custom button component
│   └── Card.js            # Card layout components
├── contexts/              # React Context providers
│   └── ThemeContext.js    # Theme management
├── constants/             # App configuration
│   └── config.js          # API endpoints and settings
├── lib/                   # API and external services
│   └── api.js             # API client functions
├── utils/                 # Utility functions
│   └── textFormatter.js   # Text formatting helpers
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── eas.json              # Expo Application Services config
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xiaruize0911/University_Ranking_Frontend.git
   cd University_Ranking_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start --dev-client
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   # or
   expo run:ios

   # Android
   npm run android
   # or
   expo run:android
   ```

### Environment Setup

Ensure your development environment is properly configured:
- **iOS**: Xcode installed with iOS simulator
- **Android**: Android Studio with Android SDK and emulator
- **Expo Go App**: Install on physical device for testing

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run on web browser |

## 🔧 Configuration

### API Configuration
Update the API base URL in `constants/config.js`:
```javascript
export const API_BASE_URL = 'your-api-endpoint';
```

### Theme Customization
Modify theme colors in `contexts/ThemeContext.js`:
```javascript
const lightTheme = {
  primary: '#007AFF',
  background: '#FFFFFF',
  // ... other colors
};
```

## 📱 Key Screens

### 1. Search Screen
- University search with filters
- Country and ranking source selection
- Real-time search results
- Navigation to university details

### 2. Subject Rankings
- Browse rankings by subject
- Multiple ranking sources (US News, QS)
- Detailed ranking information

### 3. University Detail Page
- Comprehensive university information
- Add/remove from favorites
- Statistics and rankings display
- Photo and description

### 4. Me Screen (Profile)
- Theme selection (Light/Dark mode)
- Favorites management
- User profile with preferences
- Profile data persistence

## 🎨 Features in Detail

### Theme System
- **Automatic Theme Switching**: Seamless light/dark mode toggle
- **Persistent Preferences**: Theme choice saved locally
- **Consistent Styling**: All components respect theme settings

### Favorites System
- **Persistent Storage**: Favorites saved using AsyncStorage
- **Real-time Updates**: Automatic refresh across screens
- **Profile Integration**: Favorite count tracked in user profile

### User Profile
- **Local Storage**: Profile data saved to JSON file
- **Theme Preferences**: Automatic theme preference tracking
- **Usage Statistics**: Favorite count and last updated timestamps

## 🔐 Data Storage

### AsyncStorage
- Favorite universities list
- User preferences
- App state management

### File System
- User profile JSON file
- Theme preferences

## 📦 Dependencies

### Core Dependencies
- **@react-navigation/native**: Navigation framework
- **@react-native-async-storage/async-storage**: Local storage
- **axios**: HTTP client for API requests
- **expo-file-system**: File management capabilities

### UI Dependencies
- **react-native-elements**: UI component library
- **@expo/vector-icons**: Icon system
- **react-native-gesture-handler**: Touch gestures
- **@gorhom/bottom-sheet**: Modal sheets

## 🚀 Deployment

### Expo Application Services (EAS)
The app is configured for deployment using EAS:

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Build Configuration
- **Bundle Identifier**: `com.xiaruize.universityranking`
- **Version**: 1.0.0
- **Expo SDK**: 53.0.20

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx expo start --clear
```

**iOS build issues:**
```bash
cd ios && pod install
```

**Android build issues:**
```bash
npx expo run:android --clear
```

**Dependency conflicts:**
```bash
rm -rf node_modules
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**xiaruize**
- GitHub: [@xiaruize0911](https://github.com/xiaruize0911)
- Email: [xiaruize0911@gmail.com](mailto:xiaruize0911@gmail.com)

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community for comprehensive documentation
- University ranking data providers
- Open source contributors

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React Native and Expo
