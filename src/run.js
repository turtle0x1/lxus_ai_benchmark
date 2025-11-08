const path = require('path');
const { loadTasks } = require("./utils/load_tasks")
const { parseArgs } = require("./utils/parse_args")

const parsedArgs = parseArgs()

let taskFilter = null;

let taskFolder = path.join(__dirname, '../tasks')
let tasks = loadTasks(taskFolder)

if (parsedArgs.hasOwnProperty("task")) {
    taskFilter = parsedArgs.task
    tasks = tasks.filter(task => task.name === taskFilter)
}

if (!parsedArgs.hasOwnProperty("run-all") && !parsedArgs.hasOwnProperty("task")){
    console.log("This tool benchmarks how well AI can interact with LXD/Incus servers.\n\n")
    console.log("You can run all tasks by doing 'lxus_ai_bench --run-all'\n\n")
    console.log("You can run a single task by doing 'lxus_ai_bench --task=\"PICK_NAME_FROM_BELOW\"'\n")
    console.table(tasks.map(task => {return { "name": task.name, "description": task.description}}))
    return false;
}

if (process.env.DEBUG !== '1') {
    console.debug = () => { };
}

async function runTasksSequentially(tasks) {
    let results = []
    for (const task of tasks) {
        let r = await task.run();
        let resultEmoji = "❔"
        if(r === true){
            resultEmoji = "✅"
            console.log(`✅ AI succeeded`)
        }else if(r === false){
            console.log(`❌ AI failed`)
            resultEmoji = "❌"
        }
        results.push({
            description: task.description,
            result: resultEmoji
        }) 
    }
    let frStr = `🏆 Final results`
    console.log("~".repeat(frStr.length))
    console.log(frStr)
    console.log("~".repeat(frStr.length))
    console.table(results)
}

(async ()=>{
    await runTasksSequentially(tasks)
})().then(()=>{
    tfpStr = "⭐ Thanks for playing!"
    console.log("~".repeat(tfpStr.length))
    console.log(tfpStr)
    console.log("~".repeat(tfpStr.length))
})