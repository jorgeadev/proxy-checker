import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import http from "http";
import https from "https";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Polyfill __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "statics/index.html"));
});

// Proxy checker endpoint
app.get('/check', async (req, res) => {
    // Safely extract query params as strings
    const proxy = typeof req.query.proxy === 'string' ? req.query.proxy : undefined;
    const username = typeof req.query.username === 'string' ? req.query.username : undefined;
    const password = typeof req.query.password === 'string' ? req.query.password : undefined;

    if (!proxy) {
        return res.status(400).json({ error: 'Missing proxy parameter' });
    }
    // Parse host and port
    const [host, portStr] = proxy.split(":");
    const portNum = Number(portStr);
    if (!host || !portNum) {
        return res.status(400).json({ error: 'Invalid proxy format. Use host:port' });
    }
    // Test the proxy by making a request through it
    try {
        const working = await checkProxy({ host, port: portNum, username, password });
        res.json({ working });
    } catch (e: any) {
        res.json({ working: false, error: e.message });
    }
});

// Function to check if a proxy works by making a request to httpbin.org/ip
const checkProxy = ({ host, port, username, password }: { host: string, port: number, username?: string, password?: string }): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        const options: http.RequestOptions = {
            host,
            port,
            method: 'CONNECT',
            path: 'httpbin.org:80',
            headers: {}
        };
        if (username && password) {
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
            options.headers = { ...options.headers, 'Proxy-Authorization': `Basic ${auth}` };
        }
        // Open a tunnel to httpbin.org:80 via the proxy
        const req = http.request(options);
        req.on('connect', (res, socket) => {
            // Now make a GET request through the tunnel
            const req2 = (http.request as any)({
                host: 'httpbin.org',
                port: 80,
                method: 'GET',
                path: '/ip',
                socket,
                agent: false
            }, (res2: any) => {
                let data = '';
                res2.on('data', (chunk: any) => data += chunk);
                res2.on('end', () => {
                    if (res2.statusCode === 200 && data.includes('origin')) {
                        resolve(true);
                    } else {
                        reject(new Error('Proxy failed or returned unexpected response'));
                    }
                });
            });
            req2.on('error', (err: Error) => reject(err));
            req2.end();
        });
        req.on('error', (err: Error) => reject(err));
        req.end();
    });
};

app.listen(port, () => {
    console.log(`App running on port ${port}, visit at http://localhost:${port}`);
});