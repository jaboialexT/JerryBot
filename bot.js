const { Client, Intents } = require('discord.js') // loads in discord.js library
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }) // creates client environment
const config = require('./configs.json')

const brain = require('brain.js')

client.on("ready",()=>{
    console.log(`logged in as ${client.user.tag}!`)
})

client.on("message",msg=>{
    if(msg.author.bot) return
    msg.reply("hello")
})

client.login(config.token)