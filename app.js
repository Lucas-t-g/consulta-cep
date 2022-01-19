const express = require('express')
const app = express()
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require("path")
const session = require('express-session')
const flash = require('connect-flash')
var getJSON = require('get-json')

const PORT = 50000

// Config
    // Handlebars 
        app.engine('handlebars', engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    // Public
        app.use(express.static(path.join(__dirname, "public")))

    // Body Parser
        app.use(bodyParser.urlencoded({extended: false}))
        app.use(bodyParser.json())

    // Session
        app.use(session({
            secret: "consultacep",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })

// Rotas
    app.get('/', function(req, res ){
        res.render('home')
    })

    app.post('/',function(req, res){
        var erros = []
        if( !req.body.cep || typeof req.body.cep == undefined || req.body.cep == null ){
            erros.push({texto: "Campo CEP nao pode ser vazio!"})
        }
        if( req.body.cep.length != 8){
            erros.push({texto: "O CEP deve possuir 8 digitos!"})
        }
        if(erros.length > 0){
            res.render("home", {erros: erros})
        }else{
            var url = 'http://viacep.com.br/ws/' + req.body.cep + '/json'
            // console.log("url: " + url)
            getJSON(url)
            .then( function(resp){
                // console.log(resp);
                // res.send(response)
                if ( resp.erro == true ){
                    erros.push({texto: "CEP invalido!"})
                }
                if(erros.length > 0){
                    res.render("home", {erros: erros})
                }else{
                    if( resp.logradouro == "" ){
                        resp.logradouro = "--"
                    }
                    if( resp.bairro == "" ){
                        resp.bairro = "--"
                    }
                    if( resp.localidade == "" ){
                        resp.localidade = "--"
                    }
                    if( resp.uf == "" ){
                        resp.uf = "--"
                    }
                    res.render("home", {resp: resp})
                }
            }).catch(function(error){
                console.log("err: " + error);
                res.redirect('/')
            })
        }
    })

app.listen(PORT, function(){
    console.log("servidor rodando na porta " + PORT)
})