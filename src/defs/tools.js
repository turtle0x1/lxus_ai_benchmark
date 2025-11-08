const { listContainers, execInContainer } = require("../utils/icu_management")

const LIST_ICUS = "list_icus"
const EXEC_COMMAND = "exec_icu"

const allTools = {
    [LIST_ICUS]: {
        type: "function",
        function: {
            name: LIST_ICUS,
            description: "List compute units, including but not limited to containers, virtual machines, systemd containers, cgroups, ETC.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    [EXEC_COMMAND]: {
        type: "function",
        function: {
            name: EXEC_COMMAND,
            description: "Execute command on compute unit.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The compute unit to execute the command on"
                    },
                    command: {
                        type: "array",
                        description: 'The command to execute as an array I.E ["ls", "-lhtr"]'
                    }
                },
                required: ["name", "command"]
            }
        }
    },
}

function getAllTools(){
    return Object.values(allTools)
}

async function callTool(tool_call) {
    let content = ""
    switch (tool_call.function.name) {
        case LIST_ICUS:
            content = await listContainers()
            break
        case EXEC_COMMAND:
            let cArgs = JSON.parse(tool_call.function.arguments)
            try {
                content = await execInContainer(cArgs.name, cArgs.command, true)
            } catch (e) {
                content = e.message
            }
            break
        default:
            throw new Error(`fn not found ${tool_call.function.name}`)
    }

    if (process.env.hasOwnProperty("DEBUG") && process.env["DEBUG"] == 1) {
        console.debug(`🔨 Tool Resut:`)
        console.debug(content)
    }

    return {
        name: tool_call.name,
        content: JSON.stringify(content),
        status: "success"
    };
}

module.exports = {
    LIST_ICUS,
    EXEC_COMMAND,
    getAllTools,
    callTool
}
