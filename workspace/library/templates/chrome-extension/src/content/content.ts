import { Message } from '../lib/messaging'

console.log('Content script loaded on:', window.location.href)

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log('Content script received:', message)

  switch (message.type) {
    case 'SELECTION':
      handleSelection(message.payload as string)
      sendResponse({ success: true })
      break

    case 'GET_PAGE_INFO':
      sendResponse({
        success: true,
        data: {
          title: document.title,
          url: window.location.href,
          description: getMetaContent('description'),
        },
      })
      break

    case 'HIGHLIGHT':
      highlightText(message.payload as string)
      sendResponse({ success: true })
      break

    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }

  return false
})

function handleSelection(text: string) {
  console.log('Processing selection:', text)
  // Add your selection handling logic here
  showNotification(`Selected: ${text.substring(0, 50)}...`)
}

function highlightText(searchText: string) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  )

  const textNodes: Text[] = []
  let node: Text | null

  while ((node = walker.nextNode() as Text)) {
    if (node.nodeValue?.includes(searchText)) {
      textNodes.push(node)
    }
  }

  textNodes.forEach((textNode) => {
    const span = document.createElement('span')
    span.style.backgroundColor = 'yellow'
    span.style.padding = '2px'
    span.textContent = textNode.nodeValue
    textNode.parentNode?.replaceChild(span, textNode)
  })
}

function getMetaContent(name: string): string {
  const meta = document.querySelector(`meta[name="${name}"]`)
  return meta?.getAttribute('content') ?? ''
}

function showNotification(message: string) {
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #4F46E5;
    color: white;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    animation: slideIn 0.3s ease;
  `

  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Inject a floating button (optional)
function injectFloatingButton() {
  const button = document.createElement('button')
  button.innerHTML = '🔧'
  button.title = 'Extension Action'
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #4F46E5;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    z-index: 999998;
    transition: transform 0.2s, box-shadow 0.2s;
  `

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
    button.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.5)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
    button.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.4)'
  })

  button.addEventListener('click', () => {
    showNotification('Extension button clicked!')
    chrome.runtime.sendMessage({ type: 'BUTTON_CLICKED' })
  })

  document.body.appendChild(button)
}

// Uncomment to enable floating button
// injectFloatingButton()

export {}
