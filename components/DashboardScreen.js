"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Dimensions, Animated } from "react-native"
import { Text, Card } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { formatCurrency } from "../utils/currency"
import { PieChart } from "react-native-chart-kit"

export const DashboardScreen = ({ theme, transactions, caisseData, devises, fadeAnim, slideAnim, scaleAnim }) => {
  const [chartType, setChartType] = useState("daily")
  const screenWidth = Dimensions.get("window").width - 40

  // Calculer les statistiques
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalAchats: 0,
        totalVentes: 0,
        balance: 0,
        devisesStats: [],
        chartData: {
          labels: [],
          datasets: [{ data: [] }],
        },
        pieData: [],
      }
    }

    let totalAchats = 0
    let totalVentes = 0
    const devisesMap = {}

    // Regrouper par devise
    transactions.forEach((transaction) => {
      if (!devisesMap[transaction.devise]) {
        devisesMap[transaction.devise] = {
          achats: { count: 0, montantDevise: 0, montantLocal: 0 },
          ventes: { count: 0, montantDevise: 0, montantLocal: 0 },
        }
      }

      if (transaction.type === "achat") {
        totalAchats += transaction.montantLocal
        devisesMap[transaction.devise].achats.count++
        devisesMap[transaction.devise].achats.montantDevise += transaction.montantDevise
        devisesMap[transaction.devise].achats.montantLocal += transaction.montantLocal
      } else {
        totalVentes += transaction.montantLocal
        devisesMap[transaction.devise].ventes.count++
        devisesMap[transaction.devise].ventes.montantDevise += transaction.montantDevise
        devisesMap[transaction.devise].ventes.montantLocal += transaction.montantLocal
      }
    })

    // Convertir en tableau pour l'affichage
    const devisesStats = Object.keys(devisesMap).map((code) => ({
      code,
      ...devisesMap[code],
    }))

    // Données pour les graphiques
    const chartData = {
      labels: Object.keys(devisesMap),
      datasets: [
        {
          data: Object.keys(devisesMap).map(
            (code) => devisesMap[code].achats.montantLocal + devisesMap[code].ventes.montantLocal,
          ),
          color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
        },
      ],
    }

    // Données pour le graphique en camembert
    const pieData = Object.keys(devisesMap).map((code, index) => {
      const colors = ["#1E88E5", "#26A69A", "#8E24AA", "#D32F2F", "#FFC107", "#43A047"]
      return {
        name: code,
        value: devisesMap[code].achats.montantLocal + devisesMap[code].ventes.montantLocal,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
        legendFontFamily: "Poppins-Regular",
      }
    })

    return {
      totalTransactions: transactions.length,
      totalAchats,
      totalVentes,
      balance: totalVentes - totalAchats,
      devisesStats,
      chartData,
      pieData,
    }
  }

  const stats = calculateStats()

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary,
    },
  }

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
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>Tableau de bord</Text>

      <ScrollView style={styles.content} scrollEnabled ={true} showsVerticalScrollIndicator={true}>
        <View style={styles.statsCards}>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <MaterialCommunityIcons name="cash-register" size={24} color={theme.colors.primary} />
              <Text style={[styles.statsLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Transactions
              </Text>
              <Text style={[styles.statsValue, { color: theme.colors.text, fontFamily: "Poppins-Bold" }]}>
                {stats.totalTransactions}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Card.Content>
              <MaterialCommunityIcons name="cash-plus" size={24} color="#4CAF50" />
              <Text style={[styles.statsLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Achats
              </Text>
              <Text style={[styles.statsValue, { color: "#4CAF50", fontFamily: "Poppins-Bold" }]}>
                {formatCurrency(stats.totalAchats, "FC")}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Card.Content>
              <MaterialCommunityIcons name="cash-minus" size={24} color="#2196F3" />
              <Text style={[styles.statsLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Ventes
              </Text>
              <Text style={[styles.statsValue, { color: "#2196F3", fontFamily: "Poppins-Bold" }]}>
                {formatCurrency(stats.totalVentes, "FC")}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <MaterialCommunityIcons
                name="scale-balance"
                size={24}
                color={stats.balance >= 0 ? "#4CAF50" : "#F44336"}
              />
              <Text style={[styles.statsLabel, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                Balance
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  { color: stats.balance >= 0 ? "#4CAF50" : "#F44336", fontFamily: "Poppins-Bold" },
                ]}
              >
                {formatCurrency(stats.balance, "FC")}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
              Répartition par devise
            </Text>

            {stats.totalTransactions > 0 ? (
              <View style={styles.chartContainer}>
                <PieChart
                  data={stats.pieData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons
                  name="chart-pie"
                  size={48}
                  color={theme.colors.primary}
                  style={styles.noDataIcon}
                />
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary, fontFamily: "Poppins-Medium" }]}>
                  Aucune donnée disponible
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.deviseStatsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <Text style={[styles.deviseStatsTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
              Statistiques par devise
            </Text>

            {stats.devisesStats.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviseStatsScroll}>
                {stats.devisesStats.map((devise, index) => (
                  <View key={index} style={[styles.deviseStatItem, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.deviseStatCode, { color: theme.colors.primary, fontFamily: "Poppins-Bold" }]}>
                      {devise.code}
                    </Text>

                    <View style={styles.deviseStatRow}>
                      <Text
                        style={[
                          styles.deviseStatLabel,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        Achats:
                      </Text>
                      <Text style={[styles.deviseStatValue, { color: "#4CAF50", fontFamily: "Poppins-Medium" }]}>
                        {devise.achats.count}
                      </Text>
                    </View>

                    <View style={styles.deviseStatRow}>
                      <Text
                        style={[
                          styles.deviseStatLabel,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        Montant:
                      </Text>
                      <Text style={[styles.deviseStatValue, { color: "#4CAF50", fontFamily: "Poppins-Medium" }]}>
                        {formatCurrency(devise.achats.montantLocal, "FC")}
                      </Text>
                    </View>

                    <View style={styles.deviseStatDivider} />

                    <View style={styles.deviseStatRow}>
                      <Text
                        style={[
                          styles.deviseStatLabel,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        Ventes:
                      </Text>
                      <Text style={[styles.deviseStatValue, { color: "#2196F3", fontFamily: "Poppins-Medium" }]}>
                        {devise.ventes.count}
                      </Text>
                    </View>

                    <View style={styles.deviseStatRow}>
                      <Text
                        style={[
                          styles.deviseStatLabel,
                          { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                        ]}
                      >
                        Montant:
                      </Text>
                      <Text style={[styles.deviseStatValue, { color: "#2196F3", fontFamily: "Poppins-Medium" }]}>
                        {formatCurrency(devise.ventes.montantLocal, "FC")}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={48}
                  color={theme.colors.primary}
                  style={styles.noDataIcon}
                />
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary, fontFamily: "Poppins-Medium" }]}>
                  Aucune donnée disponible
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </Animated.View>
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
  content: {
    flex: 1,
  },
  statsCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statsCard: {
    width: "48%",
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  statsValue: {
    fontSize: 18,
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
  },
  chartTypeButtons: {
    marginBottom: 16,
  },
  deviseStatsCard: {
    marginBottom: 16,
  },
  deviseStatsTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  deviseStatsScroll: {
    marginBottom: 8,
  },
  deviseStatItem: {
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    width: 180,
  },
  deviseStatCode: {
    fontSize: 18,
    marginBottom: 8,
  },
  deviseStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  deviseStatLabel: {
    fontSize: 12,
  },
  deviseStatValue: {
    fontSize: 12,
  },
  deviseStatDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noDataIcon: {
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
  },
})
