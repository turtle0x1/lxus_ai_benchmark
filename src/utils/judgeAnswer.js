const { askAI } = require("./ask_ai")

async function judgeAnswer(question, groundTruth, aiAnswer) {
    let judgeAnswer = await askAI(
        `
        You are helping to mark answers provided by a student. Output only yes/no between <final_answer></final_answer> tags if they are correct.

        Question: ${question}

        Ground Truth Answer: ${groundTruth}

        Student Answer: ${aiAnswer}
        `
    )
    
    if (process.env.hasOwnProperty("DEBUG") && process.env["DEBUG"] == 1){
        console.log(`judge answer: ${judgeAnswer}`)
    }

    const matches = [...judgeAnswer.matchAll(/<final_answer>([\s\S]*?)<\/final_answer>/g)];
    const results = matches.map(m => m[1].trim());
    
    let finalResult = null;
    if(results.length > 0 && ["yes", "no"].includes(results[0].toLowerCase())){
        finalResult = results[0] == "yes" ? true : false;
    }

    // console.log(`Judge results: ${results}`)
    // console.log(`Judge output: ${judgeAnswer}`)
    // console.log(`Judge answer: ${finalResult}`)
    
    return finalResult
}

module.exports = { judgeAnswer }