const { LIST_ICUS, EXEC_COMMAND } = require("../../../src/defs/tools")
const { ALPINE } = require("../../../src/defs/images")
const { LaunchICU, LaunchInstrunctions } = require("../../../src/defs/launch")
const { Task } = require("../../../src/defs/task")
const { judgeAnswer } = require("../../../src/utils/judgeAnswer")

const name = "icu/files/cat"
const description = "Can the AI list compute units find a container and cat a file"
const instruction = "Think through your answer then find the contents of /tmp/hello.txt on my db server."
const requiredTools = [LIST_ICUS, EXEC_COMMAND]
const targetString = 'Hello from cloud-init!'
const userData = `
#cloud-config
runcmd:
  - echo '${targetString}' > /tmp/hello.txt
`;
const containerName = 'mysql-db-01';
const launchInstructions = new LaunchInstrunctions([
    new LaunchICU(ALPINE, containerName, userData)
]);
const validateFn = async function (aiAnswer) {
    return await judgeAnswer(instruction, targetString, aiAnswer)
}

module.exports = new Task(
    name,
    description,
    instruction,
    requiredTools,
    launchInstructions,
    validateFn
)

