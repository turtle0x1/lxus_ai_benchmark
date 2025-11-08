const http = require('http');
const Buffer = require('buffer').Buffer;
const { getAllTools, callTool } = require("../defs/tools")

const SYSTEM_STRING = "system";
const ASSISTANT_STRING = "assistant";
const USER_STRING = "user";
const TOOL_STRING = "tool";


async function syncHttpAi(messages) {
    try {
        let hostname = process.env.LLAMA_SERVER
        let port = process.env.LLAMA_PORT
        const enableThinking = process.env.ENABLE_THINKING === "true" ? true : false;
        const postData = JSON.stringify({
            "messages": messages,
            "model": process.env.MODEL,
            "temperature": process.env.TEMPERATURE,
            "top_p": process.env.TOP_P,
            "top_k": process.env.TOP_K,
            "max_tokens": process.env.MAX_TOKENS,
            "presence_penalty": process.env.PRESENCE_PENALTY,
            "chat_template_kwargs": { "enable_thinking": enableThinking },
            tools: getAllTools()
        });

        const options = {
            hostname,
            port,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Connection': 'close',
            },
        };
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let chunkBuffer = "";
                res.on('data', (chunk) => {
                    chunkBuffer += chunk.toString();
                });

                res.on('end', () => {
                    try {
                        const responseData = JSON.parse(chunkBuffer);
                        resolve(responseData);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse response: ${parseError.message}`));
                    }
                });
                res.on('error', (err) => reject(err));
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(120000, () => {
                req.abort();
                reject(new Error("Request timed out"));
            });

            req.write(postData);
            req.end();
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function askAI(instruction, history = [], maxChats = 10) {
    const prompt = [
        {
            role: SYSTEM_STRING,
            content: `You are a helpful AI who follows 'user' commands. Output your thoughts in between <think></think> tags and then output any tool commands when you think your done output <final_answer></final_answer> tags and dont make anymore tool calls. 
Be sure to add quiet flags to each command you run or you will run out of context and fail for example on \`apt\` commands use \`-qq\` and on wget use \`--no-verbose\`.  
When using shell features like redirect (>) you must explicitly run a shell (sh -c) and pass the entire command string as one argument. Dont double ecsape new lines.
You have a max of ${maxChats} chat message for this task, dont waste them!`
        },
        ...history
    ];

    if(prompt.length > maxChats){
        console.log(prompt)
        throw new Error(`To many chat messages ${prompt.length}/${maxChats} `)
    }
     
    let response = await syncHttpAi(prompt);
    
    history.push({
        role: USER_STRING,
        content: instruction,
        tools_calls_internal: response.choices[0].message.tool_calls
    })
    
    if (response.choices[0].message.tool_calls.length > 0) {
        let toolResult = []
        for (let xi = 0; xi < response.choices[0].message.tool_calls.length; xi++){
            let tc = response.choices[0].message.tool_calls[xi]
            toolResult.push({
                role: TOOL_STRING,
                content: (await callTool(response.choices[0].message.tool_calls[xi])).content,
                tool_call_id: tc.id
            })
        }
        const newHistory = [...history,
            { role: ASSISTANT_STRING, content: response.choices[0].message.content },
            ...toolResult
        ];
        return askAI(null, newHistory);
    }
    return response.choices[0].message.content;
}

module.exports = {
    askAI,
    SYSTEM_STRING,
    ASSISTANT_STRING,
    USER_STRING,
    TOOL_STRING
}