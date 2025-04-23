import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Text, Searchbar } from "react-native-paper"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { formatCurrency } from "../utils/currency"

export const TransactionList = ({ transactions, searchQuery, onSearchChange, onPrintTicket, theme, devises }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher une transaction..."
          onChangeText={onSearchChange}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.text, fontFamily: "Poppins-Regular" }}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
        Transactions ({transactions.length})
      </Text>

      {transactions.length > 0 ? (
        <ScrollView style={styles.transactionList}>
          {transactions
            .slice()
            .reverse()
            .map((transaction, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.transactionItem, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => onPrintTicket(transaction)}
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
                  <Text style={[styles.transactionAmount, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                    {formatCurrency(transaction.montantDevise, transaction.devise, devises)} ⟷{" "}
                    {formatCurrency(transaction.montantLocal, "FC")}
                  </Text>
                  <Text
                    style={[
                      styles.transactionClient,
                      { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                    ]}
                  >
                    {transaction.nomClient} {transaction.numeroClient ? `(${transaction.numeroClient})` : ""}
                  </Text>
                </View>
                <View style={styles.transactionActions}>
                  <TouchableOpacity
                    style={[styles.transactionActionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => onPrintTicket(transaction)}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchbar: {
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  transactionList: {
    flex: 1,
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
