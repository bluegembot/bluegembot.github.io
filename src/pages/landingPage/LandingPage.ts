import { ref, onMounted, onBeforeUnmount } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { API_URL } from '@/config/environment'
import skinsJson from '@/assets/converted-skins.json'
import skinPlaceholder from '@/assets/SkinPlaceholder.svg'

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

export interface TopDeal {
  source: string
  externalId: string
  name: string
  imageUrl: string | null
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

const SKINPORT_AFFILIATE_CODE = 'BGB'

const getImageLookupName = (itemName: string): string => {
  return itemName
    .trim()
    .replace(/^★\s*StatTrak™\s+/i, '★ ')
    .replace(/^StatTrak™\s+/i, '')
    .replace(/^Souvenir\s+/i, '')
    .toLowerCase()
}

const getImageFromDataset = (skinImageMap: Map<string, string>, itemName: string): string | null => {
  return skinImageMap.get(getImageLookupName(itemName)) ?? null
}

const withSkinportAffiliate = (itemUrl: string): string => {
  try {
    const parsedUrl = new URL(itemUrl)

    if (parsedUrl.hostname !== 'skinport.com' && parsedUrl.hostname !== 'www.skinport.com') {
      return itemUrl
    }

    parsedUrl.searchParams.set('r', SKINPORT_AFFILIATE_CODE)
    return parsedUrl.toString()
  } catch (error) {
    return itemUrl
  }
}

export function initLandingPage() {
  const pageRoot = ref<HTMLElement | null>(null)
  const hero = ref<HTMLElement | null>(null)
  const features = ref<HTMLElement | null>(null)
  const video = ref<HTMLElement | null>(null)
  const testimonials = ref<HTMLElement | null>(null)
  const socials = ref<HTMLElement | null>(null)
  const observers = ref<IntersectionObserver[]>([])
  const topDeals = ref<TopDeal[]>([])
  const isLoadingDeals = ref(true)

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

  const formatDiscount = (discount: number): string => {
    return `-${Math.abs(discount).toFixed(1)}%`
  }

  const getDiscountHeatClass = (discount: number): string => {
    const value = Math.abs(discount)

    if (value >= 30) {
      return 'heat-blazing'
    }

    if (value >= 20) {
      return 'heat-hot'
    }

    if (value >= 10) {
      return 'heat-warm'
    }

    return 'heat-mild'
  }

  const formatSavings = (deal: TopDeal): string => {
    const savings = deal.itemPrice - deal.salePrice

    if (savings <= 0) {
      return ''
    }

    return `Save €${savings.toFixed(2)}`
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

  const onImageError = (event: Event): void => {
    const img = event.target as HTMLImageElement
    img.onerror = null
    img.src = skinPlaceholder
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
          imageUrl: getImageFromDataset(skinImageMap, deal.item_name),
          itemUrl: withSkinportAffiliate(deal.item_url),
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
    } finally {
      isLoadingDeals.value = false
    }
  }

  let scrollRafId: number | null = null

  const handleScroll = (): void => {
    if (scrollRafId !== null) {
      return
    }

    scrollRafId = window.requestAnimationFrame(() => {
      scrollRafId = null

      const doc = document.documentElement
      const maxScroll = doc.scrollHeight - doc.clientHeight
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0

      pageRoot.value?.style.setProperty('--scroll-progress', progress.toFixed(4))
    })
  }

  onMounted(() => {
    const sectionRefs = [features.value, video.value, testimonials.value, socials.value]

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    sectionRefs.forEach((sectionRef) => {
      if (sectionRef) {
        observer.observe(sectionRef)
      }
    })

    observers.value.push(observer)

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    fetchTopDeals()
  })

  onBeforeUnmount(() => {
    observers.value.forEach((observer) => {
      observer.disconnect()
    })

    window.removeEventListener('scroll', handleScroll)

    if (scrollRafId !== null) {
      window.cancelAnimationFrame(scrollRafId)
    }
  })

  return {
    pageRoot,
    hero,
    features,
    video,
    testimonials,
    socials,
    formData,
    observers,
    topDeals,
    isLoadingDeals,
    fetchTopDeals,
    formatPrice,
    formatDiscount,
    formatSavings,
    getDiscountHeatClass,
    formatDealDate,
    getConditionFromFloat,
    openDeal,
    skinPlaceholder,
    onImageError
  }
}
