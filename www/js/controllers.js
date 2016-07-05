angular.module('iPosApp.controllers',[])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout) {
  //init pos data
  $rootScope.cartProducts = [];
  $rootScope.customer = {};

  $rootScope.initCartProducts = function(data){
    var itemIndex  = -1;
    angular.forEach($rootScope.cartProducts,function(it,index,array){
      if(it.productId == data.productId) itemIndex = index;
    });
    if(itemIndex==-1){
      data['quantity']=1;
      $rootScope.cartProducts.push(data);
    }else{
      $rootScope.cartProducts[itemIndex].quantity += 1;
    }
  }
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
  .controller('HomeCtrl',function($scope,$rootScope,$state,PopupService,CartService,ServiceUtil,ValidateUtil){
    //init scope data //TODO demo data
    $scope.paymentTypeList = [
      { text: "现金", value: "CASH" },
      { text: "demo别选我", value: "CASH1" },
      { text: "demo别选我2", value: "CASH2" },
    ];
    $scope.facilityIdList = [
      { text: "成衣仓", value: "ZUCZUG_CLOTHESFACILITY" },
      { text: "demo别选我3", value: "ZUCZUG_CLOTHESFACILITY3" },
    ];
    $scope.initCartData = function(){
      $scope.cart = {
        facilityId:'ZUCZUG_CLOTHESFACILITY',
        checkOutPaymentIdInfo:'CASH',
        mainNum:".",
        customer:$rootScope.customer,
        cartProducts:$rootScope.cartProducts
      };
    }
    $scope.initCartData();
    $scope.showCartDetail = function(){
      $scope.cartDetail = true;
    }
    $scope.closeCartDetail = function(){
      $scope.cartDetail = false;
    }
    $scope.calculator = function(str){
      if("clr"==str){
        $scope.cart.mainNum = ".";
      }else if("del"==str){
        if($scope.cart.mainNum.length==1){
          $scope.cart.mainNum = ".";
        }else{
          $scope.cart.mainNum = $scope.cart.mainNum.substring(0,$scope.cart.mainNum.length-1);
        }
      }else if("."==str){
        if($scope.cart.mainNum.indexOf(".")>=0){
          PopupService.errorMessage("无效的数字.");
        }else{
          $scope.cart.mainNum+=str;
        }
      }else{
        if(0==str&&$scope.cart.mainNum.indexOf("0")==0&&$scope.cart.mainNum.indexOf(".")!=1){
          PopupService.errorMessage("无效的数字.");
          return false;
        }else if('00'==str&&$scope.cart.mainNum.indexOf(".")==0){
          PopupService.errorMessage("无效的数字.");
          return false;
        }
        if($scope.cart.mainNum.indexOf(".")==0){
          $scope.cart.mainNum = $scope.cart.mainNum.replace(".","");
        }else if($scope.cart.mainNum.indexOf("0")==0&&$scope.cart.mainNum.indexOf(".")!=1){
          $scope.cart.mainNum = $scope.cart.mainNum.replace("0","");
        }
        $scope.cart.mainNum+=str;
      }
    }
    $scope.goCustomerPage = function(){
      $state.go("app.customer",{},{reload:true});
    }
    $scope.createOrder = function(){
      //validate cusomer/product
      if(Object.keys($scope.cart.customer).length==0||$scope.cart.cartProducts.length==0){
        PopupService.errorMessage("请添加客户/商品到您的购物车,再尝试结算.");
        return false;
      }
       var data = {facilityId:$scope.cart.facilityId};
       var promise = CartService.createOrder(data);
       promise.then(function(data){
         if(ServiceUtil.isError(data)){
           PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
           return false;
         }
         PopupService.successMessage("创建订单成功.");
         //clear/init data
         $scope.closeCartDetail();
         $rootScope.customer = {};
         $rootScope.cartProducts = [];
         $scope.initCartData();
       },function(data){
        PopupService.errorMessage("创建出现错误,检查网络,或稍候重试.");
       });
    }
    $scope.checkout = function(){
      //validate cusomer/product
      if(Object.keys($scope.cart.customer).length==0||$scope.cart.cartProducts.length==0){
        PopupService.errorMessage("请添加客户/商品到您的购物车,再尝试结算.");
        return false;
      }
      //validate amout
      if(ValidateUtil.isNumber($scope.cart.mainNum)){
        var checkoutConfirm = PopupService.confirmMessage("当前支付方式为:"+$scope.cart.checkOutPaymentIdInfo+",确认支付吗?");
        checkoutConfirm.then(function(data){
          $scope.showCartDetail();
          if(data){
            var data = {checkOutPaymentIdInfo:$scope.cart.checkOutPaymentIdInfo,preTotal_CASH:$scope.cart.mainNum}
            var promise = CartService.checkout(data);
            promise.then(function(data){
              if(ServiceUtil.isError(data)){
                PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
                return false;
              }
              PopupService.successMessage("支付成功,请确认发货仓库并确认结算.");
            },function(data){
              PopupService.errorMessage("支付出现错误,检查网络,或稍候重试.");
            });
          }
        });
      }else{
        PopupService.errorMessage("请先输入正确金额.");
        return false;
      }
    }
  })

  .controller('LoginCtrl',function($http,$scope,$state,PopupService,LoginService,ServiceUtil){
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
             PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
           }else{
             PopupService.errorMessage("网络异常.");
           }
         },
         function(data){
           PopupService.errorMessage("登录出现错误,检查网络,或稍候重试.");
         });
      }
    };
  })

  .controller('CatalogCtrl',function($state,$rootScope,$scope,$ionicModal,PopupService,CatalogService,CartService,ServiceUtil){
    //TODO hard code productStoreId
    var data = {productStoreId:'SHOWROOM-161-E'};
    var promise = CatalogService.findCatalogAndProduct(data);
    promise.then(
      function(data){
        $scope.catalogList = data.listIt;
      },
      function(data){
        PopupService.errorMessage("查找目录商品出现错误,检查网络,或稍候重试.");
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
          if(ServiceUtil.isError(data)){
            PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
            return false;
          }
          PopupService.successMessage("成功添加商品到购物车.");
          $rootScope.initCartProducts(it);
        }, function(data){
          PopupService.errorMessage("添加商品出现错误,检查网络,或稍候重试.");
        });
    }
    $scope.$on('modal.removed', function() {
      if($rootScope.cartProducts.length!=0)
        $state.go("app.home",{},{reload:true});
    });
  })

  .controller('CustomerCtrl',function($filter,$ionicModal,$state,$rootScope,$http,$scope,CustomerService,CartService,PopupService,GeoService,ServiceUtil,ValidateUtil){
    $scope.findData = {viewIndex:0,viewSize:100};
    $scope.findCustomerList = function(data){
      var promise = CustomerService.findCustomerList(data);
      promise.then(
          function(data){
            if(ServiceUtil.isError(data)){
              PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
              return false;
            }
            $scope.customerList = data.listIt;
          },
          function(data){
            PopupService.errorMessage("查找客户出现错误,检查网络,或稍候重试.");
          });
    }
    $scope.initNewCustomerData = function(){
      $scope.newCustomer = {gender:'F'};
    }
    //init data
    $scope.findCustomerList($scope.findData);
    $scope.initNewCustomerData();
    var promise = GeoService.getProvinceGeo();
    promise.then(function(data){
      if(ServiceUtil.isError(data)){
        PopupService.errorMessage('获取省份列表失败,检查网络或稍候重试.'+data);
        return false;
      }
      $scope.provinceList = data.geoInfoList;
    },function(data){
      PopupService.errorMessage('获取省份列表失败,检查网络或稍候重试.');
    });

    //watch data
    $scope.$watch('newCustomer.province', function(newVal) {
      if(newVal)GeoService.getCityGeo({geoId:newVal}).then(function(data){$scope.cityList=data.geoInfoList;$scope.countyList={};});
    });
    $scope.$watch('newCustomer.city', function(newVal) {
      if(newVal)GeoService.getCountyGeo({geoId:newVal}).then(function(data){$scope.countyList=data.geoInfoList;});
    });
    //date call back
    $scope.datePickerCallback = function (val) {if (val) $scope.newCustomer.birthDate = $filter('date')(val,'yyyy-MM-dd');}

    $scope.createCustomer = function(data){
      if(data&&ValidateUtil.isEmpty($scope.newCustomer.company)){PopupService.errorMessage("请录入企业客户名称.");return false;}
      if(data&&ValidateUtil.isEmpty($scope.newCustomer.province)){PopupService.errorMessage("请录入所属省份.");return false;}
      if(data&&ValidateUtil.isEmpty($scope.newCustomer.city)){PopupService.errorMessage("请录入所属城市.");return false;}
      if(data&&ValidateUtil.isEmpty($scope.newCustomer.county)){PopupService.errorMessage("请录入所属区县.");return false;}
      if(data&&ValidateUtil.isEmpty($scope.newCustomer.address)){PopupService.errorMessage("请录入企业联系地址.");return false;}
      if(ValidateUtil.isEmpty($scope.newCustomer.personName)){PopupService.errorMessage("请录入联系人姓名.");return false;}
      if(ValidateUtil.isEmpty($scope.newCustomer.contactNumber)){PopupService.errorMessage("请录入手机号码.");return false;}
      if(ValidateUtil.isEmpty($scope.newCustomer.birthDate)){PopupService.errorMessage("请录入生日日期.");return false;}
      var promise = CustomerService.createCustomer($scope.newCustomer);
      promise.then(function(data){
        if(ServiceUtil.isError(data)){
          PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
          return false;
        }
        PopupService.successMessage("创建新客户成功.");
        $scope.closeModal();
      },function(data){
        PopupService.errorMessage("创建用户出错,检查网络,或稍候重试.");
      });
    }

    $ionicModal.fromTemplateUrl("editCustomer.html", {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.editCustomer = function(customer){
      $scope.modal.show();
    }

    $scope.closeModal = function(){
      $scope.initNewCustomerData();
      $scope.modal.hide();
    }

    $scope.setCustomerToCart = function(customer){
      var data = {'partyId':customer.partyId};
      //var demoCustomer = {"timecardAccountTypeId":"null","cardId":"null","lastName":"null","partyClassificationGroupId":"CommonClassification","contactNumber":"13333333333","groupName":"测试客户2","classThruDate":"null","availableBalanceTotal":"null","partyTypeId":"PARTY_GROUP","actualBalanceTotal":"null","roleTypeId":"CUSTOMER","partyId":"198721","description":"SHOWROOM客户类型","classFromDate":"2016-04-06 14:33:25.0","timecardAccountId":"null","firstName":"测试客户2","createdDate":"2016-04-06 14:33:25.0","ownerPartyId":"null"};
      //var demoData = {'partyId':demoCustomer.partyId};;
      var promise = CartService.setCustomerToCart(data);
      promise.then(
        function(data){
          if(ServiceUtil.isError(data)){
            PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
            return false;
          }
          $rootScope.customer=customer;
          $state.go("app.home",{}, {reload:true});
        }, function(data){
          PopupService.errorMessage("选择客户出现错误,检查网络,或稍候重试.");
        });
    }


  })
  .controller('OrderCtrl',function($scope,$filter,$ionicModal,ServiceUtil,OrderService,PopupService){
    $scope.findData = {viewIndex:0,viewSize:100};
    $scope.findOrderList = function(data){
      var promise = OrderService.findOrderList(data);
      promise.then(function(data){
        if(ServiceUtil.isError(data)){
          PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
          return false;
        }
        $scope.orderList = data.listIt;
      },function(data){
        PopupService.errorMessage("获取订单列表出现错误,检查网络,或稍候重试.");
      });
    }
    //init
    $scope.findOrderList($scope.findData);
    $scope.pickDate = new Date();
    $scope.fromDatePickerCallback = function (val) {if (val) $scope.findData.fromDate = $filter('date')(val,'yyyy-MM-dd');}
    $scope.thruDatePickerCallback = function (val) {if (val) $scope.findData.thruDate = $filter('date')(val,'yyyy-MM-dd');}

    $ionicModal.fromTemplateUrl("orderDetail.html",{
      scope:$scope,
      animation:'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal){
      $scope.modal = modal;
    });

    $scope.showOrderDetail = function(orderId){
      var data ={orderId:orderId};
      var promise = OrderService.getOrderDetail(data);
      promise.then(function(data){
        if(ServiceUtil.isError(data)){
          PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
          return false;
        }
        $scope.orderDetail = data;
        $scope.modal.show();
      },function(data){
        PopupService.errorMessage("获取订单详细出现错误,检查网络,或稍候重试.");
      });
    }
    $scope.closeModal = function(){
      $scope.modal.hide();
    }
  })
;
