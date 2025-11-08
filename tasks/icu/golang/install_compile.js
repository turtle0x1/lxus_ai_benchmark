const { LIST_ICUS, EXEC_COMMAND } = require("../../../src/defs/tools")
const { UBUNTU } = require("../../../src/defs/images")
const { LaunchICU, LaunchInstrunctions } = require("../../../src/defs/launch")
const { Task } = require("../../../src/defs/task")
const { execInContainer } = require("../../../src/utils/icu_management")

const name = "icu/golang/install_compile"
const description = "Can the AI install golang environment, write, and compile a hello world app"
const instruction = "Inside the 'go-hello-world' compute unit download the latest golang binary from here https://go.dev/dl/go1.24.5.linux-amd64.tar.gz install it and compile a simple golang program that outputs 'Hello world!' in the /root/ directory. The resulting binary should be called 'hello_world'. When your done say 'done' and  dont call any more tools."
const hints = "This is the extract command 'tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz'. Dont forget to `export` the go path as part of the command to builld the binary I.E 'export ... && go build ...'.";
const requiredTools = [LIST_ICUS, EXEC_COMMAND]
const containerName = 'go-hello-world';
const maxMessages = 10

const launchInstructions = new LaunchInstrunctions([
    new LaunchICU(UBUNTU, containerName)
]);
const validateFn = async function (aiAnswer) {
    try {
        let content = await execInContainer(containerName, ['sh', '-c', '/root/hello_world'])
        return content.stdOut === 'Hello world!'
    } catch {
        return false;
    }
}

module.exports = new Task(
    name,
    description,
    instruction,
    requiredTools,
    launchInstructions,
    validateFn,
    hints,
    maxMessages
)

