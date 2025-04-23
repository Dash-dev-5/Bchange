"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native"
import { Text, TextInput, Button } from "react-native-paper"
import { BlurView } from "expo-blur"
import { formatCurrency } from "../utils/currency"

export const TransactionForm = ({ visible, onClose, onSubmit, transactionType, devises, theme }) => {
  const [devise, setDevise] = useState("USD")
  const [montant, setMontant] = useState("")
  const [nomClient, setNomClient] = useState("")
  const [numeroClient, setNumeroClient] = useState("")

  const handleSubmit = () => {
    onSubmit({
      type: transactionType,
      devise,
      montant,
      nomClient,
      numeroClient,
    })

    // Réinitialiser le formulaire
    setDevise("USD")
    setMontant("")
    setNomClient("")
    setNumeroClient("")
  }

  const handleCancel = () => {
    // Réinitialiser le formulaire
    setDevise("USD")
    setMontant("")
    setNomClient("")
    setNumeroClient("")
    onClose()
  }

  const calculatedAmount = () => {
    if (montant && !isNaN(Number.parseFloat(montant))) {
      const selectedDevise = devises.find((d) => d.code === devise)
      const taux = transactionType === "achat" ? selectedDevise.tauxAchat : selectedDevise.tauxVente
      return Number.parseFloat(montant) * taux
    }
    return 0
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleCancel}>
      <BlurView intensity={10} style={styles.modalBlur}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
              {transactionType === "achat" ? "Achat de devise" : "Vente de devise"}
            </Text>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>Devise</Text>
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
                    {formatCurrency(calculatedAmount(), "FC")}
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
                  onPress={handleCancel}
                  style={[styles.button, { borderColor: theme.colors.outline }]}
                  textColor={theme.colors.text}
                  labelStyle={{ fontFamily: "Poppins-Medium" }}
                >
                  Annuler
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  labelStyle={{ fontFamily: "Poppins-Medium" }}
                >
                  Confirmer
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 20,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
})
