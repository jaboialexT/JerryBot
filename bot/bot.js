const { Client, Intents } = require('discord.js') // loads in discord.js library
const Discord = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }) // creates client environment
const config = require('./configs.json')
const save = require('./saveData.json')
const fs = require('fs');
const brain = require('brain.js');
const { DiscordAPIError } = require('discord.js');
const { execPath } = require('process')
const network = new brain.recurrent.LSTM({
    activation: 'leaky-relu'
});

client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`)
    client.commands.set(command.name,command)
}


const status = {
    "health":save.health,
    "hunger":save.hunger,
    "happiness":save.happiness,
    "timeAlive":save.timeAlive, 
    "timeLastFed":save.timeLastFed,
    "timeLastPlayed":save.timeLastPlayed,
    "personLastFed":save.personLastFed,
    "personLastPlayed":save.personLastPlayed,
    "generation":save.generation
}

var token = config.token;
const channelID = config.channel;
const prefix = config.prefix;

function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function saveStatusData()
{
    try{
        fs.writeFile('saveData.json',"{\n\"health\":"+status.health
        +",\n\"hunger\":"+status.hunger
        +",\n\"happiness\":"+status.happiness
        +",\n\"timeAlive\":"+status.timeAlive
        +",\n\"timeLastFed\":"+status.timeLastFed
        +",\n\"timeLastPlayed\":"+status.timeLastPlayed
        +",\n\"personLastFed\":\""+status.personLastFed
        +"\",\n\"personLastPlayed\":\""+status.personLastPlayed
        +"\",\n\"generation\":"+status.generation+"\n}"
        ,(err,result)=>{
            if(err) console.log("Error: "+err);
        });
    }catch(err){
        console.log(err)
    }
}
function start(){
    var nextDate = new Date(); // date that counts every hour
    //send dead jerry to graveyard 
    if(status.generation>1){
        try{
            fs.appendFile("graveyard.json","Jerry "+romanize(status.generation)+" lived for "+status.timeAlive+" hours\n",(err,result)=>{
                if(err) console.log("Error: "+err)
            })
        }catch(err){
            console.log(err)
        }
        status.hunger = 10;
        status.happiness =10;
        status.timeAlive = 0;
        status.timeLastFed = 0;
        status.timeLastPlayed =0;
        status.personLastFed = null;
        status.personLastPlayed = null;
        saveStatusData();
    }
    //create new jerry
    
    if (nextDate.getMinutes() === 0) {
        callEveryHour()
    } else {
        nextDate.setHours(nextDate.getHours() + 1);
        nextDate.setMinutes(0);
        nextDate.setSeconds(0);

        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
}
function callEveryHour(){
    setInterval(update(),1000*60*60);
}
function update() {
    status.timeAlive++;
    status.timeLastFed++;
    status.timeLastPlayed++;
    if(status.hunger==10 && status.happiness ==10 && status.health!=10) status.health++;
    status.hunger--;
    status.happiness--;
    if(!status.hunger>5) status.happiness--;
    if(status.hunger<=0){
        status.hunger = 0;
        status.health--;
    }   
    if(status.health==0) {
        status.generation++;
        start();
    }
    saveStatusData();
}
client.on("ready",()=>{
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')))
    console.log(`logged in as ${client.user.tag}!`)
    client.channels.fetch(channelID).then(channel => {
        //channel.send(":smiley_cat:\ngood morning! i am up! feel free to talk to me");
    });
})

client.on("message",msg=>{
    if(msg.content=="!sleep"&&msg.channel.id==="979130836857258007"){
        client.channels.fetch(channelID).then(channel => {
            channel.send(":yawning_face:\nyawnnnnn time for me to sleep");
            saveStatusData();
            setTimeout(function(){
                process.exit();
            },2000)
        });
        return;
    }
    if(msg.content =="") return
    if(msg.author.bot) return
    if(!msg.author.bot && msg.channel.id ===channelID && !msg.content.startsWith(prefix)){
        var words = msg.content;
        var sentence = words.replace(/[^a-zA-Z]+/g,"").toLowerCase();
        //msg.channel.send(reply(network.run(sentence)));
    }
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(command =='status'){
        client.commands.get('status').execute(msg,args,status.health,status.hunger,status.happiness,status.timeLastFed,status.timeLastPlayed,status.personLastFed,status.personLastPlayed,status.timeAlive,status.generation)
    }
    if(command == 'play'){
        status.personLastPlayed = msg.author.id
        status.timeLastPlayed = 0;
        status.happiness = 10;
        client.commands.get('status').execute(msg,args,status.health,status.hunger,status.happiness,status.timeLastFed,status.timeLastPlayed,status.personLastFed,status.personLastPlayed,status.timeAlive,status.generation)
        saveStatusData();
    }
    if(command =='feed'){
        status.personLastFed = msg.author.id;
        status.timeLastFed =0;
        if(status.hunger<10){
            status.hunger = 10
        }
        else{
            status.health --;
            status.happiness--;
            msg.channel.send("Jerry ate too much and isnt feeling so good")
        }
        client.commands.get('status').execute(msg,args,status.health,status.hunger,status.happiness,status.timeLastFed,status.timeLastPlayed,status.personLastFed,status.personLastPlayed,status.timeAlive,status.generation)
        saveStatusData();
    }
    if(command == "help"){
        msg.channel.send("!status to check up on how jerrys doing\n!feed to feed him (but be careful not to overfeed him)\n!play to play with him and make him happy\n!graveyard to see dead jerrys")
    }
    if(command == "graveyard"){
        const graveyard = fs.readFileSync('./graveyard.json')
        graveyard.forEach(grave => {
            msg.channel.send(grave)
            return
        });
        msg.channel.send("empty")
    }

})

client.login(token)

var hello_reply =["hi","sup","yo","hello","wassup"];
var bye_reply = ["bye","peace","see ya","goodbye"]
var happy_reply =["im glad you feel that way!","i feel that way too!","if you feel that way then i do too!"]
var sad_reply=["im sorry you feel that way","i hope you feel better"]
var opinion_reply=["i hate them","i love them","theyre mid"]
var negative_reply=["thats not a nice thing to say","thats a little mean"]

/*const reply = (intent) =>{
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
}*/

start();