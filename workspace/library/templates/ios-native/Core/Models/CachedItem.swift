import Foundation
import SwiftData

// MARK: - SwiftData Model for Caching

@Model
final class CachedItem {
    @Attribute(.unique)
    var id: String

    var title: String
    var subtitle: String
    var itemDescription: String
    var imageURLString: String?
    var isFavorite: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        id: String = UUID().uuidString,
        title: String,
        subtitle: String,
        itemDescription: String = "",
        imageURLString: String? = nil,
        isFavorite: Bool = false
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.itemDescription = itemDescription
        self.imageURLString = imageURLString
        self.isFavorite = isFavorite
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    var imageURL: URL? {
        guard let urlString = imageURLString else { return nil }
        return URL(string: urlString)
    }

    func toDomain() -> Item {
        Item(
            id: id,
            title: title,
            subtitle: subtitle,
            description: itemDescription,
            imageURL: imageURL,
            isFavorite: isFavorite
        )
    }

    func update(from item: Item) {
        self.title = item.title
        self.subtitle = item.subtitle
        self.itemDescription = item.description
        self.imageURLString = item.imageURL?.absoluteString
        self.isFavorite = item.isFavorite
        self.updatedAt = Date()
    }
}

// MARK: - SwiftData Repository

@MainActor
final class ItemRepository {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    func fetchAll() throws -> [Item] {
        let descriptor = FetchDescriptor<CachedItem>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    func fetch(id: String) throws -> Item? {
        let predicate = #Predicate<CachedItem> { $0.id == id }
        let descriptor = FetchDescriptor<CachedItem>(predicate: predicate)
        return try modelContext.fetch(descriptor).first?.toDomain()
    }

    func save(_ item: Item) throws {
        let predicate = #Predicate<CachedItem> { $0.id == item.id }
        let descriptor = FetchDescriptor<CachedItem>(predicate: predicate)

        if let existing = try modelContext.fetch(descriptor).first {
            existing.update(from: item)
        } else {
            let cached = CachedItem(
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                itemDescription: item.description,
                imageURLString: item.imageURL?.absoluteString,
                isFavorite: item.isFavorite
            )
            modelContext.insert(cached)
        }

        try modelContext.save()
    }

    func saveAll(_ items: [Item]) throws {
        for item in items {
            try save(item)
        }
    }

    func delete(id: String) throws {
        let predicate = #Predicate<CachedItem> { $0.id == id }
        let descriptor = FetchDescriptor<CachedItem>(predicate: predicate)

        if let item = try modelContext.fetch(descriptor).first {
            modelContext.delete(item)
            try modelContext.save()
        }
    }

    func deleteAll() throws {
        try modelContext.delete(model: CachedItem.self)
        try modelContext.save()
    }
}
