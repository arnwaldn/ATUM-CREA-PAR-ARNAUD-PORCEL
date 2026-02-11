/**
 * Type-safe Chrome Messaging API wrapper
 */

export type MessageType =
  | 'INCREMENT'
  | 'GET_TAB_INFO'
  | 'INJECT_SCRIPT'
  | 'SELECTION'
  | 'GET_PAGE_INFO'
  | 'HIGHLIGHT'
  | 'BUTTON_CLICKED'

export interface Message {
  type: MessageType
  payload?: unknown
}

export interface MessageResponse {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Send a message to the background script
 */
export function sendMessage(message: Message): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(response)
      }
    })
  })
}

/**
 * Send a message to a specific tab's content script
 */
export function sendToTab(tabId: number, message: Message): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(response)
      }
    })
  })
}

/**
 * Send a message to the active tab's content script
 */
export async function sendToActiveTab(message: Message): Promise<MessageResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id) {
    throw new Error('No active tab found')
  }

  return sendToTab(tab.id, message)
}

/**
 * Broadcast a message to all tabs
 */
export async function broadcastToAllTabs(message: Message): Promise<void> {
  const tabs = await chrome.tabs.query({})

  const promises = tabs
    .filter((tab) => tab.id !== undefined)
    .map((tab) =>
      sendToTab(tab.id!, message).catch((err) => {
        console.warn(`Failed to send to tab ${tab.id}:`, err)
      })
    )

  await Promise.all(promises)
}

/**
 * Create a message handler with type checking
 */
export function createMessageHandler(
  handlers: Partial<Record<MessageType, (payload: unknown) => Promise<MessageResponse> | MessageResponse>>
) {
  return (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: MessageResponse) => void) => {
    const handler = handlers[message.type]

    if (!handler) {
      sendResponse({ success: false, error: `Unknown message type: ${message.type}` })
      return false
    }

    const result = handler(message.payload)

    if (result instanceof Promise) {
      result
        .then(sendResponse)
        .catch((error) => sendResponse({ success: false, error: error.message }))
      return true // Keep channel open for async response
    }

    sendResponse(result)
    return false
  }
}
