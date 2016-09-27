angular.module('iPosApp.controllers',[])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout) {
  //init pos data
  $rootScope.cartProducts = [];
  $rootScope.customer = {};

  $rootScope.initCartProducts = function(data,quantity){
    var itemIndex  = -1;
    //TODO 此处totalAmount取值在接口完善的情况下需要换掉
    $rootScope.totalAmount = 0;
    angular.forEach($rootScope.cartProducts,function(it,index,array){
      $rootScope.totalAmount += it.price*it.quantity;
      if(it.productId == data.productId) itemIndex = index;
    });
    $rootScope.totalAmount+=data.price;
    if(itemIndex==-1){
      data['quantity']=quantity;
      $rootScope.cartProducts.push(data);
    }else{
      if($rootScope.cartProducts[itemIndex].quantity+quantity<=0){
        return "购物车数量不足."
      }
      $rootScope.cartProducts[itemIndex].quantity += quantity;
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
  .controller('HomeCtrl',function($scope,$rootScope,$state,$ionicListDelegate,$ionicModal,PopupService,CartService,ServiceUtil,ValidateUtil){
    //init scope data //TODO demo data
    $scope.paymentTypeList = [
      { text: "现金", value: "CASH" },
    ];
    $scope.facilityIdList = [
      { text: "成衣仓", value: "ZUCZUG_CLOTHESFACILITY" },
    ];
    $ionicModal.fromTemplateUrl("checkout.html", {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.cart.mainNum = ".";
    };
    $scope.initCartData = function(){
      $scope.disabled = false;//该状态作用:防止按钮多次提交
      $scope.cart = {
        facilityId:'ZUCZUG_CLOTHESFACILITY',
        facilityName:'成衣仓',
        checkOutPaymentIdInfo:'CASH',
        mainNum:".",
        totalAmount:$rootScope.totalAmount,
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
         $scope.closeModal();
         $rootScope.customer = {};
         $rootScope.cartProducts = [];
         $rootScope.totalAmount = 0;
         $scope.initCartData();
       },function(data){
        PopupService.errorMessage("创建出现错误,检查网络,或稍候重试.");
       });
    }
    $scope.openCheckoutModal = function(){
      //validate cusomer/product
      if(Object.keys($scope.cart.customer).length==0||$scope.cart.cartProducts.length==0){
        PopupService.errorMessage("请添加客户/商品到您的购物车,再尝试结算.");
        return false;
      }
      var checkoutConfirm = PopupService.confirmMessage("发货仓库为:<br/>&nbsp;"+$scope.cart.facilityName+"<br/>确认去结算订单吗?");
      checkoutConfirm.then(function(data){
        if(data)$scope.modal.show();
      })
    }
    $scope.checkout = function(){
      //validate cusomer/product
      if(Object.keys($scope.cart.customer).length==0||$scope.cart.cartProducts.length==0){
        PopupService.errorMessage("请添加客户/商品到您的购物车,再尝试结算.");
        return false;
      }
      //validate amout
      if(ValidateUtil.isNumber($scope.cart.mainNum)){
        var checkoutConfirm = PopupService.confirmMessage("支付方式为:&nbsp;"+$scope.cart.checkOutPaymentIdInfo+"<br/>支付金额为:&nbsp;"+$scope.cart.mainNum+"<br/>确认支付吗?");
        checkoutConfirm.then(function(data){
          if(data){
            var data = {checkOutPaymentIdInfo:$scope.cart.checkOutPaymentIdInfo,preTotal_CASH:$scope.cart.mainNum}
            var promise = CartService.checkout(data);
            promise.then(function(data){
              if(ServiceUtil.isError(data)){
                PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
                return false;
              }
              PopupService.successMessage("支付成功,确认创建订单中...");
              $scope.createOrder();
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
    $scope.changeQuantity = function(it,quantity){
      $scope.disabled = true;
      var newQuantity = it.quantity+quantity;
      if(newQuantity<=0){
        PopupService.errorMessage("购物车数量不足.");
        $scope.disabled = false;
        return false;
      }
      var data = {newVal:newQuantity,nowProductId:it.productId};
      var promise = CartService.updateInfoCartItem(data);
      promise.then(
          function(data){
            if(ServiceUtil.isError(data)){
              PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
              return false;
            }
            //PopupService.successMessage("修改商品数量成功.");
            var message = $rootScope.initCartProducts(it,quantity);
            if(message){
              PopupService.errorMessage(message);
              return false;
            }
            $scope.initCartData();
          }, function(data){
            PopupService.errorMessage("修改商品数量错误,检查网络,或稍候重试.");
          });
    }
    $scope.doRefresh = function(showClearCartBtn){
      $scope.showClearCartBtn = !showClearCartBtn;
      $scope.$broadcast('scroll.refreshComplete');
    }
    $scope.clearCart = function(){
      $rootScope.cartProducts = {};
      $scope.cart.cartProducts = $rootScope.cartProducts;
      $rootScope.totalAmount = 0;
      $scope.cart.totalAmount = $rootScope.totalAmount;
      $scope.showClearCartBtn = false;
      PopupService.successMessage("清空购物车成功.");
    }
    $scope.deleteCartItem = function(it){
      $rootScope.totalAmount -= it.price;
      $scope.cart.totalAmount = $rootScope.totalAmount;
      $scope.cart.cartProducts = $rootScope.cartProducts.splice($rootScope.cartProducts.indexOf(it),1);
      $ionicListDelegate.closeOptionButtons();
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

  .controller('CatalogCtrl',function($compile,$state,$rootScope,$scope,$ionicModal,PopupService,CatalogService,CartService,ServiceUtil){
    var data = {isCategoryType:true,isCatalog:true,productCategoryId:'SHOWROOM-161-E'};
    var promise = CatalogService.getCategoryList(data);
    promise.then(function(data){
      $scope.categoryList = data;
    },function(data){
      PopupService.errorMessage("获取目录数据出现错误,检查网络,或稍候重试.");
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
      var data = {quantity:1,add_product_id:it.productId};
      var promise = CartService.addProcutToCart(data);
      promise.then(
        function(data){
          if(ServiceUtil.isError(data)){
            PopupService.errorMessage(ServiceUtil.getErrorMessage(data));
            return false;
          }
          PopupService.successMessage("成功添加商品到购物车.");
          $rootScope.initCartProducts(it,1);
        }, function(data){
          PopupService.errorMessage("添加商品出现错误,检查网络,或稍候重试.");
        });
    }
    $scope.$on('modal.removed', function() {
      if($rootScope.cartProducts.length!=0)
        $state.go("app.home",{},{reload:true});
    });

    //$scope.categoryList = [{name:'分类A',id:'SHOWROOM_163E_ROOT'}];
    $scope.showProducts = function(category) {
      $scope.currentCategoryId = category.attr.id;
      //TODO hard code productStoreId
      var data = {productStoreId:'SHOWROOM-161-E'};
      var promise = CatalogService.findCatalogAndProduct(data);
      promise.then(
          function(data){
            $scope.productList = data.listIt[0].productList;
          },
          function(data){
            PopupService.errorMessage("查找目录商品出现错误,检查网络,或稍候重试.");
          });
    };
    //uid的作用:递归时动态设置sweet名字
    //alert(Math.floor(Math.random()*1000000));
    $scope.toggleCategory = function(category,uid) {
      //六位随机数作用:动态设置ng-repeat所需名字,因为名字重复出现的话angurlar会报错Cannot read property 'insertBefore' of null
      var random = Math.floor(Math.random()*100000);
      category.opened = !category.opened;
      if(category.opened){
        var data = {isCategoryType:false,isCatalog:false,productCategoryId:category.attr.id};
        var promise = CatalogService.getCategoryList(data);
        promise.then(function(data){
          $scope['categorylist'+random] = data;
          if(!$scope['categorylist'+random]) return false;
          var innerHtml = "<ion-item class=\"item-borderless\" ng-repeat=\"item in categorylist"+random+" | filter:''\" ng-class=\"{active: item.attr.id==currentCategoryId}\">"
              +"<i ng-click=\"toggleCategory(item,$id)\" class=\"icon button-large {{item.opened?'ion-minus':'ion-plus'}}\"></i>"
              +"<span style=\"font-weight: 900;font-size:18px;\" ng-click=\"showProducts(item)\">&nbsp;{{item.title}}</span>"
              +"<sweet content=\"sweet_{{$id}}\"></sweet>"
              +"</ion-item>";
          $scope['sweet_'+uid]=innerHtml;
        },function(data){
          PopupService.errorMessage("获取目录数据出现错误,检查网络,或稍候重试.");
        });
      }else{
        $scope['sweet_'+uid]=null;
      }
    };
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
        $scope.findCustomerList($scope.findData);
        $scope.initNewCustomerData();
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
