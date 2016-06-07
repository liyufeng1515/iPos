angular.module('iPosApp.controllers',[])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout) {
  //init pos data
  $rootScope.cartProducts = [];

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  /*$ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });*/

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})
  .controller('HomeCtrl',function($http,$scope,$rootScope,CartService){
    $scope.customer = $rootScope.customer;
    $scope.cartProducts = $rootScope.cartProducts;
    $scope.mainNum = ".";
    $scope.calculator = function(str){
      if("-"==str){
        alert("暂不支持此字符");
      }else if("clr"==str){
        $scope.mainNum = ".";
      }else if("del"==str){
        if($scope.mainNum.length==1){
          $scope.mainNum = ".";
        }else{
          $scope.mainNum = $scope.mainNum.substring(0,$scope.mainNum.length-1);
        }
      }else{
        if($scope.mainNum&&$scope.mainNum.indexOf(".")>=0)
          $scope.mainNum = $scope.mainNum.replace(".","");
        $scope.mainNum+=str;
      }
    }

    $scope.checkout = function(){
      var demoData = {checkOutPaymentIdInfo:'CASH',preTotal_CASH:652.5}
      var promise = CartService.checkout(demoData);
      promise.then(function(data){
        //TODO 成功消息提示
        var reg = new RegExp('^[0-9]*$');
        if(reg.test($scope.mainNum)){
          alert(1);
        }
        var demoData = {facilityId:'ZUCZUG_CLOTHESFACILITY'};
        var promise = CartService.createOrder(demoData);
        promise.then(function(data){
          //TODO 成功消息提示
        },function(data){
          PopupService.errorMessage("创建出现错误,检查网络,或稍候重试."+data);
        });
      },function(data){
        PopupService.errorMessage("支付出现错误,检查网络,或稍候重试."+data);
      });
    }
  })

  .controller('LoginCtrl',function($http,$scope,$state,PopupService,LoginService){
    $scope.loginData = {};
    $scope.doLogin = function() {
      if(Object.keys($scope.loginData).length ==0){
        PopupService.errorMessage("请输入登录信息!!!")
      }else if($scope.loginData.USERNAME==null){
        PopupService.errorMessage("请输入用户名!!!")
      }else if($scope.loginData.PASSWORD==null){
        PopupService.errorMessage("请输入密码!!!")
      }else{
        var promise = LoginService.doLogin($scope.loginData);
         promise.then(
         function(data){
           if(data._LOGIN_PASSED_=="TRUE"){
             $state.go("app.home");
           }else if(data._ERROR_MESSAGE_){
             PopupService.errorMessage(data._ERROR_MESSAGE_);
           }
         },
         function(data){
           PopupService.errorMessage("登录出现错误,检查网络,或稍候重试."+data);
         });
      }
    };
  })

  .controller('CatalogCtrl',function($state,$rootScope,$scope,$ionicModal,PopupService,CatalogService,CartService){
    //TODO hard code productStoreId
    var data = {productStoreId:'SHOWROOM-161-E'};
    var promise = CatalogService.findCatalogAndProduct(data);
    promise.then(
      function(data){
        $scope.catalogList = data.listIt;
      },
      function(data){
        PopupService.errorMessage("查找目录商品出现错误,检查网络,或稍候重试."+data);
      });

    $scope.openModal = function(it) {
      $scope.showCatalog = it;
      $ionicModal.fromTemplateUrl("categoryMembers.html", {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose:false
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };
    $scope.closeModal = function() {
      $scope.modal.remove();
    };
    $scope.addProcutToCart = function(it){
      var demoData = {quantity:1,add_product_id:'E161BA06-10-F'};
      var promise = CartService.addProcutToCart(demoData);
      promise.then(
        function(data){
          //TODO 成功消息提示
          $rootScope.cartProducts.push(it);
        }, function(data){
          PopupService.errorMessage("添加商品出现错误,检查网络,或稍候重试."+data);
        });
    }
    $scope.$on('modal.removed', function() {
      if($rootScope.cartProducts.length!=0)
        $state.go("app.home",{},{reload:true});
    });
  })

  .controller('CustomerCtrl',function($state,$rootScope,$http,$scope,CustomerService,CartService,PopupService){
    //demo data
    var demoData = {"timecardAccountTypeId":"null","cardId":"null","lastName":"null","partyClassificationGroupId":"CommonClassification","contactNumber":"13962428310","groupName":"如是学","classThruDate":"null","availableBalanceTotal":"null","partyTypeId":"PARTY_GROUP","actualBalanceTotal":"null","roleTypeId":"CUSTOMER","partyId":"198736","description":"SHOWROOM客户类型","classFromDate":"2016-04-11 14:13:20.0","timecardAccountId":"null","firstName":"如是学","createdDate":"2016-04-11 14:13:20.0","ownerPartyId":"null"}
    //TODO hard code productStoreId
    //var data = {productStoreId:'SHOWROOM-161-E'};
    var data = {viewIndex:0,viewSize:5};
    var promise = CustomerService.findCustomerWebPos(data);
    promise.then(
      function(data){
        $scope.customerList = data.listIt;
      },
      function(data){
        PopupService.errorMessage("查找客户出现错误,检查网络,或稍候重试."+data);
      });
    $scope.setCustomerToCart = function(customer){
      //var data = {'partyId':customer.partyId};
      var demoCustomer = {"timecardAccountTypeId":"null","cardId":"null","lastName":"null","partyClassificationGroupId":"CommonClassification","contactNumber":"13333333333","groupName":"测试客户2","classThruDate":"null","availableBalanceTotal":"null","partyTypeId":"PARTY_GROUP","actualBalanceTotal":"null","roleTypeId":"CUSTOMER","partyId":"198721","description":"SHOWROOM客户类型","classFromDate":"2016-04-06 14:33:25.0","timecardAccountId":"null","firstName":"测试客户2","createdDate":"2016-04-06 14:33:25.0","ownerPartyId":"null"};
      var demoData = {'partyId':demoCustomer.partyId};;
      var promise = CartService.setCustomerToCart(demoData);
      promise.then(
        function(data){
          //TODO data message
          $rootScope.customer=demoCustomer;
          $state.go("app.home",{}, {reload:true});
        },
        function(data){
          PopupService.errorMessage("选择客户出现错误,检查网络,或稍候重试."+data);
        });
    }
  })
;
