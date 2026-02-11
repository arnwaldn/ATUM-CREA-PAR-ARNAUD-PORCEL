import SwiftUI

struct RegisterView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Créer un compte")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Rejoignez-nous pour commencer")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 32)

                // Form
                VStack(spacing: 16) {
                    TextField("Nom complet", text: $name)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.name)
                        .disabled(isLoading)

                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disabled(isLoading)

                    SecureField("Mot de passe", text: $password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.newPassword)
                        .disabled(isLoading)

                    SecureField("Confirmer le mot de passe", text: $confirmPassword)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.newPassword)
                        .disabled(isLoading)

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                    }
                }

                // Password requirements
                VStack(alignment: .leading, spacing: 4) {
                    RequirementRow(
                        text: "Au moins 8 caractères",
                        isMet: password.count >= 8
                    )
                    RequirementRow(
                        text: "Une majuscule",
                        isMet: password.contains(where: { $0.isUppercase })
                    )
                    RequirementRow(
                        text: "Un chiffre",
                        isMet: password.contains(where: { $0.isNumber })
                    )
                    RequirementRow(
                        text: "Mots de passe identiques",
                        isMet: !password.isEmpty && password == confirmPassword
                    )
                }
                .padding(.horizontal, 4)

                // Submit
                GradientButton(
                    "Créer mon compte",
                    isLoading: isLoading
                ) {
                    Task { await register() }
                }
                .disabled(!isFormValid)

                // Terms
                Text("En créant un compte, vous acceptez nos [Conditions d'utilisation](terms) et notre [Politique de confidentialité](privacy).")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    private var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        email.contains("@") &&
        password.count >= 8 &&
        password == confirmPassword
    }

    private func register() async {
        isLoading = true
        errorMessage = nil

        // TODO: Implement registration
        try? await Task.sleep(for: .seconds(2))

        isLoading = false
        dismiss()
    }
}

struct RequirementRow: View {
    let text: String
    let isMet: Bool

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(isMet ? .green : .gray)
                .font(.caption)

            Text(text)
                .font(.caption)
                .foregroundStyle(isMet ? .primary : .secondary)
        }
    }
}

#Preview {
    NavigationStack {
        RegisterView()
    }
}
