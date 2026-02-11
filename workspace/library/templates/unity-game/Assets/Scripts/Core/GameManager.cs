using UnityEngine;
using UnityEngine.SceneManagement;

namespace Game.Core
{
    public enum GameState
    {
        MainMenu,
        Loading,
        Playing,
        Paused,
        GameOver,
        Victory
    }

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private GameState currentState = GameState.MainMenu;

        [Header("Game Data")]
        [SerializeField] private int score;
        [SerializeField] private int highScore;
        [SerializeField] private float gameTime;

        public GameState CurrentState => currentState;
        public int Score => score;
        public int HighScore => highScore;
        public float GameTime => gameTime;

        public event System.Action<GameState> OnStateChanged;
        public event System.Action<int> OnScoreChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadHighScore();
        }

        private void Update()
        {
            if (currentState == GameState.Playing)
            {
                gameTime += Time.deltaTime;
            }

            // Pause with Escape
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (currentState == GameState.Playing)
                    PauseGame();
                else if (currentState == GameState.Paused)
                    ResumeGame();
            }
        }

        public void SetState(GameState newState)
        {
            if (currentState == newState) return;

            currentState = newState;
            OnStateChanged?.Invoke(currentState);

            switch (newState)
            {
                case GameState.Playing:
                    Time.timeScale = 1f;
                    break;
                case GameState.Paused:
                    Time.timeScale = 0f;
                    break;
                case GameState.GameOver:
                    Time.timeScale = 0f;
                    SaveHighScore();
                    break;
            }
        }

        public void StartGame()
        {
            score = 0;
            gameTime = 0f;
            SetState(GameState.Playing);
            SceneManager.LoadScene("GameScene");
        }

        public void PauseGame()
        {
            SetState(GameState.Paused);
        }

        public void ResumeGame()
        {
            SetState(GameState.Playing);
        }

        public void GameOver()
        {
            SetState(GameState.GameOver);
        }

        public void Victory()
        {
            SetState(GameState.Victory);
            SaveHighScore();
        }

        public void ReturnToMenu()
        {
            Time.timeScale = 1f;
            SetState(GameState.MainMenu);
            SceneManager.LoadScene("MainMenu");
        }

        public void AddScore(int points)
        {
            score += points;
            OnScoreChanged?.Invoke(score);

            if (score > highScore)
            {
                highScore = score;
            }
        }

        public void RestartLevel()
        {
            score = 0;
            gameTime = 0f;
            SetState(GameState.Playing);
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }

        private void LoadHighScore()
        {
            highScore = PlayerPrefs.GetInt("HighScore", 0);
        }

        private void SaveHighScore()
        {
            if (score > highScore)
            {
                highScore = score;
                PlayerPrefs.SetInt("HighScore", highScore);
                PlayerPrefs.Save();
            }
        }

        public void QuitGame()
        {
            SaveHighScore();
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }
}
