// Track.js - Sipariş takip sayfası

// Supabase config
const SUPABASE_URL = 'https://api.halidefterim.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.GLBdxNO6K_T2PQWPLK2b1_sTViqXdTFMTSwecOFsOII';

// Status mesajları
const STATUS_MESSAGES = {
  picked_up: 'Ürününüz alındı',
  in_facility: 'Tesiste işleme alındı',
  washing: 'Yıkama işlemi devam ediyor',
  completed: 'Yıkama tamamlandı - Teslimata hazır',
  delivered: 'Teslim edildi'
};

// Status order for timeline
const STATUS_ORDER = ['picked_up', 'in_facility', 'washing', 'completed', 'delivered'];

// URL'den tracking code al
function getTrackingCode() {
  const params = new URLSearchParams(window.location.search);
  let code = params.get('code');
  
  if (!code) {
    // URL format: /track/{code} - path'ten almayı dene
    const path = window.location.pathname;
    // Daha esnek bir regex: /track/ kısmından sonraki 8 karakterlik alfanümerik kodu al
    const match = path.match(/\/track\/([A-Z0-9]{8})/i);
    if (match) {
      code = match[1];
    }
  }
  
  return code ? code.trim().toUpperCase() : null;
}

// Sipariş takip bilgisi getir
async function fetchOrderTracking(trackingCode) {
  console.log('Fetching tracking for:', trackingCode);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_order_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        p_tracking_code: trackingCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return null;
  }
}

// QR scan event log
async function logQRScan(trackingCode) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/log_qr_event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        p_tracking_code: trackingCode,
        p_event_type: 'scanned'
      })
    });
  } catch (error) {
    console.error('Error logging scan:', error);
  }
}

// Tarih formatla
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('tr-TR', options);
}

// Timeline güncelle
function updateTimeline(orderStatus) {
  const statusIndex = STATUS_ORDER.indexOf(orderStatus);
  
  if (statusIndex === -1) return;
  
  // Tüm timeline itemları al
  const items = document.querySelectorAll('.timeline-item');
  
  items.forEach((item, index) => {
    if (index <= statusIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// UI güncelle
function updateUI(data) {
  // Tracking code
  document.getElementById('trackingCode').textContent = data.tracking_code;
  
  // Order info
  document.getElementById('productName').textContent = data.product_name;
  document.getElementById('orderNumber').textContent = data.order_number;
  document.getElementById('quantity').textContent = `${data.quantity} adet`;
  
  // Pickup date
  if (data.pickup_date) {
    document.getElementById('pickupDate').textContent = formatDate(data.pickup_date);
  }
  
  // Status message
  const statusBadge = document.getElementById('statusBadge');
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = data.status_message || STATUS_MESSAGES[data.order_status] || 'İşlem bekliyor';
  
  // Active badge for completed/delivered
  if (data.order_status === 'completed' || data.order_status === 'delivered') {
    statusBadge.classList.add('active');
  }
  
  // Update timeline
  updateTimeline(data.order_status);
  
  // Updated at
  document.getElementById('updatedAt').textContent = formatDate(data.updated_at);
}

// Sayfa state'ini değiştir
function showState(stateName) {
  const states = ['loadingState', 'errorState', 'successState'];
  
  states.forEach(state => {
    const element = document.getElementById(state);
    if (element) {
      element.classList.add('hidden');
    }
  });
  
  const targetState = document.getElementById(stateName);
  if (targetState) {
    targetState.classList.remove('hidden');
  }
}

// Ana fonksiyon
async function init() {
  const trackingCode = getTrackingCode();
  
  if (!trackingCode) {
    showState('errorState');
    return;
  }
  
  // Loading göster
  showState('loadingState');
  
  // Veriyi getir
  const data = await fetchOrderTracking(trackingCode);
  
  if (!data) {
    showState('errorState');
    return;
  }
  
  // UI güncelle
  updateUI(data);
  
  // Scan event log
  await logQRScan(trackingCode);
  
  // Success state göster
  showState('successState');
}

// Sayfa yüklenince çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
