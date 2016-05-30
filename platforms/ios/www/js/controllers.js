angular.module('iPosApp.controllers',[])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

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
  .controller('HomeCtrl',function($http,$scope,CatalogService){


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

  .controller('CatalogCtrl',function($http,$scope,$ionicModal,CatalogService){
    //TODO hard code productStoreId
    var data = {productStoreId:'SHOWROOM-161-E'};
    var promise = CatalogService.findCatalogAndProduct(data);
    promise.then(
      function(data){
        $scope.catalogList = data.listIt;
        //alert(data.listIt[0].prodCatalogId);

      },
      function(data){
        //TODO alert warn message
      });
    /*$scope.showCatalog={};
    $scope.showCatalog.prodCatalogId="TEST";
    $scope.contact = {
      name: 'Mittens Cat',
      info: 'Tap anywhere on the card to open the modal'
    }
    $ionicModal.fromTemplateUrl("categoryMembers.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });*/

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
      alert(it.productId);
    }
    // Cleanup the modal when we're done with it!
    /*$scope.$on('$destroy', function() {
      $scope.modal.remove();
    });*/
    // Execute action on hide modal
    /*$scope.$on('modal.hidden', function() {
      // Execute action
    });*/
    // Execute action on remove modal
    /*$scope.$on('modal.removed', function() {
      // Execute action
    });*/

  })
  .controller('CatalogTabsCtrl',function($http,$scope,$ionicTabsDelegate,CatalogService){
    //TODO hard code productStoreId
    var data = {productStoreId:'SHOWROOM-161-E'};
    var promise = CatalogService.findCatalogAndProduct(data);
    promise.then(
      function(data){
        $scope.catalogList = data.listIt;
        //alert(data.listIt[0].prodCatalogId);

      },
      function(data){
        //TODO alert warn message
      });

      $scope.selectTabWithIndex = function(index) {
        alert(index);
        $ionicTabsDelegate.select(index);
      }
  })

  .controller('CustomerCtrl',function($http,$scope,CustomerService){
    /*//TODO hard code productStoreId
    var data = {productStoreId:'SHOWROOM-161-E'};*/
    /*<service name="findCustomerWebPos" engine="groovy" location="component://tabletpos/script/com/zuczug/customer/FindCustomerWebPos.groovy">
     <description>Uses dynamic view entity to find customers; returns a list of customer objects</description>
     <!--party fields-->
     <attribute name="partyId" type="String" mode="IN" optional="true"/>
     <!--person fields-->
     <attribute name="personName" type="String" mode="IN" optional="true"/>
     <!-- view and page fields -->
     <attribute name="viewIndex" type="Integer" mode="IN"/>
     <attribute name="viewSize" type="Integer" mode="IN"/>

     <attribute name="listIt" type="List" mode="OUT"/>
     <attribute name="listSize" type="Integer" mode="OUT"/>
     </service>*/
    var data = {viewIndex:0,viewSize:5};
    var promise = CustomerService.findCustomerWebPos(data);
    promise.then(
      function(data){
        $scope.customerList = data.listIt;
      },
      function(data){
        //TODO alert warn message
      });
  })

/*.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('BrowCtrl', function($scope, $stateParams) {
})*/
;
