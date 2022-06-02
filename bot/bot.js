const { Client, Intents } = require('discord.js') // loads in discord.js library
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }) // creates client environment
const config = require('./configs.json')
var conversationData = require('../training/conversation-data.json')
const fs = require('fs');
const brain = require('brain.js');
const { waitForDebugger } = require('inspector');
const { Message } = require('discord.js');
const network = new brain.recurrent.LSTM({
    activation: 'leaky-relu'
});

var botIntent;
var isTraining = false;
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

function botTrain(feedback){
    client.channels.fetch(channelID).then(channel => {
        switch(feedback){
            case 0:
                channel.send("Exiting training mode")
                isTraining = false;
                return;
            case 1:
                channel.send("Hello! can you help me learn greetings? enter your message!" )
                break;
            case 2:
                channel.send("Hello! can you help me learn farewells? enter your message!")
                break;
            case 3:
                channel.send("Hello! can you help me learn happy messages? enter your message!")
                break;
            case 4:
                channel.send("Hello! can you help me learn sad messages? enter your message!")
                break;
            case 5:
                channel.send("Hello! can you help me learn opinion messages? enter your message!")
                break;
            case 6:
                channel.send("Hello! can you help me learn how you would ask me for how im feeling? enter your message!")
                break;
            case 7:
                channel.send("Hello! can you help me learn some mean messages? enter your message!")
                break;
            default:
                channel.send("invalid response")
                isTraining = false;
                return;
        }
        while(isTraining){
            var ans = msg.channel.awaitMessages(filter,{maxMatches:1,time:10000,errors: ['time','maxMatches']})
            var trainingData = ",\r\t{ \"input\":\""+ans+"\", \"output\":"+feedback+" }";
            msg.channel.send(ans+" has been added to the training data! enter another message to continue or enter 0 to end")
            if(msg.channel.awaitMessages(filter,{maxMatches:1,time:10000,errors: ['time','maxMatches']})=="0"){
                botTrain(0);
            }
        }
    });
}

client.on("message",msg=>{
    if(msg.content=="!sleep"&&msg.channel.id===configs.channelID){
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
    if(msg.content ==="!train"){
        msg.channel.send("Training mode activated!\n1 for greetings\n2 for farewells\n3 for happy messages\n4 for sad messages\n5 for opinions\n6 for questions that ask me how im feeling\n7 for mean messages\n0 to cancel")
        isTraining =true;
        const filter = m =>m.author.id === msg.author.id
        /*fs.readFile("../training/conversation-data.json", function (err, data) {
            if (err) throw err;
            conversationData = data.toString().split("\n");
            conversationData.splice(-1, 1);
            fs.writeFile("../training/conversation-data.json", conversationData.join("\n"), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });*/
        var trainingInput = parseInt(msg.channel.awaitMessages(filter,{maxMatches:1,time:10000,errors: ['time','maxMatches']}))
        botTrain(trainingInput);
        /*try{
            fs.appendFile("../training/conversation-data.json","\r]",(err,result)=>{
                if(err) console.log("Error: "+err)
            })
        }catch(err){
            console.log(err)
        }*/
    }
    if(!msg.author.bot && msg.channel.id ===channelID&& isTraining !=true){
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