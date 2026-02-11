# Flutter Starter Template - ATUM CREA

> **Architecture**: Clean Architecture (domain/data/presentation)
> **State**: Riverpod 3.0
> **Navigation**: GoRouter (declaratif, deep linking)
> **Design**: Material 3 + theming dynamique
> **Source**: momentous-developments/flutter-starter-app

---

## Structure du projet

```
lib/
├── main.dart                    # Entry point
├── app.dart                     # MaterialApp.router configuration
├── core/
│   ├── constants/               # App-wide constants
│   │   ├── app_colors.dart
│   │   ├── app_strings.dart
│   │   └── app_sizes.dart
│   ├── extensions/              # Dart extensions
│   │   ├── context_extensions.dart
│   │   └── string_extensions.dart
│   ├── router/                  # GoRouter configuration
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   ├── theme/                   # Material 3 theme
│   │   ├── app_theme.dart
│   │   └── color_schemes.dart
│   └── utils/                   # Utilities
│       ├── logger.dart
│       └── validators.dart
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart   # Abstract
│   │   │   └── usecases/
│   │   │       ├── sign_in.dart
│   │   │       └── sign_out.dart
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository_impl.dart
│   │   │   └── datasources/
│   │   │       └── auth_remote_source.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart     # Riverpod
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   └── register_screen.dart
│   │       └── widgets/
│   │           └── auth_form.dart
│   ├── home/
│   │   ├── domain/
│   │   ├── data/
│   │   └── presentation/
│   │       ├── providers/
│   │       ├── screens/
│   │       │   └── home_screen.dart
│   │       └── widgets/
│   └── settings/
│       ├── domain/
│       ├── data/
│       └── presentation/
│           ├── providers/
│           │   └── settings_provider.dart
│           ├── screens/
│           │   └── settings_screen.dart
│           └── widgets/
├── shared/
│   ├── providers/               # Global providers
│   │   └── supabase_provider.dart
│   ├── widgets/                 # Shared widgets
│   │   ├── app_scaffold.dart
│   │   ├── loading_indicator.dart
│   │   └── error_view.dart
│   └── services/               # Shared services
│       ├── storage_service.dart
│       └── notification_service.dart
├── l10n/                        # Internationalization
│   ├── app_en.arb
│   └── app_fr.arb
```

---

## Fichiers cles

### main.dart
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  runApp(const ProviderScope(child: MyApp()));
}
```

### app_router.dart (GoRouter)
```dart
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    ],
  );
});
```

### app_theme.dart (Material 3)
```dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    colorSchemeSeed: Colors.blue,
    brightness: Brightness.light,
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      filled: true,
    ),
    cardTheme: CardTheme(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );

  static ThemeData dark() => ThemeData(
    useMaterial3: true,
    colorSchemeSeed: Colors.blue,
    brightness: Brightness.dark,
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      filled: true,
    ),
    cardTheme: CardTheme(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );
}
```

---

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  flutter_riverpod: ^3.0.0
  riverpod_annotation: ^3.0.0
  go_router: ^14.0.0
  supabase_flutter: ^2.8.0
  flutter_secure_storage: ^9.2.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  riverpod_generator: ^3.0.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  flutter_lints: ^5.0.0
  mockito: ^5.4.0
  mocktail: ^1.0.0
```

---

## Commandes

```bash
# Creer le projet
flutter create --org com.monapp mon_app
cd mon_app

# Generer le code (Freezed, Riverpod, JSON)
dart run build_runner build --delete-conflicting-outputs

# Lancer en dev
flutter run

# Build production
flutter build apk --release
flutter build ios --release

# Tests
flutter test --coverage
```

---

## Checklist

- [ ] Clean Architecture (domain/data/presentation par feature)
- [ ] Riverpod 3.0 pour le state management
- [ ] GoRouter pour la navigation declarative
- [ ] Material 3 avec theming dynamique (light/dark)
- [ ] Supabase Flutter pour le backend
- [ ] Freezed pour les entites immutables
- [ ] Internationalization (ARB files)
- [ ] Secure storage pour les tokens
- [ ] Tests unitaires par feature
- [ ] CI/CD via Codemagic ou EAS

---

*Template ATUM CREA | Source: momentous-developments/flutter-starter-app*
