const http = require('http');

const PORT = 8080;
const CACHE_KEY_PREFIX = 'cacheway';
const CACHE_TTL = 10000; // 10 seconds

const cache = new Map();

const cacheHandler = (key, value) => {

    const objKey = CACHE_KEY_PREFIX + key;

    const isCached = cache.has(objKey);

    const isExpired = isCached && Date.now() > cache.get(objKey).exp;

    if (!cache.has(objKey) || isExpired) {

        const data = {
            exp: Date.now() + CACHE_TTL,
            data: value
        };

        cache.set(objKey, data);

        return data;

    }

    return cache.get(objKey);
    
};

const proxyHandler = async (req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (cache.has(CACHE_KEY_PREFIX + pathname) && cache.get(CACHE_KEY_PREFIX + pathname).exp > Date.now()) {
        const pData = cache.get(CACHE_KEY_PREFIX + pathname).data;
        
        const headers = pData.headers;
        headers['X-Cache'] = 'HIT';

        res.writeHead(pData.statusCode, headers);

        pData.pipe(res);
        return;
    }

    const options = {
        protocol: url.protocol,
        host: 'localhost',
        hostname: 'localhost',
        port: '3000',
        path: pathname,
        method: req.method,
        headers: req.headers,
    };

    const proxyRequest = http.request(options, (proxyResponse) => {

        const headers = proxyResponse.headers;
        
        if (req.method === 'GET') {
            const cacheResponse = cacheHandler(pathname, proxyResponse);
        
            headers['X-Cache'] = 'MISS';
        }

        res.writeHead(proxyResponse.statusCode, headers);
        
        // Pipe the response: target server back to the client
        proxyResponse.pipe(res);
    });

    // Pipe the incoming request: client data to the target server
    req.pipe(proxyRequest);

    // Handle errors
    proxyRequest.on('error', (err) => {
        res.statusCode = 500;
        res.end('Internal Server Error');
    });
    
};

const proxy = http.createServer(proxyHandler);

proxy.listen(PORT);

// use http-proxy for forwarding request and intercept response.
// use redis to cache data.