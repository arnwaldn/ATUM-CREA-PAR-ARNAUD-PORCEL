# Plan: Verify Google Account Access via AI Browser

## Context
The user logged into their Google account via Halo's built-in browser and wants to verify that the AI can access it. The AI Browser toggle is enabled (Globe button active).

## Issue
The `mcp__ai-browser__*` tools are not appearing in the current session's available tool set, even though the toggle is reportedly enabled. This is likely because:
1. The session was created before the toggle was activated
2. A session rebuild is needed (toggling mid-conversation requires session rebuild)

## Steps
1. Exit plan mode
2. Ask the user to send a new message (or toggle AI Browser off then on) to trigger a session rebuild
3. Once `mcp__ai-browser__` tools are available, use:
   - `mcp__ai-browser__browser_navigate` to go to https://myaccount.google.com
   - `mcp__ai-browser__browser_snapshot` to read the page and check login status
4. Report findings to user

## Alternative
If the tools still don't appear, the user may need to start a new conversation with AI Browser enabled from the start.
