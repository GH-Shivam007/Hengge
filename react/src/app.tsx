import { useState } from "react";
import { CreateUserForm } from "./create-user-form";

function App() {
  const [userWasCreated, setUserWasCreated] = useState(false);

  return userWasCreated ? (
    <p>User was successfully created!</p>
  ) : (
    <CreateUserForm setUserWasCreated={setUserWasCreated} />
  );
}

export default App;
