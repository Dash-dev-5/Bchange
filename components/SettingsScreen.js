"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native"
import { Text, Switch, Divider, Button, Card } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { CurrencyManager } from "./CurrencyManager"

export const SettingsScreen = ({
  theme,
  devises,
  addCurrency,
  updateCurrency,
  deleteCurrency,
  toggleTheme,
  isDarkMode,
  fadeAnim,
  slideAnim,
  scaleAnim,
}) => {
  const [activeTab, setActiveTab] = useState("general")

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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "general" && [styles.activeTab, { borderColor: theme.colors.primary }]]}
          onPress={() => setActiveTab("general")}
        >
          <MaterialCommunityIcons
            name="cog"
            size={20}
            color={activeTab === "general" ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "general" ? theme.colors.primary : theme.colors.textSecondary,
                fontFamily: "Poppins-Medium",
              },
            ]}
          >
            Général
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "currencies" && [styles.activeTab, { borderColor: theme.colors.primary }]]}
          onPress={() => setActiveTab("currencies")}
        >
          <MaterialCommunityIcons
            name="currency-usd"
            size={20}
            color={activeTab === "currencies" ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "currencies" ? theme.colors.primary : theme.colors.textSecondary,
                fontFamily: "Poppins-Medium",
              },
            ]}
          >
            Devises
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "about" && [styles.activeTab, { borderColor: theme.colors.primary }]]}
          onPress={() => setActiveTab("about")}
        >
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={activeTab === "about" ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "about" ? theme.colors.primary : theme.colors.textSecondary,
                fontFamily: "Poppins-Medium",
              },
            ]}
          >
            À propos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "general" && (
          <View style={styles.generalSettings}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
              Paramètres généraux
            </Text>

            {/* <Card style={[styles.settingCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Mode sombre
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                      ]}
                    >
                      Activer le mode sombre pour l'application
                    </Text>
                  </View>
                  <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />
                </View>
              </Card.Content>
            </Card> */}

            <Card style={[styles.settingCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Impression automatique
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                      ]}
                    >
                      Imprimer automatiquement les tickets après chaque transaction
                    </Text>
                  </View>
                  <Switch value={false} color={theme.colors.primary} />
                </View>
              </Card.Content>
            </Card>

            <Card style={[styles.settingCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                      Sauvegarde automatique
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" },
                      ]}
                    >
                      Sauvegarder automatiquement les données dans le cloud
                    </Text>
                  </View>
                  <Switch value={true} color={theme.colors.primary} />
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {activeTab === "currencies" && (
          <CurrencyManager
            theme={theme}
            devises={devises}
            addCurrency={addCurrency}
            updateCurrency={updateCurrency}
            deleteCurrency={deleteCurrency}
          />
        )}

        {activeTab === "about" && (
          <View style={styles.aboutSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Poppins-SemiBold" }]}>
              À propos de l'application
            </Text>

            <Card style={[styles.aboutCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <Text style={[styles.appName, { color: theme.colors.primary, fontFamily: "Poppins-Bold" }]}>
                  Bureau de Change
                </Text>
                <Text style={[styles.appVersion, { color: theme.colors.textSecondary, fontFamily: "Poppins-Regular" }]}>
                  Version 1.0.0
                </Text>

                <Divider style={styles.divider} />

                <Text style={[styles.aboutText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                  Application de gestion de bureau de change conçue pour les opérations quotidiennes d'achat et de vente
                  de devises.
                </Text>

                <Text
                  style={[styles.aboutText, { color: theme.colors.text, fontFamily: "Poppins-Regular", marginTop: 10 }]}
                >
                  Cette application permet de gérer les transactions, imprimer des tickets, générer des rapports et
                  suivre les taux de change pour différentes devises.
                </Text>

                <View style={styles.featureList}>
                  <Text style={[styles.featureTitle, { color: theme.colors.text, fontFamily: "Poppins-Medium" }]}>
                    Fonctionnalités principales:
                  </Text>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                      Gestion des transactions d'achat et de vente
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                      Impression de tickets et de rapports
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                      Gestion des taux de change
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                      Suivi des opérations de caisse
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: "Poppins-Regular" }]}>
                      Tableau de bord et statistiques
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              icon="email"
              style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ fontFamily: "Poppins-Medium" }}
            >
              Contacter le support
            </Button>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  generalSettings: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  aboutSection: {
    padding: 8,
  },
  aboutCard: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  divider: {
    marginVertical: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    marginTop: 16,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  contactButton: {
    marginTop: 8,
  },
})
