using System;
using System.Collections.Generic;

namespace Game.Core
{
    /// <summary>
    /// Event Bus for decoupled communication between game systems
    /// </summary>
    public static class EventBus
    {
        private static readonly Dictionary<Type, List<Delegate>> subscribers = new();

        /// <summary>
        /// Subscribe to an event type
        /// </summary>
        public static void Subscribe<T>(Action<T> handler) where T : struct
        {
            var type = typeof(T);

            if (!subscribers.ContainsKey(type))
            {
                subscribers[type] = new List<Delegate>();
            }

            subscribers[type].Add(handler);
        }

        /// <summary>
        /// Unsubscribe from an event type
        /// </summary>
        public static void Unsubscribe<T>(Action<T> handler) where T : struct
        {
            var type = typeof(T);

            if (subscribers.ContainsKey(type))
            {
                subscribers[type].Remove(handler);
            }
        }

        /// <summary>
        /// Publish an event to all subscribers
        /// </summary>
        public static void Publish<T>(T eventData) where T : struct
        {
            var type = typeof(T);

            if (!subscribers.ContainsKey(type)) return;

            foreach (var handler in subscribers[type].ToArray())
            {
                ((Action<T>)handler)?.Invoke(eventData);
            }
        }

        /// <summary>
        /// Clear all subscribers (call on scene unload)
        /// </summary>
        public static void Clear()
        {
            subscribers.Clear();
        }
    }

    // Game Events
    public struct PlayerDeathEvent
    {
        public UnityEngine.GameObject Player;
        public UnityEngine.Vector3 Position;
    }

    public struct PlayerDamagedEvent
    {
        public int Damage;
        public int CurrentHealth;
        public int MaxHealth;
    }

    public struct ScoreChangedEvent
    {
        public int NewScore;
        public int PointsAdded;
    }

    public struct LevelCompleteEvent
    {
        public int LevelIndex;
        public float CompletionTime;
        public int Score;
    }

    public struct ItemCollectedEvent
    {
        public string ItemId;
        public string ItemType;
        public UnityEngine.Vector3 Position;
    }

    public struct EnemyDefeatedEvent
    {
        public string EnemyType;
        public int PointsAwarded;
        public UnityEngine.Vector3 Position;
    }

    public struct GamePausedEvent
    {
        public bool IsPaused;
    }

    public struct AudioEvent
    {
        public string SoundName;
        public float Volume;
        public UnityEngine.Vector3 Position;
    }
}
