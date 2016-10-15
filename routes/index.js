var express = require('express');
var router = express.Router();
var async = require('async')
var db = require('../controllers/redis.js')
var request = require('request')
var parseString = require('xml2js').parseString;
var idClient = "***REMOVED***"
var passKey = "***REMOVED***"
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/getParada',function(req,res,next){
  request.post({url:"https://openbus.emtmadrid.es:9443/emt-proxy-server/last/geo/GetArriveStop.php", form:{idClient:idClient,passKey:passKey,idStop: req.body.id}},function(err,httpResponse,body){
    var string = ""
    console.log(body)
    var arrives = JSON.parse(body).arrives
    for(var i=0;i<arrives.length;i++){
      if(i == 0){
        request.post({url:"http://localhost:3423/getParadaName",form:{id:req.body.id,lineId: arrives[i].lineId}},function(err,httpResponse,body){
          if(req.body.internal != "true") db.saveLast(req.body.phone,JSON.stringify({idStop:req.body.id,name:body}))
        })
      }
      if(arrives[i].busTimeLeft != 999999)
        string += `La linea ${arrives[i].lineId} con destino ${arrives[i].destination} va a llegar en ${Math.round(arrives[i].busTimeLeft/60)} minutos \n`
      else string += `La linea ${arrives[i].lineId} con destino ${arrives[i].destination} va a llegar en más de 20 minutos \n`

    }
    res.end(JSON.stringify({string:string}))
  })
})

router.post('/getParadaInfo',function(req,res,next){
  request.post({url:"https://openbus.emtmadrid.es:9443/emt-proxy-server/last/geo/GetArriveStop.php", form:{idClient:idClient,passKey:passKey,idStop: req.body.id}},function(err,httpResponse,body){
    var arrives = JSON.parse(body).arrives
    for(var i=0;i<arrives.length;i++){
      if(i == 0){
        request.post({url:"http://localhost:3423/getParadaName",form:{id:req.body.id,lineId: arrives[i].lineId}},function(err,httpResponse,body){
            res.end(JSON.stringify({idStop:req.body.id,name:body}))
        })
      }
    }
  })

})

router.post('/getLast',function(req,res,next){
  async.parallel([function(callback){
    db.getLast(req.body.phone,callback)
  }],function(err,final){
    string = "Tus últimas 5 paradas son "
    for(var i=0;i<final[0].length;i++){
      string += i+1 + " " + JSON.parse(final[0][i]).idStop + " " + JSON.parse(final[0][i]).name + " \n "
    }
    string += "Selecciona una de ellas marcando el número más campanilla"
    res.end(JSON.stringify({string: string}))
  })
})

router.post('/getFromLast',function(req,res,next){
  async.parallel([function(callback){
    db.getFromLast(req.body.phone,req.body.index-1,callback)
  }],function(err,final){
    request.post({url: "http://localhost:3423/getParada",form:{phone:req.body.phone,id:JSON.parse(final[0]).idStop,internal:true}},function(err,httpResponse,body){
      res.end(body)
    })
  })
})

router.post('/getParadaName',function(req,res,next){
  request.post({url: "https://servicios.emtmadrid.es:8443/servicemedia/servicemedia.asmx/GetEstimatesIncident", form:{idClient:idClient,passKey:passKey,idStop:req.body.id,IdLine:req.body.lineId,Text_StopRequired_YN:"Y",Audio_StopRequired_YN:"N",Text_EstimationsRequired_YN:"N",Audio_EstimationsRequired_YN:"N",Text_IncidencesRequired_YN:"N",Audio_IncidencesRequired_YN:"N",DateTime_Referenced_Incidencies_YYYYMMDD:"20161010",statistics: "",cultureInfo:""}},function(err,httpResponse,body){
    parseString(body, function (err, result) {
      res.end(JSON.stringify(result.Result.Stop[0].Description[0]))
});
  })
})

router.post('/getFavorites',function(req,res,next){
  async.parallel([function(callback){
      db.getFavorites(req.body.phone,callback)
  }],function(err,final){
    string = "Tus paradas favoritas son "
    for(var i=0;i<final[0].length;i++){
      string += i+1 + " " + JSON.parse(final[0][i]).idStop + " " + JSON.parse(final[0][i]).name + " \n "
    }
    string += "Selecciona una de ellas marcando el número más campanilla"
    res.end(JSON.stringify({string: string}))  })
})

router.post('/addFavorites',function(req,res,next){
  request.post({url:"http://localhost:3423/getParadaInfo",form:{id:req.body.id}},function(err,httpResponse,body){
    async.parallel([function(callback){
      db.setFavorites(req.body.phone,body,req.body.index,callback)
    }],function(err,args){
      res.end("ok")
    })
  })

  router.post('/getFromFavorites',function(req,res,next){
    async.parallel([function(callback){
      db.getFromFavorites(req.body.phone,req.body.index-1,callback)
    }],function(err,final){
      request.post({url: "http://localhost:3423/getParada",form:{phone:req.body.phone,id:JSON.parse(final[0]).idStop,internal:true}},function(err,httpResponse,body){
        console.log(body)
        res.end(body)
      })
    })
  })

})
module.exports = router;
