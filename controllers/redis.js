var redis = require("redis"),
    client = redis.createClient();

exports.saveLast = function(phone,id){
  client.lpush(phone+":last",id)
}
exports.getLast = function(phone,callback){
  client.lrange(phone+":last",0,5,function(err,response){
    callback(null,response)
  })
}

exports.getFromLast = function(phone,index,callback){
  client.lindex(phone+":last",index,function(err,ans){
    callback(null,ans)
  })
}

exports.getFavorites = function(phone,callback){
  client.lrange(phone+":favorites",0,5,function(err,response){
    callback(null,response)
  })
}

exports.setFavorites = function(phone,id,index,callback){
  console.log(id.idStop)
  var id = JSON.parse(id)
  console.log(id.idStop)
  client.llen(phone+":favorites",function(err,res1){
    if(res1 < index){
      client.rpush(phone+":favorites",JSON.stringify({idStop:id.idStop,name:id.name}),function(err){
        if(err) console.log(err)
      })
    }
    else {
      client.lset(phone+":favorites",index,JSON.stringify({idStop:id.idStop,name:id.name}),function(err){
        if(err) console.log(err)
      })
    }
  })
}

exports.getFromFavorites = function(phone,index,callback){
  client.lindex(phone,index,function(err,ans){
    callback(null,ans)
  })
}
