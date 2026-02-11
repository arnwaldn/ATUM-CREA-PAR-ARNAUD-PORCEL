using UnityEngine;
using Game.Core;

namespace Game.Player
{
    public class PlayerHealth : MonoBehaviour
    {
        [Header("Health Settings")]
        [SerializeField] private int maxHealth = 100;
        [SerializeField] private int currentHealth;

        [Header("Invincibility")]
        [SerializeField] private float invincibilityDuration = 1f;
        [SerializeField] private bool isInvincible;

        [Header("Effects")]
        [SerializeField] private GameObject damageEffect;
        [SerializeField] private GameObject deathEffect;

        public int MaxHealth => maxHealth;
        public int CurrentHealth => currentHealth;
        public bool IsAlive => currentHealth > 0;
        public bool IsInvincible => isInvincible;

        public event System.Action<int, int> OnHealthChanged;
        public event System.Action OnDeath;

        private void Start()
        {
            currentHealth = maxHealth;
        }

        public void TakeDamage(int damage)
        {
            if (!IsAlive || isInvincible) return;

            currentHealth = Mathf.Max(0, currentHealth - damage);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);

            EventBus.Publish(new PlayerDamagedEvent
            {
                Damage = damage,
                CurrentHealth = currentHealth,
                MaxHealth = maxHealth
            });

            if (damageEffect != null)
            {
                Instantiate(damageEffect, transform.position, Quaternion.identity);
            }

            if (currentHealth <= 0)
            {
                Die();
            }
            else
            {
                StartCoroutine(InvincibilityCoroutine());
            }
        }

        public void Heal(int amount)
        {
            if (!IsAlive) return;

            currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }

        public void SetMaxHealth(int newMax, bool healToFull = false)
        {
            maxHealth = newMax;
            if (healToFull)
            {
                currentHealth = maxHealth;
            }
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }

        private void Die()
        {
            OnDeath?.Invoke();

            EventBus.Publish(new PlayerDeathEvent
            {
                Player = gameObject,
                Position = transform.position
            });

            if (deathEffect != null)
            {
                Instantiate(deathEffect, transform.position, Quaternion.identity);
            }

            GameManager.Instance.GameOver();
        }

        private System.Collections.IEnumerator InvincibilityCoroutine()
        {
            isInvincible = true;

            // Visual feedback (blinking)
            var renderers = GetComponentsInChildren<Renderer>();
            float elapsed = 0f;
            float blinkInterval = 0.1f;

            while (elapsed < invincibilityDuration)
            {
                foreach (var r in renderers)
                {
                    r.enabled = !r.enabled;
                }

                yield return new WaitForSeconds(blinkInterval);
                elapsed += blinkInterval;
            }

            // Ensure renderers are enabled
            foreach (var r in renderers)
            {
                r.enabled = true;
            }

            isInvincible = false;
        }

        public void ResetHealth()
        {
            currentHealth = maxHealth;
            isInvincible = false;
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }
    }
}
