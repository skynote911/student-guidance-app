
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const lookup = promisify(dns.lookup);

// Hostname from the error log
const hostname = 'ac-ci94jvs-shard-00-00.1fe7uah.mongodb.net';

async function checkDNS() {
    console.log(`Checking DNS for: ${hostname}`);
    try {
        const addresses = await resolve4(hostname);
        console.log('✅ DNS Resolved (resolve4):', addresses);
    } catch (err) {
        console.error('❌ DNS Resolution Failed (resolve4):', err.code);
    }

    try {
        const result = await lookup(hostname);
        console.log('✅ DNS Lookup (lookup):', result);
    } catch (err) {
        console.error('❌ DNS Lookup Failed (lookup):', err.code);
    }
}

checkDNS();
