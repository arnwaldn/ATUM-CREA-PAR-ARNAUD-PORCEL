package com.example.app.domain.model

data class Item(
    val id: String,
    val title: String,
    val subtitle: String,
    val description: String,
    val imageUrl: String?,
    val isFavorite: Boolean = false
)
