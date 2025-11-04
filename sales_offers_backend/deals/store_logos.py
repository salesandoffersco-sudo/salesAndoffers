STORE_DATA = {
    'jumia': {
        'name': 'Jumia',
        'logo': 'https://logo.clearbit.com/jumia.com.ng',
        'color': '#f68b1e'
    },
    'kilimall': {
        'name': 'Kilimall', 
        'logo': 'https://logo.clearbit.com/kilimall.co.ke',
        'color': '#ff6b35'
    },
    'amazon': {
        'name': 'Amazon',
        'logo': 'https://logo.clearbit.com/amazon.com',
        'color': '#ff9900'
    },
    'aliexpress': {
        'name': 'AliExpress',
        'logo': 'https://logo.clearbit.com/aliexpress.com', 
        'color': '#ff4747'
    },
    'ebay': {
        'name': 'eBay',
        'logo': 'https://logo.clearbit.com/ebay.com',
        'color': '#0064d2'
    }
}

def get_store_info(store_key):
    return STORE_DATA.get(store_key.lower(), {
        'name': store_key.title(),
        'logo': f'https://logo.clearbit.com/{store_key.lower()}.com',
        'color': '#6b7280'
    })