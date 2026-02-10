import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldProduct = {
    id : Nat;
    name : Text;
    category : Text;
    unitsPerPack : Nat;
    unitsPerPrice : Nat;
    priceCents : Nat;
    imageUrl : ?Text;
  };

  type NewProduct = {
    id : Nat;
    name : Text;
    description : Text;
    priceCents : Nat;
    category : Text;
    image : ?Storage.ExternalBlob;
  };

  public type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    nextProductId : Nat;
    seedProducts : [OldProduct];
  };

  public type NewActor = {
    products : Map.Map<Nat, NewProduct>;
    nextProductId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          id = oldProduct.id;
          name = oldProduct.name;
          description = "No description available";
          priceCents = oldProduct.priceCents;
          category = oldProduct.category;
          image = null;
        };
      }
    );
    {
      products = newProducts;
      nextProductId = old.nextProductId;
    };
  };
};

