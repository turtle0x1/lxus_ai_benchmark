const http = require('http');

function lxdRequest({ method, path, body, plainResponse = false }) {
    return new Promise((resolve, reject) => {
        const options = {
            socketPath: process.env.LXUS_SOCKET,
            path,
            method,
            headers: body ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            } : {}
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (plainResponse) {
                        resolve(data)
                    } else {
                        resolve(JSON.parse(data));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function waitForOperation(operationUrl, timeout = 120) {
    const operationId = operationUrl.split('/').pop();
    const waitPath = `/1.0/operations/${operationId}/wait?timeout=${timeout}`;
    const waitRes = await lxdRequest({
        method: 'GET',
        path: waitPath
    });
    if (waitRes.metadata && waitRes.metadata.status === 'Success') {
        return waitRes.metadata;
    } else {
        throw new Error('Operation failed: ' + waitRes.error);
    }
}

async function createContainerAndWait({ name, alias, userData }) {
    let source = {
        type: 'image', 
        protocol: "simplestreams",
    };
    if (alias) {source = {...source, ...alias}};
    console.log(source)
    const config = {};
    if (userData) config['user.user-data'] = userData;

    const postData = JSON.stringify({
        name,
        source,
        config: Object.keys(config).length ? config : undefined
    });

    const createRes = await lxdRequest({
        method: 'POST',
        path: '/1.0/containers',
        body: postData
    });

    if (!createRes.operation) {
        throw new Error('No operation returned on create: ' + JSON.stringify(createRes));
    }

    await waitForOperation(createRes.operation);
    return { status: 'created' };
}

async function setContainerStateAndWait(name, state, isAi = false) {
    console.log(`⚙️ ${isAi ? " AI" : " Human"} setting instance ${name} to state '${state}'`)
    const startRes = await lxdRequest({
        method: 'PUT',
        path: `/1.0/containers/${encodeURIComponent(name)}/state`,
        body: JSON.stringify({ action: state, timeout: 30, force: true })
    });
    if (!startRes.operation) throw new Error('No operation returned on start');
    await waitForOperation(startRes.operation);
    return { status: state };
}

async function getInstanceState(name) {
    const startRes = await lxdRequest({
        method: 'GET',
        path: `/1.0/containers/${encodeURIComponent(name)}/state`
    });
    return startRes
}

async function execInContainer(name, command, isAi = false) {
    console.log(`⚙️ ${isAi ? " AI" : " Human"} on '${name}' executing command '${command.join(" ")}'`)
    let execRes = await lxdRequest({
        method: 'POST',
        path: `/1.0/instances/${encodeURIComponent(name)}/exec`,
        body: JSON.stringify({
            command,
            environment: {
                "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                HOME: '/root',
                TERM: 'xterm',
                USER: 'root',
            },
            'wait-for-websocket': false,
            "record-output": true,
            interactive: false
        })
    });

    if (execRes.error) throw new Error(execRes.error)
    if (!execRes.operation) throw new Error('No operation returned on exec');
    let awaitRes = await waitForOperation(execRes.operation);

    let stdOut = await lxdRequest({ method: "GET", path: awaitRes.metadata.output["1"], plainResponse: true })
    let stdErr = await lxdRequest({ method: "GET", path: awaitRes.metadata.output["2"], plainResponse: true })

    return { stdOut, stdErr };
}

async function deleteContainerAndWait(name) {
    let state = await getInstanceState(name)
    if (state.metadata.status == "Running") {
        await setContainerStateAndWait(name, "stop")
    }
    console.log(`🗑️  destroying '${name}'`)
    const deleteRes = await lxdRequest({
        method: 'DELETE',
        path: `/1.0/containers/${encodeURIComponent(name)}`
    });

    if (!deleteRes.operation) {
        throw new Error('No operation returned on delete: ' + JSON.stringify(deleteRes));
    }

    await waitForOperation(deleteRes.operation);
    return { status: 'deleted' };
}

async function listContainers(isAi = true) {
    console.log(`⚙️ ${isAi ? " AI" : " Human"} listing compute units`)
    const res = await lxdRequest({
        method: 'GET',
        path: '/1.0/containers'
    });

    if (!res.metadata || !Array.isArray(res.metadata)) {
        throw new Error('Unexpected LXD response: ' + JSON.stringify(res));
    }
    return res.metadata.map(url => url.split('/').pop());
}

async function createStartCloudInit({ alias, name, userData }) {
    await createContainerAndWait({ name, alias, userData });
    await setContainerStateAndWait(name, "start");
    await execInContainer(name, ['cloud-init', 'status', '--wait']);
    console.log(`▶️  Instance ${name} ready and cloud-init finished!`);
    return true
}


module.exports = {
    lxdRequest,
    waitForOperation,
    createContainerAndWait,
    setContainerStateAndWait,
    execInContainer,
    deleteContainerAndWait,
    listContainers,
    createStartCloudInit
};
