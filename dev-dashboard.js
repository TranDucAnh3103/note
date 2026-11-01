const http = require('http');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8080;

let logs = {
  backend: [],
  frontend: []
};

let processes = {
  backend: null,
  frontend: null
};

const MAX_LOG_LINES = 500;

let logBuffers = {
  backend: '',
  frontend: ''
};

function addLog(source, data) {
  // Convert to string and strip all ANSI escape codes
  let cleanData = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  // Remove carriage returns
  cleanData = cleanData.replace(/\r/g, '');
  
  logBuffers[source] += cleanData;
  
  let lines = logBuffers[source].split('\n');
  // Keep the last incomplete line in the buffer
  logBuffers[source] = lines.pop();
  
  lines = lines.filter(line => line.trim() !== '');
  
  lines.forEach(line => {
    logs[source].push(line);
    if (logs[source].length > MAX_LOG_LINES) {
      logs[source].shift();
    }
    broadcast({ type: 'log', source, line });
  });
}

let clients = [];

function broadcast(data) {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

function startProcess(type) {
  if (processes[type]) return; // Already running

  const folder = type === 'backend' ? 'server' : 'client';
  
  processes[type] = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, folder),
    shell: true
  });

  addLog(type, `[SYSTEM] Started ${type} process...`);
  broadcast({ type: 'status', source: type, status: 'running' });

  processes[type].stdout.on('data', (data) => addLog(type, data));
  processes[type].stderr.on('data', (data) => addLog(type, `[ERROR] ${data}`));
  
  processes[type].on('close', (code) => {
    if (logBuffers[type]) {
      addLog(type, '\n'); // flush
    }
    addLog(type, `[SYSTEM] Process exited with code ${code}\n`);
    processes[type] = null;
    broadcast({ type: 'status', source: type, status: 'stopped' });
  });
}

function stopProcess(type) {
  if (!processes[type]) return;

  addLog(type, `[SYSTEM] Stopping ${type} process...`);
  if (/^win/.test(process.platform)) {
    exec(`taskkill /pid ${processes[type].pid} /T /F`, () => {
      processes[type] = null;
      broadcast({ type: 'status', source: type, status: 'stopped' });
    });
  } else {
    processes[type].kill();
    processes[type] = null;
    broadcast({ type: 'status', source: type, status: 'stopped' });
  }
}

// Initial start
startProcess('backend');
startProcess('frontend');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'dev-dashboard.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading dashboard html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/api/dashboard/initial') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      logs,
      status: {
        backend: processes.backend ? 'running' : 'stopped',
        frontend: processes.frontend ? 'running' : 'stopped'
      }
    }));
  } else if (req.url === '/api/dashboard/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(': connected\n\n');
    const client = { id: Date.now(), res };
    clients.push(client);
    req.on('close', () => { clients = clients.filter(c => c.id !== client.id); });
  } else if (req.url.startsWith('/api/dashboard/process/') && req.method === 'POST') {
    const type = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (data.action === 'start') startProcess(type);
      else if (data.action === 'stop') stopProcess(type);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  } else if (req.url === '/api/dashboard/shutdown' && req.method === 'POST') {
    res.writeHead(200); res.end();
    cleanup();
    setTimeout(() => process.exit(0), 1000);
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Hidden Dashboard running at http://localhost:${PORT}`);
});

let isShuttingDown = false;
function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  if (processes.backend) stopProcess('backend');
  if (processes.frontend) stopProcess('frontend');
}

process.on('SIGINT', () => {
  cleanup();
  setTimeout(() => process.exit(0), 1000);
});
process.on('exit', cleanup);
