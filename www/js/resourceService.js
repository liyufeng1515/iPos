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
    .service('GeoService',function($http,$q,ConfigService){
      return {
        getProvinceGeo:function(){
          var deferred = $q.defer();
          var data = {geoId:'CHN',geoAssocTypeId:'REGIONS'}
          $http({
            method:'POST',
            url:ConfigService.getHostURL()+"getChildGeoInfo",
            data:data
          }).success(function(data,status,header,config){
            deferred.resolve(data);
          }).error(function(data,status,header,config){
            deferred.reject(data);
          });
          return deferred.promise;
        },
        getCityGeo:function(data){
          var deferred = $q.defer();
          data.geoAssocTypeId = 'PROVINCE_CITY';
          $http({
            method:'POST',
            url:ConfigService.getHostURL()+'getChildGeoInfo',
            data:data
          }).success(function(data,status,header,config){
            deferred.resolve(data);
          }).error(function(data,status,header,config){
            deferred.reject(data);
          });
          return deferred.promise;
        },
        getCountyGeo:function(data){
          var deferred = $q.defer();
          data.geoAssocTypeId = 'CITY_COUNTY';
          $http({
            method:'POST',
            url:ConfigService.getHostURL()+'getChildGeoInfo',
            data:data
          }).success(function(data,status,header,config){
            deferred.resolve(data);
          }).error(function(data,status,header,config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }
      }
    })
  .service('CartService',function($http,$q,ConfigService){
    return {
      setCustomerToCart:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"setPartyToCart",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      },
      addProcutToCart:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"AddToCart",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      },
      checkout:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"setPaymentMethodType",
          data:data
        }).success(function(data,status,header,config){
          deferred.resolve(data);
        }).error(function(data,status,header,config){
          deferred.reject(data);
        });
        return deferred.promise;
      },
      createOrder:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"createOrderApproved",
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
      findCustomer:function(data){
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
      },
      createCustomer:function(data){
        var deferred = $q.defer();
        $http({
          method:'POST',
          url:ConfigService.getHostURL()+"createCustomerWebPos",
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
      },
      successMessage:function(data){
        var popup = $ionicPopup.alert({
          title:"消息提示",
          cssClass:"text-center",
          template:data,
          okType:"button-dark"
        });
        return popup;
      },
      confirmMessage:function(data){
        var popup = $ionicPopup.confirm({
          title:"消息确认提示",
          template:data,
        });
        return popup;
      }
    }
  })
  .service('ServiceUtil',function(){
    return {
      isError:function (data) {
        if(data._ERROR_MESSAGE_||data._ERROR_MESSAGE_LIST_){
          return true;
        }else if(data.responseMessage&&"error"==data.responseMessage){
          return true;
        }else{
          return false;
        }
      },
      getErrorMessage:function(data){
        if(data._ERROR_MESSAGE_){
          return data._ERROR_MESSAGE_;
        }else if(data._ERROR_MESSAGE_LIST_){
          return data._ERROR_MESSAGE_LIST_;
        }else if(data.errorMessage){
          return data.errorMessage;
        }
      }
    }
  })
    .service('ValidateUtil',function(){
      return {
        //金额正则
        isNumber:function (data) {
          var reg = /^(-)?(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
          if(reg.test(data)){
            return true;
          }else{
            return false;
          }
        },
        isEmpty:function(data){
          for(var i in data)
            if(data.hasOwnProperty(i)) return false;
          return true;
        }
      }
    })

;
