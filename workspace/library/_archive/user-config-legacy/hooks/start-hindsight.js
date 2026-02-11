/**
 * SessionStart Hook - Auto-start Hindsight for persistent memory
 * Runs at the beginning of each Claude Code session
 */

const { exec } = require('child_process');
const http = require('http');

// Check if Hindsight is already running
function checkHindsight() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8888/health', { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// Start Hindsight containers
function startHindsight() {
  return new Promise((resolve, reject) => {
    // Start postgres first, then hindsight
    exec('docker start hindsight-postgres && timeout /t 2 >nul && docker start hindsight', 
      { shell: 'cmd.exe', timeout: 30000 },
      (error) => {
        if (error) {
          // Containers might not exist, try full startup
          exec('powershell -ExecutionPolicy Bypass -File "C:\Claude-Code-Creation\scripts\start-hindsight.ps1"',
            { timeout: 60000 },
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
}

// Main hook logic
async function main() {
  const input = JSON.parse(process.argv[2] || '{}');
  
  // Only run on SessionStart
  if (input.hook_event_name !== 'SessionStart') {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  try {
    const running = await checkHindsight();
    
    if (!running) {
      console.error('[Hindsight] Starting persistent memory...');
      await startHindsight();
      
      // Wait for API to be ready
      let ready = false;
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        ready = await checkHindsight();
        if (ready) break;
      }
      
      if (ready) {
        console.error('[Hindsight] Ready for auto-learning');
      } else {
        console.error('[Hindsight] Warning: Could not verify startup');
      }
    }

    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    console.error(`[Hindsight] Error: ${error.message}`);
    console.log(JSON.stringify({ continue: true })); // Don't block Claude
  }
}

main();
