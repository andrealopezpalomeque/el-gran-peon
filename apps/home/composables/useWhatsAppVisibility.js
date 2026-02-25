export const useWhatsAppVisibility = () => {
  const hidden = useState('whatsapp-hidden', () => false)
  return { hidden }
}
