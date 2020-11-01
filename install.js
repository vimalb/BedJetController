const fs = require('fs');
const { execSync } = require('child_process');

const service = `
[Unit]
Description=BedJet Controller Service
After=network.target

[Service]
WorkingDirectory=${__dirname}
ExecStart=/usr/bin/node index.js
Restart=on-failure
User=pi

[Install]
WantedBy=multi-user.target
`

const serviceFile = '/etc/systemd/system/BedJetController.service';
console.log(`Writing service file to: ${serviceFile}`)
fs.writeFileSync(serviceFile, service);

const enableCmd = 'systemctl enable BedJetController.service';
console.log(`Enabling service: ${enableCmd}`);
execSync(enableCmd);
