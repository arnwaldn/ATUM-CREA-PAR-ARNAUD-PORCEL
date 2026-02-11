using UnityEngine;
using Game.Core;

namespace Game.UI
{
    public class UIManager : MonoBehaviour
    {
        [Header("Panels")]
        [SerializeField] private GameObject mainMenuPanel;
        [SerializeField] private GameObject hudPanel;
        [SerializeField] private GameObject pausePanel;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private GameObject victoryPanel;
        [SerializeField] private GameObject loadingPanel;

        private void Start()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged += OnGameStateChanged;
                OnGameStateChanged(GameManager.Instance.CurrentState);
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= OnGameStateChanged;
            }
        }

        private void OnGameStateChanged(GameState state)
        {
            HideAllPanels();

            switch (state)
            {
                case GameState.MainMenu:
                    ShowPanel(mainMenuPanel);
                    SetCursorState(true);
                    break;

                case GameState.Loading:
                    ShowPanel(loadingPanel);
                    break;

                case GameState.Playing:
                    ShowPanel(hudPanel);
                    SetCursorState(false);
                    break;

                case GameState.Paused:
                    ShowPanel(hudPanel);
                    ShowPanel(pausePanel);
                    SetCursorState(true);
                    break;

                case GameState.GameOver:
                    ShowPanel(gameOverPanel);
                    SetCursorState(true);
                    break;

                case GameState.Victory:
                    ShowPanel(victoryPanel);
                    SetCursorState(true);
                    break;
            }
        }

        private void HideAllPanels()
        {
            SetPanelActive(mainMenuPanel, false);
            SetPanelActive(hudPanel, false);
            SetPanelActive(pausePanel, false);
            SetPanelActive(gameOverPanel, false);
            SetPanelActive(victoryPanel, false);
            SetPanelActive(loadingPanel, false);
        }

        private void ShowPanel(GameObject panel)
        {
            SetPanelActive(panel, true);
        }

        private void SetPanelActive(GameObject panel, bool active)
        {
            if (panel != null)
            {
                panel.SetActive(active);
            }
        }

        private void SetCursorState(bool visible)
        {
            Cursor.visible = visible;
            Cursor.lockState = visible ? CursorLockMode.None : CursorLockMode.Locked;
        }

        // Button Handlers
        public void OnStartButtonClicked()
        {
            GameManager.Instance.StartGame();
        }

        public void OnResumeButtonClicked()
        {
            GameManager.Instance.ResumeGame();
        }

        public void OnRestartButtonClicked()
        {
            GameManager.Instance.RestartLevel();
        }

        public void OnMainMenuButtonClicked()
        {
            GameManager.Instance.ReturnToMenu();
        }

        public void OnQuitButtonClicked()
        {
            GameManager.Instance.QuitGame();
        }
    }
}
