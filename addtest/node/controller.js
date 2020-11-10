const SapCFAxios = require('sap-cf-axios').default;
const axios = require('axios');

exports.test = async (req, res) =>{
    console.log('ADD DESTINATION UI5 - test', req.url)
    res.status(200).send({"test" : "ok", "date" : new Date()});    
}

exports.redirect = async (req, res) =>{
    console.log('ADD DESTINATION UI5 - redirect url:', req.query.url)
    //var url = 'https://viacep.com.br/ws/01001000/json/'
    var url = req.query.url;
    const response = await axios({
        method : 'GET',
        url : url,
        params:{
            $formart : "json"
        },
        headers:{
            accept : "application/json"
        }
    });
    //console.log('ADD DESTINATION UI5 - redirect response', response.data)
    res.status(response.status).send(response.data) 
}

exports.destination = async (req, res) =>{
    var destination = req.params.destination;
    var uri = req.url.split(destination)[1];
    console.log('ADD DESTINATION UI5 - destination', destination);
    console.log('ADD DESTINATION UI5 - destination uri', uri);

    const axiosSap = SapCFAxios(destination);
    const response = await axiosSap({
        method : 'GET',
        url : uri,
        params:{
            $formart : "json"
        },
        headers:{
            accept : "application/json"
        }
    });
    //console.log('ADD DESTINATION UI5 - destination response', response.data)
    res.status(response.status).send(response.data)
}