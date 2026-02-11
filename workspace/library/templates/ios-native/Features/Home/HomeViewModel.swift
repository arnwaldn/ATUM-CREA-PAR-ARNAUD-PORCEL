import Foundation

@MainActor
final class HomeViewModel: ObservableObject {
    enum State {
        case loading
        case loaded([Item])
        case error(String)
    }

    @Published private(set) var state: State = .loading

    private let itemService: ItemServiceProtocol

    init(itemService: ItemServiceProtocol = ItemService()) {
        self.itemService = itemService
    }

    func loadItems() async {
        state = .loading

        do {
            let items = try await itemService.fetchItems()
            state = .loaded(items)
        } catch {
            state = .error(error.localizedDescription)
        }
    }

    func toggleFavorite(for item: Item) async {
        do {
            try await itemService.toggleFavorite(itemId: item.id)
            await loadItems()
        } catch {
            // Handle error silently or show toast
        }
    }
}

// MARK: - Item Model

struct Item: Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let description: String
    let imageURL: URL?
    var isFavorite: Bool

    init(
        id: String = UUID().uuidString,
        title: String,
        subtitle: String,
        description: String = "",
        imageURL: URL? = nil,
        isFavorite: Bool = false
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.description = description
        self.imageURL = imageURL
        self.isFavorite = isFavorite
    }
}

// MARK: - Item Service

protocol ItemServiceProtocol {
    func fetchItems() async throws -> [Item]
    func toggleFavorite(itemId: String) async throws
}

final class ItemService: ItemServiceProtocol {
    private let apiClient: APIClientProtocol

    init(apiClient: APIClientProtocol = APIClient()) {
        self.apiClient = apiClient
    }

    func fetchItems() async throws -> [Item] {
        // TODO: Replace with actual API call
        // let dto: [ItemDTO] = try await apiClient.request(Endpoint(path: "items"))
        // return dto.map { $0.toDomain() }

        // Mock data for development
        try await Task.sleep(for: .seconds(1))

        return [
            Item(
                title: "Premier élément",
                subtitle: "Description du premier élément",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                imageURL: URL(string: "https://picsum.photos/200/200?random=1"),
                isFavorite: true
            ),
            Item(
                title: "Deuxième élément",
                subtitle: "Description du deuxième élément",
                description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                imageURL: URL(string: "https://picsum.photos/200/200?random=2")
            ),
            Item(
                title: "Troisième élément",
                subtitle: "Description du troisième élément",
                description: "Ut enim ad minim veniam, quis nostrud exercitation.",
                imageURL: URL(string: "https://picsum.photos/200/200?random=3")
            )
        ]
    }

    func toggleFavorite(itemId: String) async throws {
        // TODO: Implement API call
        try await Task.sleep(for: .milliseconds(500))
    }
}
