import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var appState: AppState
    @State private var showLogoutAlert = false

    var body: some View {
        NavigationStack {
            List {
                // Profile header
                Section {
                    HStack(spacing: 16) {
                        Circle()
                            .fill(.blue.gradient)
                            .frame(width: 70, height: 70)
                            .overlay {
                                Text(appState.user?.initials ?? "?")
                                    .font(.title)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(.white)
                            }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.user?.name ?? "Utilisateur")
                                .font(.headline)

                            Text(appState.user?.email ?? "")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        NavigationLink {
                            EditProfileView()
                        } label: {
                            Image(systemName: "pencil.circle.fill")
                                .font(.title2)
                                .foregroundStyle(.blue)
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Settings
                Section("Paramètres") {
                    NavigationLink {
                        NotificationSettingsView()
                    } label: {
                        SettingsRow(
                            icon: "bell.fill",
                            iconColor: .red,
                            title: "Notifications"
                        )
                    }

                    NavigationLink {
                        AppearanceSettingsView()
                    } label: {
                        SettingsRow(
                            icon: "paintpalette.fill",
                            iconColor: .purple,
                            title: "Apparence"
                        )
                    }

                    NavigationLink {
                        PrivacySettingsView()
                    } label: {
                        SettingsRow(
                            icon: "lock.fill",
                            iconColor: .green,
                            title: "Confidentialité"
                        )
                    }
                }

                // Support
                Section("Support") {
                    NavigationLink {
                        HelpCenterView()
                    } label: {
                        SettingsRow(
                            icon: "questionmark.circle.fill",
                            iconColor: .blue,
                            title: "Centre d'aide"
                        )
                    }

                    Button {
                        // TODO: Open email
                    } label: {
                        SettingsRow(
                            icon: "envelope.fill",
                            iconColor: .orange,
                            title: "Nous contacter"
                        )
                    }
                }

                // Account
                Section {
                    Button(role: .destructive) {
                        showLogoutAlert = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Se déconnecter")
                            Spacer()
                        }
                    }
                }

                // App info
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Bundle.main.appVersion)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Profil")
            .alert("Déconnexion", isPresented: $showLogoutAlert) {
                Button("Annuler", role: .cancel) {}
                Button("Se déconnecter", role: .destructive) {
                    appState.signOut()
                }
            } message: {
                Text("Êtes-vous sûr de vouloir vous déconnecter ?")
            }
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let iconColor: Color
    let title: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(iconColor)
                .clipShape(RoundedRectangle(cornerRadius: 6))

            Text(title)
                .foregroundStyle(.primary)
        }
    }
}

// MARK: - Placeholder Views

struct EditProfileView: View {
    var body: some View {
        Text("Modifier le profil")
            .navigationTitle("Modifier le profil")
    }
}

struct NotificationSettingsView: View {
    var body: some View {
        Text("Paramètres de notification")
            .navigationTitle("Notifications")
    }
}

struct AppearanceSettingsView: View {
    var body: some View {
        Text("Paramètres d'apparence")
            .navigationTitle("Apparence")
    }
}

struct PrivacySettingsView: View {
    var body: some View {
        Text("Paramètres de confidentialité")
            .navigationTitle("Confidentialité")
    }
}

struct HelpCenterView: View {
    var body: some View {
        Text("Centre d'aide")
            .navigationTitle("Aide")
    }
}

// MARK: - Extensions

extension Bundle {
    var appVersion: String {
        (infoDictionary?["CFBundleShortVersionString"] as? String) ?? "1.0.0"
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppState())
}
