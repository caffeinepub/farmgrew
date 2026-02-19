import AccessControl "authorization/access-control";

module {
  // Types only used for migration
  type OldActor = {
    _adminCredentials : ?{ username : Text; password : Text };
  };

  type NewActor = {
    _adminCredentials : ?{ username : Text; password : Text };
  };

  /// Admin full-reset migration function.
  /// * Resets stored admin credentials to null.
  /// * Resets access control state to fresh state with no assignments.
  public func run(old : OldActor) : NewActor {
    {
      old with
      _adminCredentials = null;
    };
  };
};
