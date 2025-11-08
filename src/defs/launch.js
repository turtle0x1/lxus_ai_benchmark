
const { createContainerAndWait, createStartCloudInit, deleteContainerAndWait } = require("../utils/icu_management")

class LaunchICU {
    constructor(image, name, cloudConfigUserData = '') {
        this.image = image
        this.name = name
        this.cloudConfigUserData = cloudConfigUserData
    }

    async launch(){
        console.debug(`🚀 launching ${this.name} with image ${this.image}`)
        if(this.cloudConfigUserData == null){

            return await createContainerAndWait({name: this.name, alias: this.image})
        }else{
            return await createStartCloudInit({ name: this.name, alias: this.image, userData: this.cloudConfigUserData })
        }
    }

    async destroy(){
        return await deleteContainerAndWait(this.name)
    }
}

class LaunchInstrunctions {
    constructor(intrusctions) {
        this.intrusctions = intrusctions
    }

    async launch(){
        await Promise.all(this.intrusctions.map(instruction => {
            return instruction.launch()
        }))
    }

    async destroy(){
        await Promise.all(this.intrusctions.map(instruction => {
            return instruction.destroy()
        }))
    }
}

module.exports = {
    LaunchICU,
    LaunchInstrunctions
}