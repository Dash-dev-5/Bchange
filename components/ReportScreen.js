"use client"

import React, { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native"
import { Text, Button, Searchbar } from "react-native-paper"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { formatCurrency } from "../utils/currency"

export const ReportScreen = ({
  theme,
  transactions,
  caisseData,
  onPrintTicket,
  onGenerateReport,
  devises,
  fadeAnim,
  slideAnim,
  scaleAnim,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)

  // Filtrer les transactions lors de la recherche
  React.useEffect(() => {
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

  // Calculer les totaux
  const calculateTotals = () => {
    let totalAchats = 0
    let totalVentes = 0

    transactions.forEach((transaction) => {
      if (transaction.type === "achat") {
        totalAchats += transaction.montantLocal
      } else {
        totalVentes += transaction.montantLocal
      }
    })

    return {
      totalAchats,
      totalVentes,
      balance: totalVentes - totalAchats,
    }
  }

  const totals = calculateTotals()

  return (
    <Animated.View
      style={[
        styles.container,
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
          onPress={() => onGenerateReport(caisseData, transactions, devises)}
          style={[styles.printReportButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontFamily: "Poppins-Medium" }}
        >
          Imprimer rapport
        </Button>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
          Résumé de la journée
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
              Transactions
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
              {transactions.length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
              Achats
            </Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50", fontFamily: "Poppins-Medium" }]}>
              {formatCurrency(totals.totalAchats, "FC")}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
              Ventes
            </Text>
            <Text style={[styles.summaryValue, { color: "#2196F3", fontFamily: "Poppins-Medium" }]}>
              {formatCurrency(totals.totalVentes, "FC")}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
              Balance
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: totals.balance >= 0 ? "#4CAF50" : "#F44336",
                  fontFamily: "Poppins-Medium",
                },
              ]}
            >
              {formatCurrency(totals.balance, "FC")}
            </Text>
          </View>
        </View>
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
                  onPress={() => onPrintTicket(transaction, devises)}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchbar: {
    borderRadius: 8,
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
  },
})
