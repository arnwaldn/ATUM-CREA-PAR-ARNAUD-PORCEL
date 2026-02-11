import Foundation
import Security

// MARK: - Keychain Manager

final class KeychainManager {
    static let shared = KeychainManager()

    private let service: String

    private init() {
        self.service = Bundle.main.bundleIdentifier ?? "com.app"
    }

    // MARK: - Public Methods

    func save(_ data: Data, for key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        // Delete existing item first
        SecItemDelete(query as CFDictionary)

        // Add new item
        var newQuery = query
        newQuery[kSecValueData as String] = data

        let status = SecItemAdd(newQuery as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    func save(_ string: String, for key: String) throws {
        guard let data = string.data(using: .utf8) else {
            throw KeychainError.encodingFailed
        }
        try save(data, for: key)
    }

    func load(for key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        switch status {
        case errSecSuccess:
            return result as? Data
        case errSecItemNotFound:
            return nil
        default:
            throw KeychainError.loadFailed(status)
        }
    }

    func loadString(for key: String) throws -> String? {
        guard let data = try load(for: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func delete(for key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }

    func deleteAll() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }
}

// MARK: - Keychain Error

enum KeychainError: LocalizedError {
    case saveFailed(OSStatus)
    case loadFailed(OSStatus)
    case deleteFailed(OSStatus)
    case encodingFailed

    var errorDescription: String? {
        switch self {
        case .saveFailed(let status):
            return "Erreur de sauvegarde Keychain: \(status)"
        case .loadFailed(let status):
            return "Erreur de lecture Keychain: \(status)"
        case .deleteFailed(let status):
            return "Erreur de suppression Keychain: \(status)"
        case .encodingFailed:
            return "Erreur d'encodage"
        }
    }
}

// MARK: - Token Storage

final class TokenStorage {
    static let shared = TokenStorage()

    private let keychain = KeychainManager.shared
    private let accessTokenKey = "accessToken"
    private let refreshTokenKey = "refreshToken"

    private init() {}

    var accessToken: String? {
        get { try? keychain.loadString(for: accessTokenKey) }
        set {
            if let token = newValue {
                try? keychain.save(token, for: accessTokenKey)
            } else {
                try? keychain.delete(for: accessTokenKey)
            }
        }
    }

    var refreshToken: String? {
        get { try? keychain.loadString(for: refreshTokenKey) }
        set {
            if let token = newValue {
                try? keychain.save(token, for: refreshTokenKey)
            } else {
                try? keychain.delete(for: refreshTokenKey)
            }
        }
    }

    func clearTokens() {
        accessToken = nil
        refreshToken = nil
    }
}
