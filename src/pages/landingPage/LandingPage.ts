import { ref, onMounted, onBeforeUnmount } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { API_URL } from '@/config/environment'
import skinsJson from '@/assets/converted-skins.json'

library.add(faDiscord, faYoutube)

interface ApiTopDeal {
  source: string
  external_id: string
  item_name: string
  item_image_url: string
  item_url: string
  float: number | null
  sale_price: number
  item_price: number
  discount_percentage: number
  timestamp?: string
}

interface TopDeal {
  source: string
  externalId: string
  name: string
  imageUrl: string
  itemUrl: string
  float: number | null
  salePrice: number
  itemPrice: number
  discountPercentage: number
  timestamp: string | null
}

interface TopDealsResponse {
  topDeals: ApiTopDeal[]
}

interface SkinDatasetItem {
  market_hash_name: string
  image_url: string
  phase?: string
}

const getImageLookupName = (itemName: string): string => {
  return itemName
    .trim()
    .replace(/\s*★ StatTrak™$/i, '')
    .replace(/\s*StatTrak™$/i, '')
    .replace(/\s*Souvenir$/i, '')
    .trim()
}

export function initLandingPage() {
  const hero = ref<HTMLElement | null>(null)
  const features = ref<HTMLElement | null>(null)
  const video = ref<HTMLElement | null>(null)
  const testimonials = ref<HTMLElement | null>(null)
  const socials = ref<HTMLElement | null>(null)
  const observers = ref<IntersectionObserver[]>([])
  const topDeals = ref<TopDeal[]>([])

  const formData = ref({
    name: '',
    email: '',
    message: ''
  })

  const skinImageMap = new Map<string, string>(
    (skinsJson as SkinDatasetItem[]).map((skin) => {
      return [getImageLookupName(skin.market_hash_name), skin.image_url]
    })
  )

  const getImageFromDataset = (itemName: string, fallbackImageUrl: string): string => {
    const datasetImage = skinImageMap.get(getImageLookupName(itemName))

    if (datasetImage) {
      return datasetImage
    }

    return fallbackImageUrl
  }

  const formatDiscount = (discount: number): string => {
    return `${discount.toFixed(2)}%`
  }

  const formatDealDate = (timestamp: string | null): string => {
    if (!timestamp) {
      return '-'
    }

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
      return timestamp
    }

    return date.toLocaleDateString()
  }

  const getConditionFromFloat = (float: number | null): string => {
    if (float === null || Number.isNaN(float)) {
      return '-'
    }

    if (float < 0.07) {
      return 'Factory New'
    }

    if (float < 0.15) {
      return 'Minimal Wear'
    }

    if (float < 0.38) {
      return 'Field-Tested'
    }

    if (float < 0.45) {
      return 'Well-Worn'
    }

    return 'Battle-Scarred'
  }

  const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`
}

  const openDeal = (itemUrl: string): void => {
    window.open(itemUrl, '_blank', 'noopener,noreferrer')
  }

  const fetchTopDeals = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/getTopDeals`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch top deals')
      }

      const data: TopDealsResponse = await response.json()

      topDeals.value = data.topDeals.map((deal) => {
        return {
          source: deal.source,
          externalId: deal.external_id,
          name: deal.item_name,
          imageUrl: getImageFromDataset(deal.item_name, deal.item_image_url),
          itemUrl: deal.item_url,
          float: deal.float,
          salePrice: deal.sale_price,
          itemPrice: deal.item_price,
          discountPercentage: deal.discount_percentage,
          timestamp: deal.timestamp ?? null
        }
      })

      window.localStorage.setItem('topDeals', JSON.stringify(topDeals.value))
    } catch (error) {
      console.error('Error fetching top deals:', error)
    }
  }

  onMounted(() => {
    const sections = ['features', 'video', 'testimonials', 'socials']

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }

    sections.forEach((sectionId) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in')
          } else {
            entry.target.classList.remove('fade-in')
          }
        })
      }, observerOptions)

      const sectionRef = {
        features: features.value,
        video: video.value,
        testimonials: testimonials.value,
        socials: socials.value
      }[sectionId]

      if (sectionRef) {
        observer.observe(sectionRef)
        observers.value.push(observer)
      }
    })

    fetchTopDeals()
  })

  onBeforeUnmount(() => {
    observers.value.forEach((observer) => {
      observer.disconnect()
    })
  })

  return {
    hero,
    features,
    video,
    testimonials,
    socials,
    formData,
    observers,
    topDeals,
    fetchTopDeals,
    formatPrice,
    formatDiscount,
    formatDealDate,
    getConditionFromFloat,
    openDeal
  }
}
