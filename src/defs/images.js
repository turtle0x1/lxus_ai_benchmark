const UBUNTU = {
    alias: process.env.UBUNTU_ALIAS,
    server: process.env.UBUNTU_IMAGE_SERVER,
}

const ALPINE = {
    alias: process.env.ALPINE_ALIAS,
    server: process.env.ALPINE_IMAGE_SERVER,
}

module.exports = {
    UBUNTU,
    ALPINE
}
