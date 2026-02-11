package com.example.app.data.repository

import com.example.app.domain.model.Item
import com.example.app.domain.repository.ItemRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ItemRepositoryImpl @Inject constructor(
    // private val apiService: ApiService,
    // private val itemDao: ItemDao
) : ItemRepository {

    // Mock data for development
    private val mockItems = mutableListOf(
        Item(
            id = "1",
            title = "Premier élément",
            subtitle = "Description du premier élément",
            description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            imageUrl = "https://picsum.photos/200/200?random=1",
            isFavorite = true
        ),
        Item(
            id = "2",
            title = "Deuxième élément",
            subtitle = "Description du deuxième élément",
            description = "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            imageUrl = "https://picsum.photos/200/200?random=2",
            isFavorite = false
        ),
        Item(
            id = "3",
            title = "Troisième élément",
            subtitle = "Description du troisième élément",
            description = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            imageUrl = "https://picsum.photos/200/200?random=3",
            isFavorite = false
        )
    )

    override fun getItems(): Flow<List<Item>> = flow {
        delay(1000) // Simulate network delay
        emit(mockItems.toList())
    }

    override suspend fun getItemById(id: String): Item {
        delay(500)
        return mockItems.find { it.id == id }
            ?: throw NoSuchElementException("Item not found: $id")
    }

    override suspend fun toggleFavorite(id: String) {
        delay(300)
        val index = mockItems.indexOfFirst { it.id == id }
        if (index >= 0) {
            val item = mockItems[index]
            mockItems[index] = item.copy(isFavorite = !item.isFavorite)
        }
    }

    override suspend fun saveItem(item: Item) {
        delay(300)
        val index = mockItems.indexOfFirst { it.id == item.id }
        if (index >= 0) {
            mockItems[index] = item
        } else {
            mockItems.add(item)
        }
    }

    override suspend fun deleteItem(id: String) {
        delay(300)
        mockItems.removeIf { it.id == id }
    }
}
