const express = require("express")
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database.js");
const Pergunta = require("./database/Pergunta.js");
const Resposta = require("./database/Resposta.js");

//Database
connection.authenticate().then(() => {
    console.log('Conexão realizada com sucesso!');
}).catch((msgErro) => {
    console.log(`Deu ruim, ein véi! \n ${msgErro}`)
});

// Estou informando ao express, usar o EJS como engine view de HTML
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    Pergunta.findAll( { raw: true, order: [
        ['id','desc']
    ] }).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        });    
    });
});

app.get("/perguntar/", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    Pergunta.create({
        titulo: req.body.titulo,
        descricao: req.body.descricao
    }).then(() => {
        res.redirect("/")
    });
});

app.get("/pergunta/:id", (req, res) => {
    Pergunta.findOne({
        where: { id: req.params.id}
    }).then(perg => {
        if(perg != undefined){

            Resposta.findAll({
                where: { perguntaId: perg.id },
                order: [['id','desc']]
            }).then(resp => {                
                res.render("pergunta", {
                    pergunta: perg,
                    respostas: resp
                });
            });

        }else{
            res.redirect("/");
        }
    })
})

app.post("/responder", (req, res) => {
    Resposta.create({
        corpo: req.body.corpo,
        perguntaId: req.body.pergunta
    }).then(() => {
        res.redirect(`/pergunta/${req.body.pergunta}`);
    });
    
})

app.listen(8088, () => {
    console.log("App rodando!")
});