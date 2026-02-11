package com.example.app.domain.repository

import com.example.app.domain.model.Item
import kotlinx.coroutines.flow.Flow

interface ItemRepository {
    fun getItems(): Flow<List<Item>>
    suspend fun getItemById(id: String): Item
    suspend fun toggleFavorite(id: String)
    suspend fun saveItem(item: Item)
    suspend fun deleteItem(id: String)
}
