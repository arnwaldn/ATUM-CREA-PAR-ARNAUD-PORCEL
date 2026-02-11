using System;
using System.Collections.Generic;
using UnityEngine;

namespace Game.Core
{
    /// <summary>
    /// Simple Service Locator for dependency injection
    /// </summary>
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> services = new();

        /// <summary>
        /// Register a service implementation
        /// </summary>
        public static void Register<T>(T service) where T : class
        {
            var type = typeof(T);

            if (services.ContainsKey(type))
            {
                Debug.LogWarning($"Service {type.Name} is already registered. Replacing.");
            }

            services[type] = service;
        }

        /// <summary>
        /// Get a registered service
        /// </summary>
        public static T Get<T>() where T : class
        {
            var type = typeof(T);

            if (services.TryGetValue(type, out var service))
            {
                return service as T;
            }

            Debug.LogError($"Service {type.Name} not found!");
            return null;
        }

        /// <summary>
        /// Try to get a service (returns false if not found)
        /// </summary>
        public static bool TryGet<T>(out T service) where T : class
        {
            var type = typeof(T);

            if (services.TryGetValue(type, out var obj))
            {
                service = obj as T;
                return true;
            }

            service = null;
            return false;
        }

        /// <summary>
        /// Unregister a service
        /// </summary>
        public static void Unregister<T>() where T : class
        {
            var type = typeof(T);
            services.Remove(type);
        }

        /// <summary>
        /// Clear all services
        /// </summary>
        public static void Clear()
        {
            services.Clear();
        }
    }

    // Service Interfaces
    public interface IAudioService
    {
        void PlaySound(string soundName, float volume = 1f);
        void PlayMusic(string musicName, float volume = 1f);
        void StopMusic();
        void SetMasterVolume(float volume);
    }

    public interface ISaveService
    {
        void Save<T>(string key, T data);
        T Load<T>(string key, T defaultValue = default);
        bool HasKey(string key);
        void Delete(string key);
        void DeleteAll();
    }

    public interface IInputService
    {
        UnityEngine.Vector2 GetMovement();
        UnityEngine.Vector2 GetLook();
        bool IsActionPressed(string action);
        bool IsActionDown(string action);
        bool IsActionUp(string action);
    }
}
