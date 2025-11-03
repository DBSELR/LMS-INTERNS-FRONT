import { jwtDecode } from "jwt-decode";

export const getLoggedInUserId = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.UserId || decoded["UserId"];
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch {
    return null;
  }
};
