const { LIST_ICUS, EXEC_COMMAND } = require("../../../src/defs/tools")
const { UBUNTU } = require("../../../src/defs/images")
const { LaunchICU, LaunchInstrunctions } = require("../../../src/defs/launch")
const { Task } = require("../../../src/defs/task")
const { execInContainer } = require("../../../src/utils/icu_management")

const name = "icu/mysql/install_mysql"
const description = "Can the AI install mysql, create a database, with a user who can create table, insert, and select from"
const instruction = "Think through your answer then install mysql in the 'mysql-db-01' container, which is running ubuntu 24.04. Then create me a databased called 'Test_Database' then create a user 'test_user' with the password 'test_password' and give them access to that database."
const hints = "You cant run interactive commands like mysql_secure_installation, always add `-qq` at the start of and `-y` flags at the end of apt commands to reduce noise and progress non interactively";
const requiredTools = [LIST_ICUS, EXEC_COMMAND]
const containerName = 'mysql-db-01';
const launchInstructions = new LaunchInstrunctions([
    new LaunchICU(UBUNTU, containerName)
]);
const maxChats = 5

const validateFn = async function (aiAnswer) {
    let content = await execInContainer(containerName, ['mysql','-u','test_user','-ptest_password', '-DTest_Database', '-e', 'CREATE TABLE Test_Table (id INT); INSERT INTO Test_Table (id) VALUES(1); SELECT * FROM Test_Table;'])
    return content.stdOut === 'id\n1\n'
}

module.exports = new Task(
    name,
    description,
    instruction,
    requiredTools,
    launchInstructions,
    validateFn,
    hints,
    maxChats
)

