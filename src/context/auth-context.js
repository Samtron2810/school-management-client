import { createContext } from "react";

// Kept in its own (non-component) module so AuthContext.jsx stays a
// component-only export and fast refresh keeps working.
export const AuthContext = createContext(null);

export default AuthContext;
