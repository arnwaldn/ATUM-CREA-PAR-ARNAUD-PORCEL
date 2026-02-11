import SwiftUI

struct ExploreView: View {
    @State private var searchText = ""
    @State private var selectedCategory: Category?

    let categories: [Category] = [
        Category(name: "Populaires", icon: "flame.fill", color: .orange),
        Category(name: "Nouveautés", icon: "sparkles", color: .purple),
        Category(name: "Tendances", icon: "chart.line.uptrend.xyaxis", color: .green),
        Category(name: "Favoris", icon: "heart.fill", color: .red),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Categories
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(categories) { category in
                                CategoryCard(
                                    category: category,
                                    isSelected: selectedCategory?.id == category.id
                                ) {
                                    withAnimation {
                                        if selectedCategory?.id == category.id {
                                            selectedCategory = nil
                                        } else {
                                            selectedCategory = category
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Featured section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("À la une")
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.horizontal)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(0..<5) { index in
                                    FeaturedCard(index: index)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    // Grid section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Découvrir")
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.horizontal)

                        LazyVGrid(
                            columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ],
                            spacing: 16
                        ) {
                            ForEach(0..<8) { index in
                                GridCard(index: index)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Explorer")
            .searchable(text: $searchText, prompt: "Rechercher...")
        }
    }
}

struct Category: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let color: Color
}

struct CategoryCard: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: category.icon)
                    .font(.body)
                Text(category.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .foregroundStyle(isSelected ? .white : category.color)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? category.color : category.color.opacity(0.15))
            .clipShape(Capsule())
        }
    }
}

struct FeaturedCard: View {
    let index: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: URL(string: "https://picsum.photos/300/200?random=\(index + 10)")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(.gray.opacity(0.2))
            }
            .frame(width: 280, height: 160)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Text("Élément mis en avant \(index + 1)")
                .font(.headline)
                .lineLimit(1)

            Text("Description courte de l'élément")
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .frame(width: 280)
    }
}

struct GridCard: View {
    let index: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: URL(string: "https://picsum.photos/200/150?random=\(index + 20)")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(.gray.opacity(0.2))
            }
            .frame(height: 120)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            Text("Élément \(index + 1)")
                .font(.subheadline)
                .fontWeight(.medium)
                .lineLimit(1)
        }
    }
}

#Preview {
    ExploreView()
}
