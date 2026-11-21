
const API_URL = 'https://script.google.com/macros/s/AKfycbzxSZaD2AsoHgTgBSr_NEtya1v9mZZRsojoP_Ygkv1qpIEinimffXeDYyB50ieLLB5v3Q/exec';

let allCategories = [];
let allServices = [];
let allAds = [];
let selectedCategory = '';
let searchTerm = '';

const categoriesBox = document.getElementById('categories');
const servicesBox = document.getElementById('servicesList');
const adsBox = document.getElementById('adsList');

const fallbackCategories = [
  {id:'VEHICLES',name:'വാഹനങ്ങൾ',icon:'🚕'},
  {id:'BUS',name:'ബസ് റൂട്ടുകളും സമയവും',icon:'🚌'},
  {id:'HOME_SERVICES',name:'വീട്ടുസേവനങ്ങൾ',icon:'🛠️'},
  {id:'HEALTH',name:'ആരോഗ്യ സേവനങ്ങൾ',icon:'🏥'},
  {id:'SHOPPING',name:'ഓൺലൈൻ ഷോപ്പിങ്',icon:'🛒'},
  {id:'PROPERTY',name:'വീട് & സ്ഥലം',icon:'🏠'},
  {id:'JOBS',name:'ജോലികൾ',icon:'💼'},
  {id:'BUSINESS',name:'ബിസിനസുകൾ',icon:'🏪'},
  {id:'EMERGENCY',name:'അടിയന്തര സേവനങ്ങൾ',icon:'🚨'}
];

function loadEnteKeralaData() {
  const script = document.createElement('script');

  window.ENTE_KERALA_CALLBACK = function(data) {
    if (!data || !data.success) {
      showApiError();
      return;
    }

    allCategories = Array.isArray(data.categories) ? data.categories : [];
    allServices = Array.isArray(data.services) ? data.services : [];
    allAds = Array.isArray(data.ads) ? data.ads : [];

    renderCategories();
    renderServices();
    renderAds();

    const updated = document.getElementById('lastUpdated');
    if (updated && data.updatedAt) {
      updated.textContent = 'വിവരങ്ങൾ പുതുക്കിയത്: ' + data.updatedAt;
    }
  };

  script.onerror = showApiError;

  script.src = API_URL +
    '?api=home&callback=ENTE_KERALA_CALLBACK&t=' + Date.now();

  document.body.appendChild(script);
}

function showApiError() {
  categoriesBox.innerHTML =
    '<p class="error-message">വിവരങ്ങൾ ലഭിക്കുന്നില്ല. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.</p>';

  servicesBox.innerHTML =
    '<p class="empty-message">സേവനങ്ങൾ ഇപ്പോൾ ലഭ്യമല്ല.</p>';

  // API ലഭ്യമല്ലെങ്കിൽ വിഭാഗങ്ങൾ മാത്രം കാണിക്കുക.
  if (!allCategories.length) {
    allCategories = fallbackCategories;
    renderCategories();
  }
}

