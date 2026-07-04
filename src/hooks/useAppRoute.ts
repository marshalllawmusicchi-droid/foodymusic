import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { pathToAppRoute } from "@/services/navigation";

export const useAppRoute = () => {
  const location = useLocation();
  const route = useMemo(() => pathToAppRoute(location.pathname), [location.pathname]);

  return {
    pathname: location.pathname,
    route,
  };
};
