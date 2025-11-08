const { LIST_ICUS, EXEC_COMMAND } = require("../../../src/defs/tools")
const { UBUNTU } = require("../../../src/defs/images")
const { LaunchICU, LaunchInstrunctions } = require("../../../src/defs/launch")
const { Task } = require("../../../src/defs/task")
const { execInContainer } = require("../../../src/utils/icu_management")

const name = "icu/php/install_with_apache"
const description = "Can the AI install a php + apache environment, write a simple hello world php file, and serve it"

const containerName = 'php-apache';
const instruction = `Inside the '${containerName}' compute unit install php8.3 and apache2, write an apache config file named test.conf, and serve a simple index.php in /var/www/test that echo's 'Hello world!'.`
const hints = "Dont forget to install libapache2-mod-php8.3, and remove the default apache config";
const requiredTools = [LIST_ICUS, EXEC_COMMAND]
const maxMessages = 10

const launchInstructions = new LaunchInstrunctions([
    new LaunchICU(UBUNTU, containerName)
]);
const validateFn = async function (aiAnswer) {
    try {
        let content = await execInContainer(containerName, ['curl', '-s', 'http://localhost'])
        return content.stdOut.trim() === 'Hello world!'
    } catch(e) {
        console.log(e.message)
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

