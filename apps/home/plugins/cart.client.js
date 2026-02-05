export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  cart.loadCart()
})
