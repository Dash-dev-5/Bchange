import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { formatCurrency } from "./currency"
import { Alert } from "react-native"

export const printTicket = async (transaction, devises) => {
  try {
    const deviseInfo = devises.find((d) => d.code === transaction.devise) || { symbol: transaction.devise }

    const html = `<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: monospace;
        font-size: 14px;
        margin: 0;
        padding: 0;
        width: 100%;
        max-width: 320px;
      }
      .header,
      .footer,
      .qr-placeholder {
        text-align: center;
      }
      .title {
        font-size: 16px;
        font-weight: bold;
      }
      .subtitle {
        font-size: 14px;
      }
      .info,
      .transaction {
        margin: 8px 0;
        padding: 0 8px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 3px;
      }
      .label {
        font-weight: bold;
      }
      .transaction-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        border-bottom: 1px dashed #000;
        margin-bottom: 5px;
        font-size: 14px;
      }
      .transaction-details {
        font-size: 13px;
      }
      .amount {
        font-weight: bold;
        font-size: 15px;
        margin-top: 4px;
      }
      .rate {
        font-size: 12px;
        color: #000;
      }
      .footer {
        border-top: 1px dashed #000;
        font-size: 12px;
        padding-top: 5px;
        margin-top: 10px;
      }
      .qr-placeholder {
        font-size: 10px;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">BUREAU DE CHANGE</div>
      <div class="subtitle">Ticket de transaction</div>
      <div class="subtitle">N° ${transaction.id.substring(0, 8).toUpperCase()}</div>
    </div>

    <div class="info">
      <div class="info-row">
        <span class="label">Date:</span>
        <span class="value">${format(new Date(transaction.timestamp), "dd MMM yyyy", { locale: fr })}</span>
      </div>
      <div class="info-row">
        <span class="label">Heure:</span>
        <span class="value">${format(new Date(transaction.timestamp), "HH:mm:ss")}</span>
      </div>
      <div class="info-row">
        <span class="label">Client:</span>
        <span class="value">${transaction.nomClient}</span>
      </div>
      ${
        transaction.numeroClient
          ? `<div class="info-row">
               <span class="label">Téléphone:</span>
               <span class="value">${transaction.numeroClient}</span>
             </div>`
          : ""
      }
    </div>

    <div class="transaction">
      <div class="transaction-header">
        <span>${transaction.type === "achat" ? "ACHAT" : "VENTE"}</span>
        <span>${transaction.devise}</span>
      </div>
      <div class="transaction-details">
        <div class="amount">
          ${formatCurrency(transaction.montantDevise, transaction.devise, devises)} = ${formatCurrency(transaction.montantLocal, "FC")}
        </div>
        <div class="rate">
          Taux: 1 ${transaction.devise} = ${transaction.taux.toFixed(2)} FC
        </div>
      </div>
    </div>

    <div class="qr-placeholder">[Code QR de vérification]</div>

    <div class="footer">
      <p>Merci pour votre confiance!</p>
      <p>Ce ticket fait office de reçu.</p>
      <p>Bureau de Change - Tél: +243 XXXXXXXXX</p>
    </div>
  </body>
</html>

`  

    const { uri } = await Print.printToFileAsync({ html })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" })
    } else {
      Alert.alert("Info", "L'impression est disponible uniquement sur l'appareil physique")
    }
  } catch (error) {
    console.error("Erreur lors de l'impression du ticket:", error)
    Alert.alert("Erreur", "Impossible d'imprimer le ticket")
  }
}

