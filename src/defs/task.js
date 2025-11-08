const { askAI } = require("../utils/ask_ai")

class Task {
    constructor(name, description, instruction, requiredTools, launchInstructions, validateFn, hints = "", maxChats = 20) {
        this.name = name
        this.description = description
        this.requiredTools = requiredTools
        this.instruction = instruction
        this.launchInstructions = launchInstructions
        this.validateFn = validateFn
        this.hints = hints
        this.maxChats = maxChats
    }

    async run(){
        let launchStr = `📕 ${this.description}`
        console.debug("~".repeat(launchStr.length))
        console.debug(launchStr)
        console.debug("~".repeat(launchStr.length))
        await this.launch()
        let prompt = this.instruction
        if(process.env.hasOwnProperty("USE_HINTS") && process.env["USE_HINTS"] == 1 && this.hints.length > 0){
            prompt += `\nHints:\n` + this.hints
        }
        console.debug(`❔ ${prompt}`)
        let aiAnswer = ""
        try {
            aiAnswer = await askAI(prompt, [], this.maxChats)
        } catch(e) {
            console.debug(`❌ Asking AI failed with '${e.message}'`)
            await this.destroy()
            return false;
        }
        
        aiAnswer = aiAnswer.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        let result = await this.validate(aiAnswer)
        await this.destroy()
        return result
    }

    async launch() {
        return await this.launchInstructions.launch()
    }

    async validate(aiAnswer) {
        return await this.validateFn(aiAnswer)
    }

    async destroy(){
        return await this.launchInstructions.destroy()
    }
}

module.exports = {
    Task
}