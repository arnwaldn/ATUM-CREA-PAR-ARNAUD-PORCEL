import SwiftUI
import SwiftData

@main
struct MyApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
        .modelContainer(for: [CachedItem.self])
    }
}

@MainActor
final class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: User?
    @Published var isLoading = true

    private let authService: AuthServiceProtocol

    init(authService: AuthServiceProtocol = AuthService()) {
        self.authService = authService
        Task { await initialize() }
    }

    private func initialize() async {
        defer { isLoading = false }

        if TokenStorage.shared.accessToken != nil {
            do {
                user = try await authService.getCurrentUser()
                isAuthenticated = true
            } catch {
                TokenStorage.shared.clearTokens()
            }
        }
    }

    func signIn(email: String, password: String) async throws {
        let response = try await authService.signIn(email: email, password: password)
        TokenStorage.shared.accessToken = response.accessToken
        user = response.user
        isAuthenticated = true
    }

    func signOut() {
        TokenStorage.shared.clearTokens()
        user = nil
        isAuthenticated = false
    }
}