export const generateReport = async (caisseData, transactions, devises) => {
  try {
    if (!caisseData) {
      Alert.alert("Erreur", "Aucune caisse ouverte")
      return
    }

    // Calculer les totaux
    let totalAchats = 0
    let totalVentes = 0
    const devisesStats = {}

    transactions.forEach((transaction) => {
      if (transaction.type === "achat") {
        totalAchats += transaction.montantLocal
      } else {
        totalVentes += transaction.montantLocal
      }

      // Statistiques par devise
      if (!devisesStats[transaction.devise]) {
        devisesStats[transaction.devise] = {
          achats: { count: 0, montantDevise: 0, montantLocal: 0 },
          ventes: { count: 0, montantDevise: 0, montantLocal: 0 },
        }
      }

      if (transaction.type === "achat") {
        devisesStats[transaction.devise].achats.count++
        devisesStats[transaction.devise].achats.montantDevise += transaction.montantDevise
        devisesStats[transaction.devise].achats.montantLocal += transaction.montantLocal
      } else {
        devisesStats[transaction.devise].ventes.count++
        devisesStats[transaction.devise].ventes.montantDevise += transaction.montantDevise
        devisesStats[transaction.devise].ventes.montantLocal += transaction.montantLocal
      }
    })

    const soldeTheoriqueFinal = Number.parseFloat(caisseData.fondInitial) + totalVentes - totalAchats

    // Générer le HTML des statistiques par devise
    let devisesHtml = ""
    Object.keys(devisesStats).forEach((code) => {
      const stats = devisesStats[code]
      const deviseInfo = devises.find((d) => d.code === code) || { symbol: code }

      devisesHtml += `
        <tr>
          <td rowspan="2">${code} (${deviseInfo.symbol})</td>
          <td>Achats</td>
          <td>${stats.achats.count}</td>
          <td>${formatCurrency(stats.achats.montantDevise, code, devises)}</td>
          <td>${formatCurrency(stats.achats.montantLocal, "FC")}</td>
        </tr>
        <tr>
          <td>Ventes</td>
          <td>${stats.ventes.count}</td>
          <td>${formatCurrency(stats.ventes.montantDevise, code, devises)}</td>
          <td>${formatCurrency(stats.ventes.montantLocal, "FC")}</td>
        </tr>
      `
    })

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica'; 
              padding: 20px; 
              max-width: 800px; 
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .subtitle { 
              font-size: 16px; 
              margin-bottom: 15px;
            }
            .info { 
              margin-bottom: 20px; 
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              max-width: 300px;
            }
            .label { 
              font-weight: bold; 
            }
            .section { 
              margin-top: 20px; 
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
            }
            .summary { 
              margin-top: 20px; 
              border-top: 1px solid #ddd; 
              padding-top: 10px; 
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              max-width: 400px;
            }
            .summary-label {
              font-weight: bold;
            }
            .summary-value {
              font-weight: bold;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 12px; 
              border-top: 1px dashed #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">RAPPORT DE CAISSE</div>
            <div class="subtitle">Date: ${format(new Date(caisseData.date), "dd MMMM yyyy", { locale: fr })}</div>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="label">Ouverture:</span>
              <span>${format(new Date(caisseData.timestamp), "HH:mm:ss")}</span>
            </div>
            <div class="info-row">
              <span class="label">Fermeture:</span>
              <span>${format(new Date(), "HH:mm:ss")}</span>
            </div>
            <div class="info-row">
              <span class="label">Fond initial:</span>
              <span>${formatCurrency(caisseData.fondInitial, "FC")}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Résumé des transactions</div>
            <table>
              <tr>
                <th>Type</th>
                <th>Nombre</th>
                <th>Montant total (FC)</th>
              </tr>
              <tr>
                <td>Achats</td>
                <td>${transactions.filter((t) => t.type === "achat").length}</td>
                <td>${formatCurrency(totalAchats, "FC")}</td>
              </tr>
              <tr>
                <td>Ventes</td>
                <td>${transactions.filter((t) => t.type === "vente").length}</td>
                <td>${formatCurrency(totalVentes, "FC")}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${transactions.length}</strong></td>
                <td><strong>${formatCurrency(totalVentes - totalAchats, "FC")}</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Détail par devise</div>
            <table>
              <tr>
                <th>Devise</th>
                <th>Type</th>
                <th>Nombre</th>
                <th>Montant devise</th>
                <th>Montant FC</th>
              </tr>
              ${devisesHtml}
            </table>
          </div>
          
          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Fond initial:</span>
              <span class="summary-value">${formatCurrency(caisseData.fondInitial, "FC")}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total des ventes:</span>
              <span class="summary-value">${formatCurrency(totalVentes, "FC")}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total des achats:</span>
              <span class="summary-value">${formatCurrency(totalAchats, "FC")}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Solde théorique final:</span>
              <span class="summary-value">${formatCurrency(soldeTheoriqueFinal, "FC")}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Rapport généré le ${format(new Date(), "dd/MM/yyyy à HH:mm:ss", { locale: fr })}</p>
            <p>Bureau de Change - Tél: +243 XXXXXXXXX</p>
          </div>
        </body>
      </html>
    `

    const { uri } = await Print.printToFileAsync({ html })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" })
    } else {
      Alert.alert("Info", "L'impression est disponible uniquement sur l'appareil physique")
    }
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error)
    Alert.alert("Erreur", "Impossible de générer le rapport")
  }
}
