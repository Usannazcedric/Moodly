import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Image,
  Button,
  View,
  ActivityIndicator,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import MailIcon from "@/components/Mail";
import LockIcon from "@/components/Lock";
import NoEyesIcon from "@/components/NoEyes";

interface Mood {
  id: number;
  Rate: number;
  Description: string | null;
  user: {
    id: number;
    username: string;
  };
}

export default function TabTwoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [moods, setMoods] = useState<Mood[]>([]);
  const [fontsLoaded] = useFonts({
    Montserrat: require("@/assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        fetchUserData(token);
        fetchUserMoods(token);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://10.134.198.29:1337/api/auth/local",
        {
          identifier: email,
          password: password,
        }
      );

      const { jwt, user } = response.data;
      await AsyncStorage.setItem("authToken", jwt);
      setIsAuthenticated(true);
      setUsername(user.username);
      fetchUserMoods(jwt);
    } catch (error) {
      Alert.alert("Erreur", "Identifiants incorrects.");
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Erreur lors du décryptage du token:", error);
      return null;
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(
        "http://10.134.198.29:1337/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsername(response.data.username);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error
      );
    }
  };

  const fetchUserMoods = async (token: string) => {
    try {
      const decodedToken = parseJwt(token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error("Impossible de décrypter le token.");
      }

      const userId = decodedToken.id;

      const response = await axios.get(
        "http://10.134.198.29:1337/api/moods?populate=*",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userMoods = response.data.data.filter(
        (mood: Mood) => mood.user.id === userId
      );
      setMoods(userMoods);
    } catch (error) {
      console.error("Erreur lors de la récupération des moods:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setUsername("");
      setMoods([]);
      Alert.alert("Déconnexion réussie", "Vous avez été déconnecté.");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMoodsPeriodically = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        fetchUserMoods(token);
      }
    };

    if (isAuthenticated) {
      interval = setInterval(fetchMoodsPeriodically, 5000);
    }

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ImageBackground 
      source={require("@/assets/images/login-bg.png")}
      style={styles.backgroundImage}
      >
        
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.textContainer}>
          <ThemedText
            type="title"
            style={{
              color: "black",
              fontFamily: "Montserrat",
              marginBottom: 20,
              fontWeight: "bold",
              fontSize: 33,
            }}
          >
            Se connecter
          </ThemedText>
          <ThemedText
            type="title"
            style={{
              color: "grey",
              fontSize: 12,
              lineHeight: 18,
              fontFamily: "Montserrat",
            }}
          >
            Partagez, discutez et améliorez
          </ThemedText>
          <ThemedText
            type="title"
            style={{
              color: "grey",
              fontSize: 12,
              lineHeight: 18,
              fontFamily: "Montserrat",
            }}
          >
            ce que vous ressentez avec votre équipe.
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <MailIcon style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <LockIcon style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <NoEyesIcon style={styles.iconRight} />
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>C'est parti</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image style={styles.headerImage} />}
    >
      <ThemedView>
        <ThemedText type="title">Mon compte</ThemedText>
        {username ? (
          <ThemedText type="subtitle">Bienvenue, {username} !</ThemedText>
        ) : (
          <ThemedText type="subtitle">Chargement...</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.moodContainer}>
        <ThemedText type="title" style={{ color: "black" }}>
          Mes Humeurs
        </ThemedText>
        {moods.length > 0 ? (
          <FlatList
            data={moods}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.moodItem}>
                <ThemedText style={[styles.moodText, { color: "black" }]}>
                  {`Humeur: ${item.Rate} - ${
                    item.Description || "Pas de description"
                  }`}
                </ThemedText>
              </View>
            )}
          />
        ) : (
          <ThemedText style={{ color: "black" }}>
            Aucune humeur enregistrée.
          </ThemedText>
        )}
      </ThemedView>

      <View style={styles.logoutButtonContainer}>
        <Button title="Déconnexion" onPress={handleLogout} />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  headerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  moodContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 20,
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginVertical: 20,
  },
  moodItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  moodText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButtonContainer: {
    paddingHorizontal: 20,
  },
  loginContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    height: "60%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 140,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: "white",
    marginVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  iconLeft: {
    marginLeft: 10,
  },
  iconRight: {
    marginRight: 10,
  },
  button: {
    width: "100%",
    height: 40,
    backgroundColor: "black",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 35,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat",
  },
});
