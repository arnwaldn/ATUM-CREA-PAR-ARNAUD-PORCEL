using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Game.Core;
using Game.Player;

namespace Game.UI
{
    public class HUDController : MonoBehaviour
    {
        [Header("Health")]
        [SerializeField] private Slider healthSlider;
        [SerializeField] private TextMeshProUGUI healthText;
        [SerializeField] private Image healthFill;
        [SerializeField] private Gradient healthGradient;

        [Header("Score")]
        [SerializeField] private TextMeshProUGUI scoreText;
        [SerializeField] private TextMeshProUGUI highScoreText;

        [Header("Timer")]
        [SerializeField] private TextMeshProUGUI timerText;

        [Header("References")]
        [SerializeField] private PlayerHealth playerHealth;

        private void Start()
        {
            // Subscribe to events
            if (playerHealth != null)
            {
                playerHealth.OnHealthChanged += UpdateHealthUI;
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnScoreChanged += UpdateScoreUI;
                UpdateScoreUI(GameManager.Instance.Score);
                UpdateHighScoreUI(GameManager.Instance.HighScore);
            }

            EventBus.Subscribe<PlayerDamagedEvent>(OnPlayerDamaged);
            EventBus.Subscribe<ScoreChangedEvent>(OnScoreChanged);
        }

        private void OnDestroy()
        {
            if (playerHealth != null)
            {
                playerHealth.OnHealthChanged -= UpdateHealthUI;
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnScoreChanged -= UpdateScoreUI;
            }

            EventBus.Unsubscribe<PlayerDamagedEvent>(OnPlayerDamaged);
            EventBus.Unsubscribe<ScoreChangedEvent>(OnScoreChanged);
        }

        private void Update()
        {
            UpdateTimerUI();
        }

        private void UpdateHealthUI(int current, int max)
        {
            if (healthSlider != null)
            {
                healthSlider.maxValue = max;
                healthSlider.value = current;
            }

            if (healthText != null)
            {
                healthText.text = $"{current}/{max}";
            }

            if (healthFill != null && healthGradient != null)
            {
                healthFill.color = healthGradient.Evaluate((float)current / max);
            }
        }

        private void UpdateScoreUI(int score)
        {
            if (scoreText != null)
            {
                scoreText.text = $"Score: {score:N0}";
            }
        }

        private void UpdateHighScoreUI(int highScore)
        {
            if (highScoreText != null)
            {
                highScoreText.text = $"Best: {highScore:N0}";
            }
        }

        private void UpdateTimerUI()
        {
            if (timerText != null && GameManager.Instance != null)
            {
                float time = GameManager.Instance.GameTime;
                int minutes = Mathf.FloorToInt(time / 60);
                int seconds = Mathf.FloorToInt(time % 60);
                timerText.text = $"{minutes:00}:{seconds:00}";
            }
        }

        private void OnPlayerDamaged(PlayerDamagedEvent evt)
        {
            UpdateHealthUI(evt.CurrentHealth, evt.MaxHealth);
            // Add screen shake or flash effect here
        }

        private void OnScoreChanged(ScoreChangedEvent evt)
        {
            UpdateScoreUI(evt.NewScore);
            // Add score popup animation here
        }
    }
}
