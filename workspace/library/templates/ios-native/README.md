# iOS Native App Template

> SwiftUI starter app with modern architecture and best practices

## Stack

- **Swift 5.9+** with strict concurrency
- **SwiftUI** (iOS 16+)
- **SwiftData** for persistence
- **MVVM + Coordinator** architecture
- **Async/await** networking
- **Keychain** for secure storage

## Structure

```
MyApp/
├── MyApp.swift              # App entry point
├── ContentView.swift        # Root view
├── Features/
│   ├── Home/
│   │   ├── HomeView.swift
│   │   └── HomeViewModel.swift
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   ├── RegisterView.swift
│   │   └── AuthViewModel.swift
│   └── Profile/
│       ├── ProfileView.swift
│       └── ProfileViewModel.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── Endpoints.swift
│   │   └── APIError.swift
│   ├── Storage/
│   │   ├── KeychainManager.swift
│   │   └── TokenStorage.swift
│   ├── Models/
│   │   ├── User.swift
│   │   └── Product.swift
│   └── Extensions/
│       └── View+Extensions.swift
├── Components/
│   ├── GradientButton.swift
│   ├── AsyncImageView.swift
│   └── ErrorView.swift
├── Resources/
│   ├── Assets.xcassets/
│   └── Localizable.strings
└── Tests/
    ├── UnitTests/
    └── UITests/
```

## Getting Started

1. Open in Xcode 15+
2. Update Bundle Identifier
3. Configure signing
4. Run on simulator or device

## Features

- [x] SwiftUI declarative UI
- [x] Dark mode support
- [x] MVVM architecture
- [x] Async/await networking
- [x] Keychain storage
- [x] SwiftData persistence
- [x] Navigation with NavigationStack
- [x] Custom components
- [x] Unit tests setup
- [x] UI tests setup

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## License

MIT
