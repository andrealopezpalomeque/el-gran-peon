import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { formatPrice } from '~/utils/format'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // Load cart from localStorage on init
  const loadCart = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('elgranpeon-cart')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Backward compat: ensure all items have customizationKey
          items.value = parsed.map(item => ({
            ...item,
            customizationKey: item.customizationKey || '',
            customizations: item.customizations || null,
            customizationsExtra: item.customizationsExtra || 0,
            basePrice: item.basePrice || item.unitPrice,
          }))
        } catch {
          items.value = []
        }
      }
    }
  }

  // Save to localStorage
  const saveCart = () => {
    if (import.meta.client) {
      localStorage.setItem('elgranpeon-cart', JSON.stringify(items.value))
    }
  }

  // Build a customizationKey from selected customizations for uniqueness
  const buildCustomizationKey = (selectedCustomizations) => {
    if (!selectedCustomizations || Object.keys(selectedCustomizations).length === 0) return ''
    // Sort keys for consistent hashing, include text/logoUrl for grabado uniqueness
    const sorted = Object.keys(selectedCustomizations).sort().reduce((acc, key) => {
      const c = selectedCustomizations[key]
      acc[key] = c.value + (c.text || '') + (c.logoUrl || '')
      return acc
    }, {})
    return JSON.stringify(sorted)
  }

  // Calculate extra price from selected customizations
  const calcCustomizationsExtra = (selectedCustomizations) => {
    if (!selectedCustomizations) return 0
    return Object.values(selectedCustomizations).reduce((sum, c) => sum + (c.extraPrice || 0), 0)
  }

  // Add product to cart
  const addProduct = (product, quantity = 1, selectedCustomizations = null) => {
    const customizationKey = buildCustomizationKey(selectedCustomizations)
    const customizationsExtra = calcCustomizationsExtra(selectedCustomizations)
    const basePrice = product.price
    const unitPrice = basePrice + customizationsExtra

    const existingItem = items.value.find(
      item => item.productId === product.id && item.customizationKey === customizationKey
    )

    const stock = product.stock ?? Infinity

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, stock)
      existingItem.stock = stock
    } else {
      items.value.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        basePrice,
        unitPrice,
        quantity: Math.min(quantity, stock),
        image: product.images?.[0]?.url || null,
        categoryName: product.categoryName,
        freeShipping: product.freeShipping || false,
        stock: stock,
        customizations: selectedCustomizations || null,
        customizationsExtra,
        customizationKey,
      })
    }

    saveCart()
  }

  // Update quantity
  const updateQuantity = (productId, quantity, customizationKey = '') => {
    const item = items.value.find(
      item => item.productId === productId && (item.customizationKey || '') === customizationKey
    )
    if (item) {
      if (quantity <= 0) {
        removeProduct(productId, customizationKey)
      } else {
        const max = item.stock ?? Infinity
        item.quantity = Math.min(quantity, max)
        saveCart()
      }
    }
  }

  // Remove product
  const removeProduct = (productId, customizationKey = '') => {
    items.value = items.value.filter(
      item => !(item.productId === productId && (item.customizationKey || '') === customizationKey)
    )
    saveCart()
  }

  // Get total quantity in cart for a given productId (across all customization variants)
  const getProductTotalQuantity = (productId) => {
    return items.value
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  // Clear cart
  const clearCart = () => {
    items.value = []
    saveCart()
  }

  // Computed values
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
  })

  // WhatsApp message generation
  const generateWhatsAppMessage = (orderData) => {
    let message = `*NUEVO PEDIDO - El Gran Peon*\n\n`

    message += `*Cliente:*\n`
    message += `${orderData.customer.name}\n`
    message += `Tel: ${orderData.customer.phone}\n`
    message += `Email: ${orderData.customer.email}\n\n`

    message += `*Direccion:*\n`
    message += `${orderData.customer.address}\n`
    message += `${orderData.customer.city}, ${orderData.customer.province}\n`
    if (orderData.customer.zipCode) {
      message += `CP: ${orderData.customer.zipCode}\n`
    }
    message += `\n`

    message += `*Productos:*\n`
    items.value.forEach((item, index) => {
      message += `${index + 1}. ${item.productName}\n`
      if (item.customizations) {
        Object.values(item.customizations).forEach(c => {
          message += `   ${c.label}: ${c.value}`
          if (c.text) message += ` — "${c.text}"`
          if (c.logoUrl) message += ` (logo adjunto)`
          if (c.extraPrice > 0) message += ` (+${formatPrice(c.extraPrice)})`
          message += `\n`
        })
      }
      message += `   Cantidad: ${item.quantity}\n`
      message += `   Precio unitario: ${formatPrice(item.unitPrice)}\n`
      message += `   Subtotal: ${formatPrice(item.unitPrice * item.quantity)}\n`
      if (item.freeShipping) {
        message += `   ✓ Envio gratis\n`
      }
      message += `\n`
    })

    message += `*Subtotal: ${formatPrice(subtotal.value)}*\n`

    if (orderData.promoCode) {
      message += `*Codigo promo (${orderData.promoCode.code} - ${orderData.promoCode.discountPercent}%): -${formatPrice(orderData.promoDiscountAmount)}*\n`
    }

    if (orderData.paymentDiscountAmount > 0) {
      message += `*Descuento 10% (transferencia/efectivo): -${formatPrice(orderData.paymentDiscountAmount)}*\n`
    }

    if (orderData.promoCode || orderData.paymentDiscountAmount > 0) {
      message += `*Total: ${formatPrice(orderData.adjustedAmount)}*\n\n`
    } else {
      message += `\n`
    }

    message += `*Metodo de pago preferido:* ${orderData.paymentMethod}\n\n`

    if (orderData.customer.notes) {
      message += `*Notas adicionales:*\n${orderData.customer.notes}\n\n`
    }

    message += `Esperamos tu confirmacion para proceder con el pedido.`

    return message
  }

  const generateWhatsAppUrl = (orderData) => {
    const message = generateWhatsAppMessage(orderData)
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/543794007759?text=${encodedMessage}`
  }

  return {
    items,
    itemCount,
    subtotal,
    loadCart,
    addProduct,
    updateQuantity,
    removeProduct,
    getProductTotalQuantity,
    clearCart,
    generateWhatsAppUrl,
  }
})
