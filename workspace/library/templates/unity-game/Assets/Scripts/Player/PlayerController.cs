using UnityEngine;
using Game.Core;

namespace Game.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float moveSpeed = 5f;
        [SerializeField] private float sprintMultiplier = 1.5f;
        [SerializeField] private float jumpForce = 5f;
        [SerializeField] private float gravity = -15f;

        [Header("Camera")]
        [SerializeField] private Transform cameraTarget;
        [SerializeField] private float lookSensitivity = 2f;
        [SerializeField] private float minPitch = -80f;
        [SerializeField] private float maxPitch = 80f;

        [Header("Ground Check")]
        [SerializeField] private Transform groundCheck;
        [SerializeField] private float groundCheckRadius = 0.2f;
        [SerializeField] private LayerMask groundLayer;

        private CharacterController controller;
        private Vector3 velocity;
        private float cameraPitch;
        private bool isGrounded;

        public bool IsGrounded => isGrounded;
        public bool IsSprinting { get; private set; }
        public Vector3 Velocity => velocity;

        private void Start()
        {
            controller = GetComponent<CharacterController>();

            // Lock cursor for FPS-style control
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }

        private void Update()
        {
            if (GameManager.Instance.CurrentState != GameState.Playing)
                return;

            CheckGround();
            HandleMovement();
            HandleLook();
            HandleJump();
            ApplyGravity();
        }

        private void CheckGround()
        {
            isGrounded = Physics.CheckSphere(
                groundCheck.position,
                groundCheckRadius,
                groundLayer
            );

            if (isGrounded && velocity.y < 0)
            {
                velocity.y = -2f; // Small downward force to stay grounded
            }
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");

            Vector3 moveDirection = transform.right * horizontal + transform.forward * vertical;
            moveDirection.Normalize();

            IsSprinting = Input.GetKey(KeyCode.LeftShift) && vertical > 0;
            float currentSpeed = IsSprinting ? moveSpeed * sprintMultiplier : moveSpeed;

            controller.Move(moveDirection * currentSpeed * Time.deltaTime);
        }

        private void HandleLook()
        {
            float mouseX = Input.GetAxis("Mouse X") * lookSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * lookSensitivity;

            // Rotate player horizontally
            transform.Rotate(Vector3.up * mouseX);

            // Rotate camera vertically
            cameraPitch -= mouseY;
            cameraPitch = Mathf.Clamp(cameraPitch, minPitch, maxPitch);

            if (cameraTarget != null)
            {
                cameraTarget.localRotation = Quaternion.Euler(cameraPitch, 0f, 0f);
            }
        }

        private void HandleJump()
        {
            if (Input.GetButtonDown("Jump") && isGrounded)
            {
                velocity.y = Mathf.Sqrt(jumpForce * -2f * gravity);
            }
        }

        private void ApplyGravity()
        {
            velocity.y += gravity * Time.deltaTime;
            controller.Move(velocity * Time.deltaTime);
        }

        private void OnDrawGizmosSelected()
        {
            if (groundCheck != null)
            {
                Gizmos.color = isGrounded ? Color.green : Color.red;
                Gizmos.DrawWireSphere(groundCheck.position, groundCheckRadius);
            }
        }
    }
}
