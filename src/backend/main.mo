import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
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

  public type Order = {
    id : Nat;
    customer : Principal;
    items : [(Nat, Nat)];
    totalPriceCents : Nat;
    status : OrderStatus;
    timestamp : Time.Time;
    pickupTime : ?Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  var nextProductId = 1;

  let customers = Map.empty<Principal, Customer>();
  let carts = Map.empty<Principal, [(Nat, Nat)]>();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

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
  let ADD_TO_CART_QUANTITY_LIMIT_MESSAGE = "Can only buy up to 10 units at a time";

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

  public shared ({ caller }) func placeOrder(pickupTime : ?Time.Time) : async Nat {
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

    let order : Order = {
      id = orderId;
      customer = caller;
      items = cartItems;
      totalPriceCents;
      status = #pending;
      timestamp = Time.now();
      pickupTime;
    };

    orders.add(orderId, order);
    carts.remove(caller);
    orderId;
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
      Runtime.trap("Unauthorized: Only admins can upload images");
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
};

