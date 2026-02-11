import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                switch viewModel.state {
                case .loading:
                    ProgressView("Chargement...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)

                case .loaded(let items):
                    itemsList(items)

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { Task { await viewModel.loadItems() } }
                    )
                }
            }
            .navigationTitle("Accueil")
            .searchable(text: $searchText, prompt: "Rechercher...")
            .refreshable {
                await viewModel.loadItems()
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        // Add action
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
        }
        .task {
            await viewModel.loadItems()
        }
    }

    @ViewBuilder
    private func itemsList(_ items: [Item]) -> some View {
        let filteredItems = items.filter { item in
            searchText.isEmpty || item.title.localizedCaseInsensitiveContains(searchText)
        }

        if filteredItems.isEmpty {
            ContentUnavailableView(
                "Aucun résultat",
                systemImage: "magnifyingglass",
                description: Text("Essayez une autre recherche")
            )
        } else {
            List(filteredItems) { item in
                NavigationLink(value: item) {
                    ItemRow(item: item)
                }
            }
            .listStyle(.plain)
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
        }
    }
}

struct ItemRow: View {
    let item: Item

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: item.imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(.gray.opacity(0.2))
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.headline)
                    .lineLimit(1)

                Text(item.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer()

            if item.isFavorite {
                Image(systemName: "heart.fill")
                    .foregroundStyle(.red)
            }
        }
        .padding(.vertical, 4)
    }
}

struct ItemDetailView: View {
    let item: Item

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: item.imageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(.gray.opacity(0.2))
                }
                .frame(height: 250)
                .clipped()

                VStack(alignment: .leading, spacing: 12) {
                    Text(item.title)
                        .font(.title)
                        .fontWeight(.bold)

                    Text(item.subtitle)
                        .font(.body)
                        .foregroundStyle(.secondary)

                    Divider()

                    Text(item.description)
                        .font(.body)
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle(item.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    HomeView()
}
