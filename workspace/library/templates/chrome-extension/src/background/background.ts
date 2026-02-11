import { Message, MessageResponse } from '../lib/messaging'

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason)

  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.local.set({
      settings: {
        enabled: true,
        theme: 'system',
        notifications: true,
      },
      clickCount: 0,
    })
  }
})

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse: (response: MessageResponse) => void) => {
    console.log('Background received message:', message, 'from:', sender)

    switch (message.type) {
      case 'INCREMENT':
        console.log('Count incremented to:', message.payload)
        sendResponse({ success: true, data: message.payload })
        break

      case 'GET_TAB_INFO':
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          sendResponse({ success: true, data: tabs[0] })
        })
        return true // Keep channel open for async response

      case 'INJECT_SCRIPT':
        if (sender.tab?.id) {
          chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            func: () => {
              console.log('Script injected!')
            },
          })
          sendResponse({ success: true })
        } else {
          sendResponse({ success: false, error: 'No tab ID' })
        }
        break

      default:
        sendResponse({ success: false, error: 'Unknown message type' })
    }

    return false
  }
)

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url)
  }
})

// Context menu (right-click menu)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extensionAction',
    title: 'Extension Action',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extensionAction' && info.selectionText) {
    console.log('Selected text:', info.selectionText)

    // Send selected text to content script
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SELECTION',
        payload: info.selectionText,
      })
    }
  }
})

export {}
