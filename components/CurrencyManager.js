"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { Text, TextInput, Button, IconButton, Card } from "react-native-paper"

export const CurrencyManager = ({ theme, devises, addCurrency, updateCurrency, deleteCurrency }) => {
  const [newCurrency, setNewCurrency] = useState({
    code: "",
    nom: "",
    tauxAchat: "",
    tauxVente: "",
    symbol: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState(null)

  const handleAddCurrency = () => {
    if (
      !newCurrency.code ||
      !newCurrency.nom ||
      !newCurrency.tauxAchat ||
      !newCurrency.tauxVente ||
      !newCurrency.symbol
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }

    const currency = {
      ...newCurrency,
      tauxAchat: Number.parseFloat(newCurrency.tauxAchat),
      tauxVente: Number.parseFloat(newCurrency.tauxVente),
    }

    addCurrency(currency)
    setNewCurrency({
      code: "",
      nom: "",
      tauxAchat: "",
      tauxVente: "",
      symbol: "",
    })
  }

  const handleEditCurrency = (currency) => {
    setEditMode(true)
    setEditingCurrency(currency)
    setNewCurrency({
      code: currency.code,
      nom: currency.nom,
      tauxAchat: currency.tauxAchat.toString(),
      tauxVente: currency.tauxVente.toString(),
      symbol: currency.symbol,
    })
  }

  const handleUpdateCurrency = () => {
    if (!newCurrency.nom || !newCurrency.tauxAchat || !newCurrency.tauxVente || !newCurrency.symbol) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }

    const currency = {
      ...newCurrency,
      tauxAchat: Number.parseFloat(newCurrency.tauxAchat),
      tauxVente: Number.parseFloat(newCurrency.tauxVente),
    }

    updateCurrency(currency)
    setEditMode(false)
    setEditingCurrency(null)
    setNewCurrency({
      code: "",
      nom: "",
      tauxAchat: "",
      tauxVente: "",
      symbol: "",
    })
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditingCurrency(null)
    setNewCurrency({
      code: "",
      nom: "",
      tauxAchat: "",
      tauxVente: "",
      symbol: "",
    })
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>Gestion des devises</Text>

      <Card style={[styles.formCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
          <Text style={[styles.formTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
            {editMode ? "Modifier une devise" : "Ajouter une devise"}
          </Text>

          <View style={styles.formRow}>
            <View style={[styles.formField, { width: editMode ? "100%" : "30%" }]}>
              <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Code</Text>
              <TextInput
                mode="outlined"
                value={newCurrency.code}
                onChangeText={(text) => setNewCurrency({ ...newCurrency, code: text.toUpperCase() })}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={editMode}
                maxLength={3}
              />
            </View>

            <View style={[styles.formField, { width: editMode ? "48%" : "65%" }]}>
              <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Nom</Text>
              <TextInput
                mode="outlined"
                value={newCurrency.nom}
                onChangeText={(text) => setNewCurrency({ ...newCurrency, nom: text })}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
            </View>

            {editMode && (
              <View style={[styles.formField, { width: "48%" }]}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Symbole</Text>
                <TextInput
                  mode="outlined"
                  value={newCurrency.symbol}
                  onChangeText={(text) => setNewCurrency({ ...newCurrency, symbol: text })}
                  style={[styles.input, { backgroundColor: theme.colors.surface }]}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  maxLength={3}
                />
              </View>
            )}
          </View>

          <View style={styles.formRow}>
            {!editMode && (
              <View style={[styles.formField, { width: "30%" }]}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Symbole</Text>
                <TextInput
                  mode="outlined"
                  value={newCurrency.symbol}
                  onChangeText={(text) => setNewCurrency({ ...newCurrency, symbol: text })}
                  style={[styles.input, { backgroundColor: theme.colors.surface }]}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  maxLength={3}
                />
              </View>
            )}

            <View style={[styles.formField, { width: editMode ? "48%" : "33%" }]}>
              <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                Taux d'achat
              </Text>
              <TextInput
                mode="outlined"
                value={newCurrency.tauxAchat}
                onChangeText={(text) => setNewCurrency({ ...newCurrency, tauxAchat: text })}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formField, { width: editMode ? "48%" : "33%" }]}>
              <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                Taux de vente
              </Text>
              <TextInput
                mode="outlined"
                value={newCurrency.tauxVente}
                onChangeText={(text) => setNewCurrency({ ...newCurrency, tauxVente: text })}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            {editMode ? (
              <>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  style={[styles.button, { borderColor: theme.colors.outline }]}
                  textColor={theme.colors.text}
                  labelStyle={{ fontFamily: "Poppins-Medium" }}
                >
                  Annuler
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdateCurrency}
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  labelStyle={{ fontFamily: "Poppins-Medium" }}
                >
                  Mettre à jour
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                onPress={handleAddCurrency}
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ fontFamily: "Poppins-Medium" }}
              >
                Ajouter
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Text style={[styles.listTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold", marginTop: 20 }]}>
        Devises disponibles
      </Text>

      <ScrollView style={styles.currencyList}>
        {devises.map((currency, index) => (
          <Card key={currency.code} style={[styles.currencyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.currencyCardContent}>
              <View style={styles.currencyInfo}>
                <Text style={[styles.currencyCode, { color: theme.colors.primary, fontFamily: "Poppins-Bold" }]}>
                  {currency.code} ({currency.symbol})
                </Text>
                <Text style={[styles.currencyName, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                  {currency.nom}
                </Text>
                <View style={styles.ratesContainer}>
                  <Text
                    style={[styles.rateLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
                  >
                    Achat:{" "}
                    <Text style={{ color: theme.colors.success, fontFamily: "Poppins-Medium" }}>
                      {currency.tauxAchat} FC
                    </Text>
                  </Text>
                  <Text
                    style={[styles.rateLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}
                  >
                    Vente:{" "}
                    <Text style={{ color: theme.colors.info, fontFamily: "Poppins-Medium" }}>
                      {currency.tauxVente} FC
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.currencyActions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  color={theme.colors.primary}
                  onPress={() => handleEditCurrency(currency)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  color={theme.colors.error}
                  onPress={() => deleteCurrency(currency.code)}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  formField: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginLeft: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  listTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  currencyList: {
    flex: 1,
  },
  currencyCard: {
    marginBottom: 8,
  },
  currencyCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  rateLabel: {
    fontSize: 12,
  },
  currencyActions: {
    flexDirection: "row",
  },
})
