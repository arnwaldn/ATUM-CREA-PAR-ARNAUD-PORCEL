import SwiftUI

struct GradientButton: View {
    let title: String
    let icon: String?
    let gradient: [Color]
    let isLoading: Bool
    let action: () -> Void

    @State private var isPressed = false

    init(
        _ title: String,
        icon: String? = nil,
        gradient: [Color] = [.blue, .purple],
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.gradient = gradient
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                // Background
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: gradient,
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )

                // Content
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(.white)
                } else {
                    HStack(spacing: 8) {
                        if let icon {
                            Image(systemName: icon)
                        }
                        Text(title)
                            .fontWeight(.semibold)
                    }
                    .foregroundStyle(.white)
                }
            }
            .frame(height: 50)
        }
        .disabled(isLoading)
        .scaleEffect(isPressed ? 0.98 : 1)
        .animation(.easeInOut(duration: 0.1), value: isPressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

// MARK: - Secondary Button

struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon {
                    Image(systemName: icon)
                }
                Text(title)
                    .fontWeight(.medium)
            }
            .foregroundStyle(.blue)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.blue.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

// MARK: - Icon Button

struct CircleIconButton: View {
    let icon: String
    let size: CGFloat
    let action: () -> Void

    init(
        icon: String,
        size: CGFloat = 44,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.size = size
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size * 0.4))
                .frame(width: size, height: size)
                .background(.gray.opacity(0.1))
                .clipShape(Circle())
        }
        .foregroundStyle(.primary)
    }
}

#Preview {
    VStack(spacing: 20) {
        GradientButton("Continuer", icon: "arrow.right") {
            print("Tapped")
        }

        GradientButton("Chargement...", isLoading: true) {}

        SecondaryButton("Action secondaire", icon: "star") {
            print("Secondary")
        }

        HStack {
            CircleIconButton(icon: "heart") {}
            CircleIconButton(icon: "square.and.arrow.up") {}
            CircleIconButton(icon: "ellipsis") {}
        }
    }
    .padding()
}
