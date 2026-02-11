# Android Native App Template

> Jetpack Compose starter app with modern architecture and best practices

## Stack

- **Kotlin 2.0+** with coroutines
- **Jetpack Compose** for UI
- **Material 3** design system
- **Hilt** for dependency injection
- **Room** for local database
- **Retrofit** for networking
- **MVVM + Clean Architecture**

## Structure

```
app/
├── src/main/
│   ├── java/com/example/app/
│   │   ├── di/                     # Hilt modules
│   │   │   ├── AppModule.kt
│   │   │   ├── NetworkModule.kt
│   │   │   └── DatabaseModule.kt
│   │   ├── data/
│   │   │   ├── local/
│   │   │   │   ├── dao/
│   │   │   │   ├── entity/
│   │   │   │   └── AppDatabase.kt
│   │   │   ├── remote/
│   │   │   │   ├── api/
│   │   │   │   └── dto/
│   │   │   └── repository/
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── usecase/
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   ├── theme/
│   │   │   ├── navigation/
│   │   │   └── screens/
│   │   ├── util/
│   │   └── MyApp.kt
│   ├── res/
│   └── AndroidManifest.xml
├── build.gradle.kts
└── libs.versions.toml
```

## Getting Started

1. Open in Android Studio (Koala or newer)
2. Sync Gradle
3. Update `applicationId` in `build.gradle.kts`
4. Run on emulator or device

## Features

- [x] Jetpack Compose UI
- [x] Material 3 theming with dynamic colors
- [x] Dark mode support
- [x] MVVM architecture
- [x] Hilt dependency injection
- [x] Room database
- [x] Retrofit networking
- [x] Navigation Compose
- [x] StateFlow for state management
- [x] Kotlin Coroutines
- [x] Coil for image loading

## Requirements

- Android Studio Koala or newer
- Android SDK 24+ (minSdk)
- Kotlin 2.0+
- JDK 17+

## License

MIT
