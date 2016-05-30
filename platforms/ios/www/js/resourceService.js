angular.module("iPosApp.services",[])
  .service('ConfigService',function(){
    var hostURL = "http://121.199.20.78:8080/tabletpos/control/";
    var service = {
      getHostURL:function(){
        return hostURL;
      }
    }
    return service;
  })
  .service('CatalogService',function($http,$q,ConfigService){
    return {
      findCatalogAndProduct:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"findCatalogAndProduct",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  })
  .service('CustomerService',function($http,$q,ConfigService){
    return {
      findCustomerWebPos:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"findCustomerWebPos",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  })
  .service('LoginService',function($http,$q,ConfigService){
    return {
      doLogin:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"doLogin",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      }
    }
  })
  .service('PopupService',function($ionicPopup){
    return {
      errorMessage:function(data){
        var popup = $ionicPopup.alert({
          title:"错误消息",
          cssClass:"text-center",
          template:data,
          okType:"button-dark"
        });
        return popup;
      }
    }
  })

;
