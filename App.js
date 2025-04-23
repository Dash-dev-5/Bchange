"use client"

import { StatusBar } from "expo-status-bar"
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Keyboard,
  Platform,
} from "react-native"
import { saveData, getData, updateData } from "./firebaseGetAndPost"
import { useEffect, useState, useRef } from "react"
import {
  TextInput,
  Button,
  Provider as PaperProvider,
  Text,
  IconButton,
  Divider,
  Menu,
  Searchbar,
  ActivityIndicator,
} from "react-native-paper"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BlurView } from "expo-blur"
import { useFonts } from "expo-font"
import { createTheme, ThemeProvider } from "./theme"
import { SettingsScreen } from "./components/SettingsScreen"
import { DashboardScreen } from "./components/DashboardScreen"
import { printTicket, generateReport } from "./utils/printing"
import { formatCurrency } from "./utils/currency"
import { useKeyboardVisible } from "./hooks/useKeyboardVisible"

export default function App() {
  // Chargement des polices
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
  })

  // États pour le thème
  const [isDarkMode, setIsDarkMode] = useState(false)
  const theme = createTheme(isDarkMode ? "dark" : "light")

  // États pour les animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  // États pour la gestion de la caisse
  const [isCaisseOpen, setIsCaisseOpen] = useState(false)
  const [fondInitial, setFondInitial] = useState("")
  const [caisseId, setCaisseId] = useState(null)
  const [caisseData, setCaisseData] = useState(null)
  const [loading, setLoading] = useState(true)

  // États pour les transactions
  const [transactions, setTransactions] = useState([])
  const [currentView, setCurrentView] = useState("home")
  const [modalVisible, setModalVisible] = useState(false)
  const [transactionType, setTransactionType] = useState("achat")
  const [montant, setMontant] = useState("")
  const [devise, setDevise] = useState("USD")
  const [tauxChange, setTauxChange] = useState("")
  const [nomClient, setNomClient] = useState("")
  const [numeroClient, setNumeroClient] = useState("")
  const [menuVisible, setMenuVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState([])

  // États pour les devises et taux
  const [devises, setDevises] = useState([
    { code: "USD", nom: "Dollar américain", tauxAchat: 2500, tauxVente: 2550, symbol: "$" },
    { code: "EUR", nom: "Euro", tauxAchat: 2700, tauxVente: 2750, symbol: "€" },
    { code: "GBP", nom: "Livre sterling", tauxAchat: 3200, tauxVente: 3250, symbol: "£" },
    { code: "AOA", nom: "Kwanza angolais", tauxAchat: 3.0, tauxVente: 3.2, symbol: "Kz" },
    { code: "ZAR", nom: "Rand sud-africain", tauxAchat: 140, tauxVente: 145, symbol: "R" },
  ])

  // Détection du clavier
  const isKeyboardVisible = useKeyboardVisible()

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Chargement des préférences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme")
        if (storedTheme) {
          setIsDarkMode(storedTheme === "dark")
        }

        const storedDevises = await AsyncStorage.getItem("devises")
        if (storedDevises) {
          setDevises(JSON.parse(storedDevises))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des préférences:", error)
      }
    }

    loadPreferences()
  }, [])

  // Sauvegarde des préférences
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await AsyncStorage.setItem("theme", isDarkMode ? "dark" : "light")
        await AsyncStorage.setItem("devises", JSON.stringify(devises))
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences:", error)
      }
    }

    savePreferences()
  }, [isDarkMode, devises])

  // Vérifier si une caisse est déjà ouverte au démarrage
  useEffect(() => {
    checkCaisseStatus()
  }, [])

  // Filtrer les transactions lors de la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTransactions(transactions)
    } else {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.nomClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.devise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.montantDevise.toString().includes(searchQuery) ||
          transaction.montantLocal.toString().includes(searchQuery),
      )
      setFilteredTransactions(filtered)
    }
  }, [searchQuery, transactions])

  const checkCaisseStatus = async () => {
    setLoading(true)
    try {
      const caisses = await getData("caisses")
      const caisseOuverte = caisses.find(
        (caisse) => caisse.status === "open" && caisse.date === format(new Date(), "yyyy-MM-dd"),
      )

      if (caisseOuverte) {
        setIsCaisseOpen(true)
        setCaisseId(caisseOuverte.id)
        setCaisseData(caisseOuverte)

        // Charger les transactions de la journée
        const transactionsData = await getData("transactions")
        const todayTransactions = transactionsData.filter((transaction) => transaction.caisseId === caisseOuverte.id)
        setTransactions(todayTransactions)
        setFilteredTransactions(todayTransactions)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la caisse:", error)
      Alert.alert("Erreur", "Impossible de vérifier l'état de la caisse")
    } finally {
      setLoading(false)
    }
  }

  const ouvrirCaisse = async () => {
    if (!fondInitial || isNaN(Number.parseFloat(fondInitial)) || Number.parseFloat(fondInitial) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide pour le fond initial")
      return
    }

    setLoading(true)
    try {
      const date = format(new Date(), "yyyy-MM-dd")
      const timestamp = new Date().toISOString()

      const caisseData = {
        date,
        timestamp,
        fondInitial: Number.parseFloat(fondInitial),
        status: "open",
        transactions: 0,
        totalAchats: 0,
        totalVentes: 0,
        soldeTheoriqueFinal: Number.parseFloat(fondInitial),
      }

      const id = await saveData("caisses", caisseData)
      setCaisseId(id)
      setCaisseData({ ...caisseData, id })
      setIsCaisseOpen(true)
      setCurrentView("home")

      // Animation de succès
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      Alert.alert("Succès", "La caisse a été ouverte avec succès")
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la caisse:", error)
      Alert.alert("Erreur", "Impossible d'ouvrir la caisse")
    } finally {
      setLoading(false)
    }
  }

  const fermerCaisse = async () => {
    setLoading(true)
    try {
      if (!caisseId) {
        Alert.alert("Erreur", "Aucune caisse ouverte")
        return
      }

      // Calculer les totaux
      let totalAchats = 0
      let totalVentes = 0

      transactions.forEach((transaction) => {
        if (transaction.type === "achat") {
          totalAchats += transaction.montantLocal
        } else {
          totalVentes += transaction.montantLocal
        }
      })

      const soldeTheoriqueFinal = Number.parseFloat(caisseData.fondInitial) + totalVentes - totalAchats

      // Mettre à jour la caisse
      await updateData("caisses", caisseId, {
        status: "closed",
        fermetureTimestamp: new Date().toISOString(),
        transactions: transactions.length,
        totalAchats,
        totalVentes,
        soldeTheoriqueFinal,
      })

      // Générer et imprimer le rapport
      await generateReport(caisseData, transactions, devises)

      // Réinitialiser les états
      setIsCaisseOpen(false)
      setCaisseId(null)
      setCaisseData(null)
      setTransactions([])
      setFilteredTransactions([])
      setCurrentView("home")

      Alert.alert("Succès", "La caisse a été fermée avec succès")
    } catch (error) {
      console.error("Erreur lors de la fermeture de la caisse:", error)
      Alert.alert("Erreur", "Impossible de fermer la caisse")
    } finally {
      setLoading(false)
    }
  }

  const ajouterTransaction = async () => {
    if (!isCaisseOpen) {
      Alert.alert("Erreur", "Veuillez d'abord ouvrir la caisse")
      return
    }

    if (!montant || isNaN(Number.parseFloat(montant)) || Number.parseFloat(montant) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide")
      return
    }

    if (!nomClient) {
      Alert.alert("Erreur", "Veuillez entrer le nom du client")
      return
    }

    setLoading(true)
    try {
      const deviseSelectionnee = devises.find((d) => d.code === devise)
      const taux = transactionType === "achat" ? deviseSelectionnee.tauxAchat : deviseSelectionnee.tauxVente
      const montantDevise = Number.parseFloat(montant)
      const montantLocal = montantDevise * taux

      const transaction = {
        caisseId,
        type: transactionType,
        devise,
        montantDevise,
        taux,
        montantLocal,
        nomClient,
        numeroClient,
        timestamp: new Date().toISOString(),
        date: format(new Date(), "yyyy-MM-dd"),
        heure: format(new Date(), "HH:mm:ss"),
      }

      const id = await saveData("transactions", transaction)
      const newTransaction = { ...transaction, id }

      // Mettre à jour la liste des transactions
      const updatedTransactions = [...transactions, newTransaction]
      setTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions)

      // Imprimer le ticket
      await printTicket(newTransaction, devises)

      // Réinitialiser les champs
      setMontant("")
      setNomClient("")
      setNumeroClient("")
      setModalVisible(false)

      // Animation de succès
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()

      Alert.alert("Succès", "Transaction enregistrée avec succès")
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction:", error)
      Alert.alert("Erreur", "Impossible d'enregistrer la transaction")
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const addCurrency = (newCurrency) => {
    if (devises.some((d) => d.code === newCurrency.code)) {
      Alert.alert("Erreur", "Cette devise existe déjà")
      return
    }

    setDevises([...devises, newCurrency])
  }

  const updateCurrency = (updatedCurrency) => {
    const updatedDevises = devises.map((d) => (d.code === updatedCurrency.code ? updatedCurrency : d))
    setDevises(updatedDevises)
  }

  const deleteCurrency = (currencyCode) => {
    if (transactions.some((t) => t.devise === currencyCode)) {
      Alert.alert(
        "Attention",
        "Cette devise est utilisée dans des transactions. La supprimer pourrait causer des problèmes. Voulez-vous continuer ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => {
              const filteredDevises = devises.filter((d) => d.code !== currencyCode)
              setDevises(filteredDevises)
            },
          },
        ],
      )
    } else {
      const filteredDevises = devises.filter((d) => d.code !== currencyCode)
      setDevises(filteredDevises)
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
          Chargement...
        </Text>
      </View>
    )
  }

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerLeft}>
        {currentView !== "home" && (
          <IconButton icon="arrow-left" size={24} color={theme.colors.primary} onPress={() => setCurrentView("home")} />
        )}
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
          {currentView === "home"
            ? "Bureau de Change"
            : currentView === "openCaisse"
              ? "Ouverture de Caisse"
              : currentView === "transaction"
                ? "Transactions"
                : currentView === "report"
                  ? "Rapport"
                  : currentView === "settings"
                    ? "Paramètres"
                    : currentView === "dashboard"
                      ? "Tableau de Bord"
                      : ""}
        </Text>
      </View>

      <View style={styles.headerRight}>
        {/* <IconButton
          icon={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
          size={24}
          color={theme.colors.primary}
          onPress={toggleTheme}
        /> */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              color={theme.colors.primary}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false)
              setCurrentView("settings")
            }}
            title="Paramètres"
            leadingIcon="cog"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false)
              setCurrentView("dashboard")
            }}
            title="Tableau de bord"
            leadingIcon="view-dashboard"
          />
          {isCaisseOpen && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false)
                generateReport(caisseData, transactions, devises)
              }}
              title="Imprimer rapport"
              leadingIcon="printer"
            />
          )}
          <Divider />
          {isCaisseOpen ? (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false)
                Alert.alert("Fermeture de caisse", "Êtes-vous sûr de vouloir fermer la caisse ?", [
                  { text: "Annuler", style: "cancel" },
                  { text: "Confirmer", onPress: fermerCaisse },
                ])
              }}
              title="Fermer la caisse"
              leadingIcon="logout"
              titleStyle={{ color: theme.colors.error }}
            />
          ) : (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false)
                setCurrentView("openCaisse")
              }}
              title="Ouvrir la caisse"
              leadingIcon="login"
              titleStyle={{ color: theme.colors.primary }}
            />
          )}
        </Menu>
      </View>
    </View>
  )

  const renderHome = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        {
          backgroundColor: theme.colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
          Bureau de Change
        </Text>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
          {format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}
        </Text>
      </View>

      {isCaisseOpen ? (
        <>
          <View style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
              Informations de caisse
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Ouverture:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                {format(new Date(caisseData.timestamp), "HH:mm", { locale: fr })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Fond initial:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                {formatCurrency(caisseData.fondInitial, "FC")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Transactions:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                {transactions.length}
              </Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => setCurrentView("transaction")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="cash-register" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.primary, fontFamily: "Poppins-Medium" }]}>
                Nouvelle transaction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]}
              onPress={() => setCurrentView("report")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="file-document" size={32} color={theme.colors.secondary} />
              <Text style={[styles.actionText, { color: theme.colors.secondary, fontFamily: "Poppins-Medium" }]}>
                Voir transactions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.tertiaryContainer }]}
              onPress={() => generateReport(caisseData, transactions, devises)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="printer" size={32} color={theme.colors.tertiary} />
              <Text style={[styles.actionText, { color: theme.colors.tertiary, fontFamily: "Poppins-Medium" }]}>
                Imprimer rapport
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.errorContainer }]}
              onPress={() =>
                Alert.alert("Fermeture de caisse", "Êtes-vous sûr de vouloir fermer la caisse ?", [
                  { text: "Annuler", style: "cancel" },
                  { text: "Confirmer", onPress: fermerCaisse },
                ])
              }
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={32} color={theme.colors.error} />
              <Text style={[styles.actionText, { color: theme.colors.error, fontFamily: "Poppins-Medium" }]}>
                Fermer la caisse
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 && (
            <View style={styles.recentTransactions}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
                Transactions récentes
              </Text>
              {transactions
                .slice()
                .reverse()
                .slice(0, 3)
                .map((transaction, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.transactionItem, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => printTicket(transaction, devises)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionTypeContainer}>
                        <MaterialCommunityIcons
                          name={transaction.type === "achat" ? "cash-plus" : "cash-minus"}
                          size={20}
                          color={transaction.type === "achat" ? "#4CAF50" : "#2196F3"}
                        />
                        <Text
                          style={[
                            styles.transactionType,
                            {
                              color: transaction.type === "achat" ? "#4CAF50" : "#2196F3",
                              fontFamily: "Poppins-Medium",
                            },
                          ]}
                        >
                          {transaction.type === "achat" ? "Achat" : "Vente"} {transaction.devise}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionTime,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        {format(new Date(transaction.timestamp), "HH:mm")}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text
                        style={[styles.transactionAmount, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}
                      >
                        {formatCurrency(transaction.montantDevise, transaction.devise, devises)} ⟷{" "}
                        {formatCurrency(transaction.montantLocal, "FC")}
                      </Text>
                      <Text
                        style={[
                          styles.transactionClient,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        {transaction.nomClient}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              {transactions.length > 3 && (
                <Button
                  mode="text"
                  onPress={() => setCurrentView("report")}
                  style={styles.viewAllButton}
                  labelStyle={{ fontFamily: "Poppins-Medium" }}
                >
                  Voir toutes les transactions
                </Button>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="cash-register"
            size={64}
            color={theme.colors.primary}
            style={styles.emptyStateIcon}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
            Aucune caisse ouverte
          </Text>
          <Text
            style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
          >
            Veuillez ouvrir une caisse pour commencer les opérations
          </Text>
          <Button
            mode="contained"
            icon="login"
            onPress={() => setCurrentView("openCaisse")}
            style={[styles.openCaisseButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ fontFamily: "Poppins-Medium" }}
          >
            Ouvrir la caisse
          </Button>
        </View>
      )}
    </Animated.View>
  )

  const renderOpenCaisse = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        {
          backgroundColor: theme.colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard} style={styles.fullWidth}>
          <View style={styles.openCaisseContainer}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
              Ouverture de caisse
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
              Date: {format(new Date(), "dd MMMM yyyy", { locale: fr })}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                Fond initial (FC)
              </Text>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={fondInitial}
                onChangeText={setFondInitial}
                style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                theme={{ colors: { text: theme.colors.text } }}
                right={<TextInput.Affix text="FC" textStyle={{ color: theme.colors.textSecondary }} />}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setCurrentView("home")}
                style={[styles.button, { borderColor: theme.colors.outline }]}
                textColor={theme.colors.text}
                labelStyle={{ fontFamily: "Poppins-Medium" }}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={ouvrirCaisse}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ fontFamily: "Poppins-Medium" }}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  )

  const renderTransaction = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        {
          backgroundColor: theme.colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.transactionButtonRow}>
        <TouchableOpacity
          style={[
            styles.transactionTypeButton,
            {
              backgroundColor: "#4CAF50",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
          onPress={() => {
            setTransactionType("achat")
            setModalVisible(true)
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cash-plus" size={32} color="#fff" />
          <Text style={[styles.transactionTypeText, { color: "#fff", fontFamily: "Poppins-SemiBold" }]}>
            Achat devise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.transactionTypeButton,
            {
              backgroundColor: "#2196F3",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
          onPress={() => {
            setTransactionType("vente")
            setModalVisible(true)
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cash-minus" size={32} color="#fff" />
          <Text style={[styles.transactionTypeText, { color: "#fff", fontFamily: "Poppins-SemiBold" }]}>
            Vente devise
          </Text>
        </TouchableOpacity>
      </View>

      {transactions.length > 0 && (
        <View style={styles.transactionList}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Rechercher une transaction..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
              iconColor={theme.colors.primary}
              inputStyle={{ color: theme.colors.text, fontFamily: "Poppins-Regular" }}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
            Transactions ({filteredTransactions.length})
          </Text>

          <ScrollView style={{ maxHeight: 400 }}>
            {filteredTransactions
              .slice()
              .reverse()
              .map((transaction, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.transactionItem, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={() => printTicket(transaction, devises)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionTypeContainer}>
                      <MaterialCommunityIcons
                        name={transaction.type === "achat" ? "cash-plus" : "cash-minus"}
                        size={20}
                        color={transaction.type === "achat" ? "#4CAF50" : "#2196F3"}
                      />
                      <Text
                        style={[
                          styles.transactionType,
                          {
                            color: transaction.type === "achat" ? "#4CAF50" : "#2196F3",
                            fontFamily: "Poppins-Medium",
                          },
                        ]}
                      >
                        {transaction.type === "achat" ? "Achat" : "Vente"} {transaction.devise}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionTime,
                        { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                      ]}
                    >
                      {format(new Date(transaction.timestamp), "HH:mm")}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text
                      style={[styles.transactionAmount, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}
                    >
                      {formatCurrency(transaction.montantDevise, transaction.devise, devises)} ⟷{" "}
                      {formatCurrency(transaction.montantLocal, "FC")}
                    </Text>
                    <Text
                      style={[
                        styles.transactionClient,
                        { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                      ]}
                    >
                      {transaction.nomClient}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <TouchableOpacity
                      style={[styles.transactionActionButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => printTicket(transaction, devises)}
                    >
                      <Ionicons name="print-outline" size={16} color="#fff" />
                      <Text style={[styles.transactionActionText, { color: "#fff", fontFamily: "Poppins-Medium" }]}>
                        Imprimer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={Platform.OS === "ios" ? 10 : 20} style={styles.modalBlur}>
          <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
                  {transactionType === "achat" ? "Achat de devise" : "Vente de devise"}
                </Text>
                <IconButton icon="close" size={24} color={theme.colors.text} onPress={() => setModalVisible(false)} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard} style={styles.fullWidth}>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Devise
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviseScroll}>
                      <View style={styles.deviseContainer}>
                        {devises.map((d) => (
                          <TouchableOpacity
                            key={d.code}
                            style={[
                              styles.deviseButton,
                              {
                                backgroundColor:
                                  devise === d.code ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                                borderColor: devise === d.code ? theme.colors.primary : theme.colors.outline,
                              },
                            ]}
                            onPress={() => setDevise(d.code)}
                          >
                            <Text
                              style={[
                                styles.deviseCode,
                                {
                                  color: devise === d.code ? theme.colors.primary : theme.colors.text,
                                  fontFamily: "Poppins-SemiBold",
                                },
                              ]}
                            >
                              {d.code}
                            </Text>
                            <Text
                              style={[
                                styles.deviseName,
                                {
                                  color: devise === d.code ? theme.colors.primary : theme.colors.textSecondary,
                                  fontFamily: "Poppins-Regular",
                                },
                              ]}
                            >
                              {d.nom}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Montant en {devise}
                    </Text>
                    <TextInput
                      mode="outlined"
                      keyboardType="numeric"
                      value={montant}
                      onChangeText={setMontant}
                      style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      theme={{ colors: { text: theme.colors.text } }}
                      right={
                        <TextInput.Affix
                          text={devises.find((d) => d.code === devise)?.symbol || devise}
                          textStyle={{ color: theme.colors.textSecondary }}
                        />
                      }
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Taux</Text>
                    <View style={[styles.tauxContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[styles.tauxText, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                        {transactionType === "achat"
                          ? devises.find((d) => d.code === devise)?.tauxAchat
                          : devises.find((d) => d.code === devise)?.tauxVente}{" "}
                        FC
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Montant en FC
                    </Text>
                    <View style={[styles.tauxContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[styles.tauxText, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                        {montant && !isNaN(Number.parseFloat(montant))
                          ? formatCurrency(
                              Number.parseFloat(montant) *
                                (transactionType === "achat"
                                  ? devises.find((d) => d.code === devise)?.tauxAchat
                                  : devises.find((d) => d.code === devise)?.tauxVente),
                              "FC",
                            )
                          : formatCurrency(0, "FC")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Nom du client
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={nomClient}
                      onChangeText={setNomClient}
                      style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      theme={{ colors: { text: theme.colors.text } }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Numéro de téléphone (optionnel)
                    </Text>
                    <TextInput
                      mode="outlined"
                      keyboardType="phone-pad"
                      value={numeroClient}
                      onChangeText={setNumeroClient}
                      style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                      theme={{ colors: { text: theme.colors.text } }}
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={[styles.button, { borderColor: theme.colors.outline }]}
                      textColor={theme.colors.text}
                      labelStyle={{ fontFamily: "Poppins-Medium" }}
                    >
                      Annuler
                    </Button>
                    <Button
                      mode="contained"
                      onPress={ajouterTransaction}
                      style={[styles.button, { backgroundColor: theme.colors.primary }]}
                      labelStyle={{ fontFamily: "Poppins-Medium" }}
                    >
                      Confirmer
                    </Button>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </BlurView>
      </Modal>
    </Animated.View>
  )

  const renderReport = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        {
          backgroundColor: theme.colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
          Rapport des transactions
        </Text>
        <Button
          mode="contained"
          icon="printer"
          onPress={() => generateReport(caisseData, transactions, devises)}
          style={[styles.printReportButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontFamily: "Poppins-Medium" }}
        >
          Imprimer rapport
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher une transaction..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.text, fontFamily: "Poppins-Regular" }}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      {filteredTransactions.length > 0 ? (
        <ScrollView style={styles.reportList}>
          {filteredTransactions
            .slice()
            .reverse()
            .map((transaction, index) => (
              <View key={index} style={[styles.reportItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeContainer}>
                    <MaterialCommunityIcons
                      name={transaction.type === "achat" ? "cash-plus" : "cash-minus"}
                      size={20}
                      color={transaction.type === "achat" ? "#4CAF50" : "#2196F3"}
                    />
                    <Text
                      style={[
                        styles.reportType,
                        {
                          color: transaction.type === "achat" ? "#4CAF50" : "#2196F3",
                          fontFamily: "Poppins-Medium",
                        },
                      ]}
                    >
                      {transaction.type === "achat" ? "Achat" : "Vente"} {transaction.devise}
                    </Text>
                  </View>
                  <Text
                    style={[styles.reportTime, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
                  >
                    {format(new Date(transaction.timestamp), "HH:mm")}
                  </Text>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={[styles.reportAmount, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                    {formatCurrency(transaction.montantDevise, transaction.devise, devises)} ⟷{" "}
                    {formatCurrency(transaction.montantLocal, "FC")}
                  </Text>
                  <Text
                    style={[styles.reportClient, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
                  >
                    {transaction.nomClient} {transaction.numeroClient ? `(${transaction.numeroClient})` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.printButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => printTicket(transaction, devises)}
                >
                  <Ionicons name="print-outline" size={16} color="#fff" />
                  <Text style={[styles.printButtonText, { color: "#fff", fontFamily: "Poppins-Medium" }]}>
                    Imprimer
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="file-search"
            size={64}
            color={theme.colors.primary}
            style={styles.emptyStateIcon}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
            Aucune transaction trouvée
          </Text>
          <Text
            style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
          >
            {searchQuery ? "Essayez une autre recherche" : "Aucune transaction pour aujourd'hui"}
          </Text>
        </View>
      )}
    </Animated.View>
  )

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard} style={styles.container}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          {renderHeader()}

          {currentView === "home" && renderHome()}
          {currentView === "openCaisse" && renderOpenCaisse()}
          {currentView === "transaction" && renderTransaction()}
          {currentView === "report" && renderReport()}
          {currentView === "settings" && (
            <SettingsScreen
              theme={theme}
              devises={devises}
              addCurrency={addCurrency}
              updateCurrency={updateCurrency}
              deleteCurrency={deleteCurrency}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              scaleAnim={scaleAnim}
            />
          )}
          {currentView === "dashboard" && (
            <DashboardScreen
              theme={theme}
              transactions={transactions}
              caisseData={caisseData}
              devises={devises}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              scaleAnim={scaleAnim}
            />
          )}
        </TouchableOpacity>
      </ThemeProvider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  recentTransactions: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  transactionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionType: {
    marginLeft: 4,
    fontSize: 14,
  },
  transactionTime: {
    fontSize: 12,
  },
  transactionDetails: {
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 16,
    marginBottom: 2,
  },
  transactionClient: {
    fontSize: 12,
  },
  transactionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  transactionActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  transactionActionText: {
    marginLeft: 4,
    fontSize: 12,
  },
  viewAllButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  openCaisseButton: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fullWidth: {
    width: "100%",
  },
  openCaisseContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  transactionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  transactionTypeButton: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionTypeText: {
    marginTop: 8,
    fontSize: 16,
  },
  transactionList: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchbar: {
    borderRadius: 8,
  },
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 12,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalScrollContent: {
    padding: 16,
  },
  deviseScroll: {
    marginBottom: 8,
  },
  deviseContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  deviseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  deviseCode: {
    fontSize: 16,
    marginBottom: 2,
  },
  deviseName: {
    fontSize: 12,
  },
  tauxContainer: {
    padding: 16,
    borderRadius: 4,
  },
  tauxText: {
    fontSize: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 20,
  },
  printReportButton: {
    borderRadius: 4,
  },
  reportList: {
    flex: 1,
  },
  reportItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportType: {
    marginLeft: 4,
    fontSize: 14,
  },
  reportTime: {
    fontSize: 12,
  },
  reportDetails: {
    marginVertical: 8,
  },
  reportAmount: {
    fontSize: 16,
    marginBottom: 4,
  },
  reportClient: {
    fontSize: 12,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  printButtonText: {
    marginLeft: 4,
    fontSize: 12,
  },
})
