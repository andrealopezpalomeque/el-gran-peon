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
          items.value = JSON.parse(saved)
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

  // Add product to cart
  const addProduct = (product, quantity = 1) => {
    const existingItem = items.value.find(item => item.productId === product.id)

    const stock = product.stock ?? Infinity

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, stock)
      existingItem.stock = stock
    } else {
      items.value.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.price,
        quantity: Math.min(quantity, stock),
        image: product.images?.[0]?.url || null,
        categoryName: product.categoryName,
        freeShipping: product.freeShipping || false,
        stock: stock,
      })
    }

    saveCart()
  }

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(item => item.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeProduct(productId)
      } else {
        const max = item.stock ?? Infinity
        item.quantity = Math.min(quantity, max)
        saveCart()
      }
    }
  }

  // Remove product
  const removeProduct = (productId) => {
    items.value = items.value.filter(item => item.productId !== productId)
    saveCart()
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
      message += `   Cantidad: ${item.quantity}\n`
      message += `   Precio unitario: ${formatPrice(item.unitPrice)}\n`
      message += `   Subtotal: ${formatPrice(item.unitPrice * item.quantity)}\n`
      if (item.freeShipping) {
        message += `   ✓ Envio gratis\n`
      }
      message += `\n`
    })

    message += `*Subtotal: ${formatPrice(subtotal.value)}*\n`

    if (orderData.discountAmount > 0) {
      message += `*Descuento 10% (transferencia/efectivo): -${formatPrice(orderData.discountAmount)}*\n`
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
    clearCart,
    generateWhatsAppUrl,
  }
})
