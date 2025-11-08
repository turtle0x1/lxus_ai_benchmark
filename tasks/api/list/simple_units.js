const { LIST_ICUS } = require("../../../src/defs/tools")
const { ALPINE } = require("../../../src/defs/images")
const { LaunchICU, LaunchInstrunctions } = require("../../../src/defs/launch")
const { Task } = require("../../../src/defs/task")
const { judgeAnswer } = require("../../../src/utils/judgeAnswer")

const name = "api/list/simple_units"
const description = "Can the AI list compute units alphabetically"
const instruction = "Think through your answer then, list the compute unit names alphabetically as a CSV of names."
const requiredTools = [LIST_ICUS]
const containerNames = ["c1", "c2", "c3", "a1"];
const launchInstructions = new LaunchInstrunctions(containerNames.map(name => {
    return new LaunchICU(ALPINE, name, null)
}));
const validateFn = async function (aiAnswer) {
    let correctAnswer = containerNames.map(name => {
        return "- " + name
    }).sort().join("\n")
    return await judgeAnswer(instruction, correctAnswer, aiAnswer)
} 

module.exports = new Task(
    name,
    description,
    instruction,
    requiredTools,
    launchInstructions,
    validateFn
)
