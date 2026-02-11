import Foundation

// MARK: - User Model

struct User: Identifiable, Codable, Equatable {
    let id: String
    let email: String
    let name: String
    let avatarURL: URL?
    let createdAt: Date

    var initials: String {
        let components = name.components(separatedBy: " ")
        let first = components.first?.prefix(1) ?? ""
        let last = components.count > 1 ? components.last?.prefix(1) ?? "" : ""
        return "\(first)\(last)".uppercased()
    }

    var firstName: String {
        name.components(separatedBy: " ").first ?? name
    }
}

// MARK: - Auth Response

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: User
    let expiresIn: Int

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
        case expiresIn = "expires_in"
    }
}

// MARK: - Auth Service

protocol AuthServiceProtocol {
    func signIn(email: String, password: String) async throws -> AuthResponse
    func signUp(name: String, email: String, password: String) async throws -> AuthResponse
    func signOut() async throws
    func getCurrentUser() async throws -> User
    func refreshToken() async throws -> String
}

final class AuthService: AuthServiceProtocol {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol = APIClient()) {
        self.apiClient = apiClient
    }

    func signIn(email: String, password: String) async throws -> AuthResponse {
        // TODO: Replace with actual API call
        // return try await apiClient.request(
        //     Endpoint(
        //         path: "auth/login",
        //         method: .POST,
        //         body: ["email": email, "password": password]
        //     )
        // )

        // Mock for development
        try await Task.sleep(for: .seconds(1))

        return AuthResponse(
            accessToken: "mock_access_token_\(UUID().uuidString)",
            refreshToken: "mock_refresh_token",
            user: User(
                id: UUID().uuidString,
                email: email,
                name: "Utilisateur Test",
                avatarURL: nil,
                createdAt: Date()
            ),
            expiresIn: 3600
        )
    }

    func signUp(name: String, email: String, password: String) async throws -> AuthResponse {
        // TODO: Implement actual registration
        try await Task.sleep(for: .seconds(1))

        return AuthResponse(
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            user: User(
                id: UUID().uuidString,
                email: email,
                name: name,
                avatarURL: nil,
                createdAt: Date()
            ),
            expiresIn: 3600
        )
    }

    func signOut() async throws {
        // TODO: Call logout endpoint
        TokenStorage.shared.clearTokens()
    }

    func getCurrentUser() async throws -> User {
        // TODO: Replace with actual API call
        // return try await apiClient.request(Endpoint(path: "auth/me"))

        try await Task.sleep(for: .milliseconds(500))

        return User(
            id: UUID().uuidString,
            email: "user@example.com",
            name: "Utilisateur Test",
            avatarURL: nil,
            createdAt: Date()
        )
    }

    func refreshToken() async throws -> String {
        // TODO: Implement token refresh
        return "new_access_token"
    }
}
