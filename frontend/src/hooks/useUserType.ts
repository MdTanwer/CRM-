import { useState, useEffect } from "react";
import { getUserType } from "../services/activities.service";

interface UseUserTypeResult {
  userType: "admin" | "employee";
  isAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
}

export const useUserType = (
  initialUserType?: "admin" | "employee"
): UseUserTypeResult => {
  const [userType, setUserType] = useState<"admin" | "employee">(
    initialUserType || "employee"
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialUserType);

  useEffect(() => {
    const determineUserType = async () => {
      if (initialUserType) {
        setUserType(initialUserType);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Try to get user info from localStorage
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const user = JSON.parse(userData);
          const detectedType = getUserType(user);
          setUserType(detectedType);
          console.log("Detected user type:", detectedType);
        } else {
          // Fallback: try to get from auth context or API
          // This could be enhanced to call an API endpoint
          console.warn(
            "No user data found in localStorage, defaulting to employee"
          );
          setUserType("employee");
        }
      } catch (error) {
        console.error("Error determining user type:", error);
        setUserType("employee");
      } finally {
        setIsLoading(false);
      }
    };

    determineUserType();
  }, [initialUserType]);

  return {
    userType,
    isAdmin: userType === "admin",
    isEmployee: userType === "employee",
    isLoading,
  };
};
