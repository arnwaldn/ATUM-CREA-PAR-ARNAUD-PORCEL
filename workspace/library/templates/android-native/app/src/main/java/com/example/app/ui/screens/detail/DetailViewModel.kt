package com.example.app.ui.screens.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.app.domain.model.Item
import com.example.app.domain.repository.ItemRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface DetailUiState {
    data object Loading : DetailUiState
    data class Success(val item: Item) : DetailUiState
    data class Error(val message: String) : DetailUiState
}

@HiltViewModel
class DetailViewModel @Inject constructor(
    private val itemRepository: ItemRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DetailUiState>(DetailUiState.Loading)
    val uiState: StateFlow<DetailUiState> = _uiState.asStateFlow()

    private var currentItemId: String? = null

    fun loadItem(id: String) {
        currentItemId = id

        viewModelScope.launch {
            _uiState.value = DetailUiState.Loading

            try {
                val item = itemRepository.getItemById(id)
                _uiState.value = DetailUiState.Success(item)
            } catch (e: Exception) {
                _uiState.value = DetailUiState.Error(
                    e.message ?: "Erreur lors du chargement"
                )
            }
        }
    }

    fun toggleFavorite() {
        val currentState = _uiState.value
        if (currentState !is DetailUiState.Success) return

        viewModelScope.launch {
            try {
                itemRepository.toggleFavorite(currentState.item.id)
                loadItem(currentState.item.id)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