function renderCategories() {
  categoriesBox.innerHTML = '';

  allCategories.forEach(function(category) {
    const card = document.createElement('button');
    card.className = 'category-card' +
      (selectedCategory === category.id ? ' selected' : '');

    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.textContent = category.icon || '📌';

    const name = document.createElement('span');
    name.className = 'category-name';
    name.textContent = category.name;

    card.appendChild(icon);
    card.appendChild(name);

    card.addEventListener('click', function() {
      selectedCategory = selectedCategory === category.id
        ? ''
        : category.id;

      renderCategories();
      renderServices();

      document.getElementById('servicesSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    categoriesBox.appendChild(card);
  });
}

function renderServices() {
  servicesBox.innerHTML = '';

  let filtered = allServices.filter(function(service) {
    const matchesCategory = !selectedCategory ||
      service.categoryId === selectedCategory;

    const searchable = [
      service.ownerName,
      service.categoryName,
      service.location,
      service.description,
      service.mobile
    ].join(' ').toLowerCase();

    const matchesSearch = !searchTerm ||
      searchable.includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const title = document.getElementById('servicesTitle');
  const subtitle = document.getElementById('servicesSubtitle');
  const clearButton = document.getElementById('clearFilter');

  const category = allCategories.find(function(c) {
    return c.id === selectedCategory;
  });

  title.textContent = category
    ? category.name
    : 'അംഗീകൃത സേവനങ്ങൾ';

  subtitle.textContent = filtered.length
    ? filtered.length + ' സേവനങ്ങൾ കണ്ടെത്തി'
    : 'പുതിയ സേവനങ്ങൾ ഉടൻ ലഭ്യമാകും';

  clearButton.classList.toggle('hidden', !selectedCategory);

  if (!filtered.length) {
    servicesBox.innerHTML =
      '<div class="empty-state"><div>🔎</div><h3>സേവനങ്ങൾ കണ്ടെത്തിയില്ല</h3><p>ഈ വിഭാഗത്തിൽ ഇപ്പോൾ അംഗീകൃത സേവനങ്ങൾ ലഭ്യമല്ല.</p></div>';
    return;
  }

  filtered.forEach(function(service) {
    servicesBox.appendChild(createServiceCard(service));
  });
}

function createServiceCard(service) {
  const card = document.createElement('article');
  card.className = 'service-card';

  const top = document.createElement('div');
  top.className = 'service-top';

  const name = document.createElement('h3');
  name.textContent = service.ownerName || 'സേവനദാതാവ്';

  const status = document.createElement('span');
  status.className = 'service-status';

  const available = String(service.availabilityText || '')
    .includes('ലഭ്യമാണ്') &&
    !String(service.availabilityText || '').includes('ലഭ്യമല്ല');

  status.textContent = service.availabilityText || 'സമയം നൽകിയിട്ടില്ല';
  status.classList.add(available ? 'available' : 'unavailable');

  top.appendChild(name);
  top.appendChild(status);

  const category = document.createElement('p');
  category.className = 'service-category';
  category.textContent = service.categoryName || '';

  const location = document.createElement('p');
  location.className = 'service-location';
  location.textContent = '📍 ' + (service.location || '');

  card.appendChild(top);
  card.appendChild(category);
  card.appendChild(location);

  if (service.description) {
    const description = document.createElement('p');
    description.className = 'service-description';
    description.textContent = service.description;
    card.appendChild(description);
  }

  if (service.hoursSummary) {
    const hours = document.createElement('p');
    hours.className = 'service-hours';
    hours.textContent = '🕒 ' + service.hoursSummary;
    card.appendChild(hours);
  }

  const actions = document.createElement('div');
  actions.className = 'service-actions';

  const phone = String(service.mobile || '').replace(/\D/g, '');

  if (phone) {
    const call = document.createElement('a');
    call.href = 'tel:' + phone;
    call.textContent = '📞 വിളിക്കുക';
    call.className = 'call-button';
    actions.appendChild(call);

    const whatsapp = document.createElement('a');
    whatsapp.href = 'https://wa.me/' + phone;
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.textContent = 'WhatsApp';
    whatsapp.className = 'whatsapp-button';
    actions.appendChild(whatsapp);
  }

  card.appendChild(actions);
  return card;
}

function renderAds() {
  adsBox.innerHTML = '';

  const visibleAds = allAds.filter(function(ad) {
    return ad.imageUrl && ['banner', 'both'].includes(ad.displayType);
  });

  if (!visibleAds.length) {
    document.getElementById('adsSection').classList.add('hidden');
    return;
  }

  document.getElementById('adsSection').classList.remove('hidden');

  visibleAds.forEach(function(ad) {
    const card = document.createElement('div');
    card.className = 'ad-card';

    const img = document.createElement('img');
    img.src = ad.imageUrl;
    img.alt = ad.businessName || 'പരസ്യം';
    img.loading = 'lazy';

    card.appendChild(img);

    const title = document.createElement('p');
    title.textContent = ad.businessName || '';
    card.appendChild(title);

    if (ad.link && /^https:\/\//i.test(ad.link)) {
      const link = document.createElement('a');
      link.href = ad.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'കൂടുതൽ അറിയുക →';
      card.appendChild(link);
    }

    adsBox.appendChild(card);
  });
}

document.getElementById('searchInput').addEventListener('input', function(e) {
  searchTerm = e.target.value.trim();
  renderServices();
});

document.getElementById('clearFilter').addEventListener('click', function() {
  selectedCategory = '';
  renderCategories();
  renderServices();
});

function showAllServices() {
  selectedCategory = '';
  searchTerm = '';
  document.getElementById('searchInput').value = '';
  renderCategories();
  renderServices();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

loadEnteKeralaData();
