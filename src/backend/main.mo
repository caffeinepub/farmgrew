import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceCents : Nat;
    category : Text;
    image : ?Storage.ExternalBlob;
  };

  public type Customer = {
    principal : Principal;
    name : Text;
    phoneNumber : Text;
    pickupAddress : Text;
  };

  public type Cart = {
    items : [(Nat, Nat)];
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #completed;
    #expired;
    #canceled;
  };

  public type PaymentMethod = {
    #stripe;
    #cashOnDelivery;
  };

  public type PaymentStatus = {
    #pending;
    #completed : {
      sessionId : Text;
      amountCents : Nat;
      timestamp : Time.Time;
    };
    #failed : { reason : Text };
  };

  public type OrderTrackingEntry = {
    status : OrderStatus;
    timestamp : Time.Time;
    note : Text;
  };

  public type Order = {
    id : Nat;
    customer : Principal;
    items : [(Nat, Nat)];
    totalPriceCents : Nat;
    status : OrderStatus;
    paymentStatus : PaymentStatus;
    timestamp : Time.Time;
    pickupTime : ?Time.Time;
    tracking : [OrderTrackingEntry];
    paymentMethod : PaymentMethod;
  };

  stable var _adminCredentials : ?AdminCredentials = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  var nextProductId = 1;

  let customers = Map.empty<Principal, Customer>();
  let carts = Map.empty<Principal, [(Nat, Nat)]>();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  let productImageMapping = Map.fromIter(
    [
      ("Carrot", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Carrots.jpg"),
      ("Beetroot", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Beetroot.png"),
      ("Turnip", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Turnip.jpg"),
      ("Bitter Gourd", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/BitterGourd.jpg"),
      ("Cucumber", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Cucumber.jpg"),
      ("Bottle Gourd", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/BottleGourd.jpg"),
      ("Lady Finger", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Bhindi.jpg"),
      ("French Beans", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/FrenchBeans.jpg"),
      ("Papaya", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Papaya.jpg"),
      ("Banana", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Bananas.jpg"),
      ("Cucumber Pickle", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/CucumberPickle.jpg"),
      ("Mango Pickle", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/MangoPickle.jpg"),
      ("Idli Batter", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/IdliBatter.jpg"),
      ("Dosa Batter", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/DosaBatter.jpg"),
      ("Chutney Powder", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/ChutneyPowder.jpg"),
      ("Vermicelli", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Vermicelli.jpg"),
      ("Murmura", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/PuffedRice.jpg"),
      ("Sago/Tapioca Pearls", "https://pkd-public-data.s3.ap-south-1.amazonaws.com/pkd-store/images/products/Sago.jpg"),
      ("Flour", "https://www.shutterstock.com/image-photo/heap-flour-scoop-spilled-260nw-2166007225.jpg"),
      ("Rice", "https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg"),
    ].values(),
  );

  public type ProductCategory = {
    #freshVegetable;
    #cutVegetable;
    #fruit;
    #cutFruit;
    #batter;
    #condiment;
    #other;
  };

  func categoryToText(cat : ProductCategory) : Text {
    switch (cat) {
      case (#cutVegetable) { "Cut Veggies & Salads" };
      case (#cutFruit) { "Cut Fruits" };
      case (#batter) { "Batter" };
      case (#condiment) { "Kitchen Needs" };
      case (_) { "Others" };
    };
  };

  let PRODUCT_NOT_FOUND_MESSAGE = "Product not found";
  let ORDER_NOT_FOUND_MESSAGE = "Order not found";
  let NOT_ENOUGH_QUANTITY_MESSAGE = "Not enough quantity in cart";
  let ADD_TO_CART_QUANTITY_LIMIT_MESSAGE = "Can only buy upto 10 units at a time";

  public type AdminCredentials = {
    username : Text;
    password : Text;
  };

  public shared ({ caller }) func authenticateAdmin(username : Text, password : Text) : async () {
    switch (_adminCredentials) {
      case (null) { Runtime.trap("Credentials not set") };
      case (?creds) {
        if (username == creds.username and creds.password == password) {
          let role = AccessControl.getUserRole(accessControlState, caller);
          switch (role) {
            case (#admin) { () };
            case (_) {
              AccessControl.assignRole(accessControlState, caller, caller, #admin);
            };
          };
        } else {
          Runtime.trap("Wrong username or password");
        };
      };
    };
  };

  public shared ({ caller }) func updateAdminCredentials(username : Text, password : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only current admin can change credentials");
    };

    _adminCredentials := ?{
      username;
      password;
    };
  };

  public shared ({ caller }) func grantAdminRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant admin privileges");
    };
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  public shared ({ caller }) func revokeAdminRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke admin privileges");
    };
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  public shared ({ caller }) func grantUserRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant user role");
    };
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  public query ({ caller }) func checkUserRole(user : Principal) : async AccessControl.UserRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check user roles");
    };
    AccessControl.getUserRole(accessControlState, user);
  };

  public query ({ caller }) func listProducts(category : ?Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        switch (category) {
          case (null) { true };
          case (?c) { product.category == c };
        };
      }
    );
  };

  public query ({ caller }) func getProductById(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap(PRODUCT_NOT_FOUND_MESSAGE) };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getCatalogMetadata() : async {
    productCount : Nat;
  } {
    return {
      productCount = products.size();
    };
  };

  public shared ({ caller }) func registerCustomer(name : Text, phoneNumber : Text, pickupAddress : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };

    if (name == "" or phoneNumber == "" or pickupAddress == "") {
      Runtime.trap("Name, phone number and pickup address must not be empty");
    };

    let customer : Customer = {
      principal = caller;
      name;
      phoneNumber;
      pickupAddress;
    };

    customers.add(caller, customer);
  };

  public query ({ caller }) func getIdForCaller() : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this");
    };
    caller;
  };

  public query ({ caller }) func getCustomerByPrincipal(principal : Principal) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view customer profiles");
    };

    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own customer profile");
    };

    switch (customers.get(principal)) {
      case (null) { Runtime.trap("Customer not registered for this II") };
      case (?customer) { customer };
    };
  };

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access cart");
    };

    switch (carts.get(caller)) {
      case (null) {
        let emptyCart : Cart = { items = [] };
        emptyCart;
      };
      case (?items) {
        let cart : Cart = { items };
        cart;
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    let filtered = orders.values().toArray().filter(
      func(order) {
        order.customer == caller;
      }
    );
    filtered;
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap(ORDER_NOT_FOUND_MESSAGE) };
      case (?order) {
        if (order.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap(PRODUCT_NOT_FOUND_MESSAGE) };
      case (?_product) {};
    };

    if (quantity > 10) {
      Runtime.trap(ADD_TO_CART_QUANTITY_LIMIT_MESSAGE);
    };

    let currentCart : [(Nat, Nat)] = switch (carts.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    let updatedCart = currentCart.map(
      func((pId, qty)) {
        if (pId == productId) {
          (pId, qty + quantity);
        } else {
          (pId, qty);
        };
      }
    );

    let cartWithNewProduct = if (not (currentCart.find(func((pid, _)) { pid == productId })).isSome()) {
      updatedCart.concat([(productId, quantity)]);
    } else {
      updatedCart;
    };

    carts.add(caller, cartWithNewProduct);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap(PRODUCT_NOT_FOUND_MESSAGE) };
      case (?_product) {};
    };

    let currentCart : [(Nat, Nat)] = switch (carts.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    if (quantity == 0) {
      let filteredCart = currentCart.filter(
        func((pId, _)) {
          pId != productId;
        }
      );
      carts.add(caller, filteredCart);
    } else {
      let updatedCart = currentCart.map(
        func((pId, qty)) {
          if (pId == productId) {
            (pId, quantity);
          } else {
            (pId, qty);
          };
        }
      );
      carts.add(caller, updatedCart);
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from cart");
    };

    let currentCart : [(Nat, Nat)] = switch (carts.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    let filteredCart = currentCart.filter(
      func((pId, _)) {
        pId != productId;
      }
    );
    carts.add(caller, filteredCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear cart");
    };

    carts.remove(caller);
  };

  public shared ({ caller }) func placeOrder(paymentMethod : PaymentMethod, pickupTime : ?Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    let customer = switch (customers.get(caller)) {
      case (null) { Runtime.trap("Customer not registered for this II") };
      case (?customer) { customer };
    };

    let cartItems = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    if (cartItems.size() == 0) {
      Runtime.trap("Cart cannot be empty");
    };

    let totalPriceCents = cartItems.foldLeft(
      0,
      func(acc, (productId, quantity)) {
        let product = switch (products.get(productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?p) { p };
        };
        let currentQuantity = cartItems.foldLeft(
          0,
          func(acc, (prod, qty)) {
            if (prod == productId) { acc + qty } else { acc };
          },
        );

        acc + (product.priceCents * currentQuantity);
      },
    );

    let orderId = nextOrderId;
    nextOrderId += 1;

    let initialTracking = [
      {
        status = #pending;
        timestamp = Time.now();
        note = "Order placed";
      },
    ];

    let initialPaymentStatus : PaymentStatus = switch (paymentMethod) {
      case (#cashOnDelivery) { #pending };
      case (#stripe) { #pending };
    };

    let order : Order = {
      id = orderId;
      customer = caller;
      items = cartItems;
      totalPriceCents;
      status = #pending;
      paymentStatus = initialPaymentStatus;
      timestamp = Time.now();
      pickupTime;
      tracking = initialTracking;
      paymentMethod;
    };

    orders.add(orderId, order);
    carts.remove(caller);
    orderId;
  };

  public shared ({ caller }) func setOrderPaid(orderId : Nat, sessionId : Text, amountCents : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set order as paid");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap(ORDER_NOT_FOUND_MESSAGE) };
      case (?order) { order };
    };

    // Verify ownership
    if (order.customer != caller) {
      Runtime.trap("Unauthorized: Can only mark your own orders as paid");
    };

    // SECURITY FIX: Only allow Stripe orders to be marked as paid by users
    // Cash on Delivery orders must be marked as paid by admin only
    if (order.paymentMethod != #stripe) {
      Runtime.trap("Unauthorized: Only Stripe orders can be marked as paid by users. Cash on Delivery orders must be marked as paid by admin.");
    };

    let updatedTracking = List.fromArray<OrderTrackingEntry>(order.tracking);
    updatedTracking.add({
      status = #confirmed;
      timestamp = Time.now();
      note = "Payment confirmed, order confirmed";
    });

    let updatedOrder : Order = {
      order with
      paymentStatus = #completed {
        sessionId;
        amountCents;
        timestamp = Time.now();
      };
      status = #confirmed;
      tracking = updatedTracking.toArray();
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func setOrderCompleted(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can complete orders");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap(ORDER_NOT_FOUND_MESSAGE) };
      case (?order) { order };
    };

    let updatedTracking = List.fromArray<OrderTrackingEntry>(order.tracking);
    updatedTracking.add({
      status = #completed;
      timestamp = Time.now();
      note = "Order completed";
    });

    let updatedOrder : Order = {
      order with
      status = #completed;
      tracking = updatedTracking.toArray();
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func markOrderAsPaidAdmin(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark orders as paid");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap(ORDER_NOT_FOUND_MESSAGE) };
      case (?order) { order };
    };

    if (order.paymentMethod != #cashOnDelivery) {
      Runtime.trap("Only cash on delivery orders can be marked as paid manually");
    };

    switch (order.paymentStatus) {
      case (#completed _) {
        Runtime.trap("Order is already marked as paid");
      };
      case (_) {};
    };

    let updatedTracking = List.fromArray<OrderTrackingEntry>(order.tracking);
    updatedTracking.add({
      status = #confirmed;
      timestamp = Time.now();
      note = "Order marked as paid (admin action)";
    });

    let updatedOrder : Order = {
      order with
      paymentStatus = #completed {
        sessionId = "CASH";
        amountCents = order.totalPriceCents;
        timestamp = Time.now();
      };
      status = #confirmed;
      tracking = updatedTracking.toArray();
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func createProduct(name : Text, description : Text, priceCents : Nat, category : Text, image : ?Storage.ExternalBlob) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    if (name == "" or description == "") {
      Runtime.trap("Name and description must not be empty");
    };

    let newProduct : Product = {
      id = nextProductId;
      name;
      description;
      priceCents;
      category;
      image;
    };

    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, description : Text, priceCents : Nat, category : Text, image : ?Storage.ExternalBlob) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      existingProduct with
      name;
      description;
      priceCents;
      category;
      image;
    };

    products.add(productId, updatedProduct);
    updatedProduct;
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_product) {};
    };

    products.remove(productId);
  };

  public query ({ caller }) func listAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all products");
    };

    products.values().toArray();
  };

  public shared ({ caller }) func uploadProductImage(productId : Nat, image : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload product images");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let updatedProduct = {
      product with image = ?image;
    };
    products.add(productId, updatedProduct);
    image;
  };

  public query ({ caller }) func getProductImage(productId : Nat) : async ?Storage.ExternalBlob {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product.image };
    };
  };

  // Stripe Integration Functions
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize Stripe configuration");
    };
    stripeConfig := null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check payment session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Admin Reset Functionality
  public query ({ caller }) func isAdminConfigured() : async Bool {
    _adminCredentials != null;
  };

  public shared ({ caller }) func initializeAdminAccess(username : Text, password : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can initialize admin access");
    };

    // Check if admin is already configured
    if (_adminCredentials != null) {
      Runtime.trap("Admin is already configured. Please use updateAdminCredentials to change settings.");
    };

    // Validate input
    if (username == "" or password == "") {
      Runtime.trap("Username and password must not be empty");
    };

    let credentials : AdminCredentials = {
      username;
      password;
    };

    _adminCredentials := ?credentials;
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };
};
