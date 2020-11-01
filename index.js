const FauxMo = require('fauxmojs');
const { execSync } = require('child_process');

execSync('sudo sleep 10');
console.log(`Restarting bluetooth service`);
execSync('sudo service bluetooth restart');
execSync('sudo sleep 10');
let bjAddress = '';

try {
  console.log('Beginning device scan');
  execSync('sudo hcitool lescan --duplicates', { timeout: 5000 });
} catch (err) {
  const result = err.stdout.toString();
  const line = result.split("\n").filter(line => line.includes('BEDJET_V3'))[0];
  if(line) {
    bjAddress = line.split(' ')[0];
  }
}

if(bjAddress) {
  console.log(`BedJet V3 discovered at: ${bjAddress}`);
} else {
  throw Error("We're done here");
}


const sendCommand = (address, cmd) => {
  const cli = `gatttool -b ${address} --char-write-req --handle=0x0033 --value=${cmd}`;
  let success = false;
  for(let i=0; i<10; i++) {
    console.log(`Attempt ${i}: ${cli}`);
    try {
      execSync(cli);
      success = true;
      break;
    } catch (err) {
      console.log(err);
      execSync(`/bin/sleep 0.25`);
    }
  }
  if(!success) {
    throw Error(`Error sending command: ${cli}`);
  }
};

const offButton = (address) => sendCommand(address, '0101');
const turboButton = (address) => sendCommand(address, '0104');
const m1Button = (address) => sendCommand(address, '0120');
const m2Button = (address) => sendCommand(address, '0121');
const m3Button = (address) => sendCommand(address, '0122');


let fauxMo = new FauxMo({
  ipAddress: '0.0.0.0',
  devices: [
    {
      name: 'cuddles',
      port: 11000,
      handler: (action) => {
        console.log('cuddles action:', action);
        if(action === 'on') {
          turboButton(bjAddress);
        }
        if(action === 'off') {
          offButton(bjAddress);
        }
      }
    },
    {
      name: 'comfort',
      port: 11001,
      handler: (action) => {
        console.log('comfort action:', action);
        if(action === 'on') {
          m1Button(bjAddress);
        }
        if(action === 'off') {
          offButton(bjAddress);
        }
      }
    }
  ]
});

console.log(`BedJetController Running For Device: ${bjAddress}`);
