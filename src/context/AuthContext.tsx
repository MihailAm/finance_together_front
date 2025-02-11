import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  isAuthenticated: boolean | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

type DecodedToken = {
  exp: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  let backgroundTimeout: NodeJS.Timeout | null = null; // Храним таймер

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background") {
        console.log("App moved to background, starting 5-minute timer...");
        backgroundTimeout = setTimeout(async () => {
          console.log("5 minutes passed, clearing token...");
          await AsyncStorage.removeItem("access_token");
          setIsAuthenticated(false);
        }, 5 * 60 * 1000); // 5 минут (в миллисекундах)
      } else if (nextAppState === "active") {
        if (backgroundTimeout) {
          console.log("App returned to foreground, clearing timeout...");
          clearTimeout(backgroundTimeout); // Отменяем удаление токена, если приложение вернулось
          backgroundTimeout = null;
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (backgroundTimeout) {
        clearTimeout(backgroundTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("access_token");

      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          const isTokenExpired = decoded.exp * 1000 < Date.now();

          if (!isTokenExpired) {
            setIsAuthenticated(true);
          } else {
            console.log("Token expired, clearing storage...");
            await AsyncStorage.removeItem("access_token");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Invalid token format, clearing storage...");
          await AsyncStorage.removeItem("access_token");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem("access_token", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
