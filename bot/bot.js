const { Client, Intents } = require('discord.js') // loads in discord.js library
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }) // creates client environment
const config = require('./configs.json')
const fs = require('fs');
const brain = require('brain.js');
const { waitForDebugger } = require('inspector');
const network = new brain.recurrent.LSTM({
    activation: 'leaky-relu'
});

var botIntent;
var token = config.token;
const channelID = config.channel;
const prefix = config.prefix;

client.on("ready",()=>{
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')))
    console.log(`logged in as ${client.user.tag}!`)
    client.channels.fetch(channelID).then(channel => {
        channel.send(":smiley_cat: ");
        channel.send("good morning! i am up! feel free to talk to me");
    });
})


client.on("message",msg=>{
    if(msg.content=="!sleep"&&msg.channel.id==="979130836857258007"){
        client.channels.fetch(channelID).then(channel => {
            channel.send(":yawning_face:");
            channel.send("yawnnnnn time for me to sleep");
            setTimeout(function(){
                process.exit();
            },2000)
        });
        return;
    }
    if(msg.content =="") return
    if(!msg.author.bot /*&& msg.channel.id ===channelID*/){
        var words = msg.content;

        var sentence = words.replace(/[^a-zA-Z]+/g,"").toLowerCase();

        msg.channel.send(reply(network.run(sentence)));
    }
    
})

client.login(token)

var hello_reply =["hi","sup","yo","hello","wassup"];
var bye_reply = ["bye","peace","see ya","goodbye"]
var happy_reply =["im glad you feel that way!","i feel that way too!","if you feel that way then i do too!"]
var sad_reply=["im sorry you feel that way","i hope you feel better"]
var opinion_reply=["i hate them","i love them","theyre mid"]
var negative_reply=["thats not a nice thing to say","thats a little mean"]

const reply = (intent) =>{
    if(intent ==="") return ":thinking:";
    
    var retstr = "";
    
    switch(parseInt(intent)){
        case 1:
            retstr = hello_reply[Math.floor(Math.random()*hello_reply.length)];
            break;
            case 2:
                retstr = bye_reply[Math.floor(Math.random()*bye_reply.length)];
            break;
            case 3:
                retstr = happy_reply[Math.floor(Math.random()*happy_reply.length)];
                break;
                case 4:
                    retstr = sad_reply[Math.floor(Math.random()*sad_reply.length)];
                    break;
                    case 5:
                        retstr = opinion_reply[Math.floor(Math.random()*opinion_reply.length)];
                        break;
                        case 6:
                            retstr = greeting();
                            break;
            case 7:
                retstr = negative_reply[Math.floor(Math.random()*negative_reply.length)]
                break;
                            default:
                                retstr =":thinking:";
            break;
        }
        botIntent = network.run(retstr);
        return retstr;
    }

    const greeting =() =>{
        
    var terms = ["how are you?","hows it going?","how are you doing?"]
    var str ="";
    
    if(Math.random() >= 0.8){
        str +="I dont know about ";
        switch(Math.floor(Math.random()*3)){
            case 0:
                str +="everyone else but "
                break;
                case 1:
                    str +="you but ";
                    break;
                    case 2:
                        str +="them but "
                        break;
                        default: break;    
                    }
                }
                
                str +="im ";
                
                if(Math.random() >=.7){
                    var things =["feeling ","doing ","being ","genuinely "]
                    str += things[Math.floor(Math.random()*things.length)]
                }
                
                var feelings =["great. ","playful. ","calm. ","confident. ","peaceful. ","neutral. ","anxious. ","hungry. "];
                
                str += feelings[Math.floor(Math.random()*feelings.length)]
                
                if(Math.random()>=.8){
                    var reasons = ["for some reason ","just because ","because i can "]
                    str+= reasons[Math.floor(Math.random()*reasons.length)]
                    
                    if(Math.random()>=.5){
                        str+="thanks for asking. ";
        } else {
            str+=". ";
        }
    }
    str+= terms[Math.floor(Math.random()*terms.length)]+" ";
    return str;
}