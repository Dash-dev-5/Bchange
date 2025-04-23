// Fonction pour formater les montants avec le symbole de devise
export const formatCurrency = (amount, currencyCode, devises = []) => {
  if (amount === undefined || amount === null) return ""

  // Trouver le symbole de la devise
  let symbol = currencyCode
  if (currencyCode !== "FC") {
    const devise = devises.find((d) => d.code === currencyCode)
    if (devise) {
      symbol = devise.symbol
    }
  }

  // Formater le montant
  const formattedAmount = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Retourner le montant formaté avec le symbole
  return `${formattedAmount} ${symbol}`
}

// Fonction pour calculer le montant en fonction du taux
export const calculateAmount = (montant, taux) => {
  if (!montant || isNaN(Number.parseFloat(montant)) || !taux || isNaN(Number.parseFloat(taux))) {
    return 0
  }

  return Number.parseFloat(montant) * Number.parseFloat(taux)
}
