import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var appState: AppState
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Logo
            Image(systemName: "app.fill")
                .font(.system(size: 80))
                .foregroundStyle(.blue.gradient)

            Text("Bienvenue")
                .font(.largeTitle)
                .fontWeight(.bold)

            // Form
            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disabled(isLoading)

                SecureField("Mot de passe", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.password)
                    .disabled(isLoading)

                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal)

            // Actions
            VStack(spacing: 12) {
                GradientButton(
                    "Se connecter",
                    isLoading: isLoading
                ) {
                    Task { await signIn() }
                }
                .disabled(!isFormValid)

                NavigationLink {
                    RegisterView()
                } label: {
                    Text("Créer un compte")
                        .font(.subheadline)
                        .foregroundStyle(.blue)
                }
            }
            .padding(.horizontal)

            Spacer()

            // Social login
            VStack(spacing: 16) {
                Text("Ou continuer avec")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                HStack(spacing: 20) {
                    SocialLoginButton(provider: .apple)
                    SocialLoginButton(provider: .google)
                }
            }
            .padding(.bottom, 32)
        }
        .padding()
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }

    private func signIn() async {
        isLoading = true
        errorMessage = nil

        do {
            try await appState.signIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

struct SocialLoginButton: View {
    enum Provider {
        case apple, google

        var icon: String {
            switch self {
            case .apple: return "apple.logo"
            case .google: return "globe"
            }
        }
    }

    let provider: Provider

    var body: some View {
        Button {
            // TODO: Implement social login
        } label: {
            Image(systemName: provider.icon)
                .font(.title2)
                .frame(width: 50, height: 50)
                .background(.gray.opacity(0.1))
                .clipShape(Circle())
        }
        .foregroundStyle(.primary)
    }
}

#Preview {
    NavigationStack {
        LoginView()
            .environmentObject(AppState())
    }
}
