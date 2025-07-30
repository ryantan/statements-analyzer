import { Transaction } from '@/features/transactions/types';

export const assignCommonCategories = (items: Transaction[]): Transaction[] => {
  return items.map((item) => {
    if (item.categoryKey) {
      // Skip if already has a category.
      return { ...item };
    }
    if (item.autoCategoryKey) {
      // Skip if already has a category.
      return { ...item };
    }

    let newCategoryKey: string | undefined = undefined;
    const description = item.description[0].toUpperCase();
    const descriptionAll = item.description.join(' ').toUpperCase();
    if (descriptionAll.includes('BUS/MRT')) {
      newCategoryKey = 'transport/public';
    } else if (description.startsWith('GRAB*')) {
      newCategoryKey = 'transport/private';
    } else if (descriptionAll.includes('COMFORT/CITYCAB')) {
      newCategoryKey = 'transport/private';
    } else if (descriptionAll.includes('CABCHARGE')) {
      newCategoryKey = 'transport/private';
    } else if (descriptionAll.includes('PREMIER TAXIS')) {
      newCategoryKey = 'transport/private';
    } else if (descriptionAll.includes('HELLORIDE')) {
      newCategoryKey = 'transport/cycling';
    } else if (descriptionAll.includes('ANYWHEEL.SG')) {
      newCategoryKey = 'transport/cycling';
    } else if (descriptionAll.includes('NTUC FP')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('NTUC FAIR')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('COLD STORAGE')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('SHENGSIONG')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('U STARS SUPER')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('ACE MART')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('ACE MARKETPLACE')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('SCARLETT SUPERMARKET')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('MEIDI-YA')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('HAO MART')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('KOMALAS VEG')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('KOMALA S VEG')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('M & S ')) {
      newCategoryKey = 'groceries/super';
    } else if (descriptionAll.includes('GUARDIAN')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('WATSONS')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('7 ELEVEN')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('CHEERS')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('HOCKHUA')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('SHELL ')) {
      newCategoryKey = 'groceries/pharmacy';
    } else if (descriptionAll.includes('BREADTALK')) {
      newCategoryKey = 'groceries/bread';
    } else if (descriptionAll.includes('SO GOOD BAKERY')) {
      newCategoryKey = 'groceries/bread';
    } else if (descriptionAll.includes('FOUR LEAVES')) {
      newCategoryKey = 'groceries/bread';
    } else if (descriptionAll.includes('DUKE BAKERY')) {
      newCategoryKey = 'groceries/bread';
    } else if (descriptionAll.includes('GOKOKU JAPAN')) {
      newCategoryKey = 'groceries/bread';
    } else if (descriptionAll.includes('SHOPEE')) {
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('LAZADA')) {
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('TAOBAO')) {
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('SHEIN SHEIN')) {
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('SHEIN ')) {
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('ONE-TECH.SG')) {
      // Shopee shop
      newCategoryKey = 'shopping/online';
    } else if (descriptionAll.includes('GIORDANO')) {
      newCategoryKey = 'shopping/offline';
    } else if (descriptionAll.includes('ISETAN')) {
      newCategoryKey = 'shopping/offline';
    } else if (descriptionAll.includes('TAKASHIMAYA')) {
      newCategoryKey = 'shopping/offline';
    } else if (descriptionAll.includes('BRAUN')) {
      newCategoryKey = 'shopping/offline';
    } else if (descriptionAll.includes('CELMONZE')) {
      newCategoryKey = 'shopping/beauty';
    } else if (descriptionAll.includes('YVES SAINT LAURENT')) {
      newCategoryKey = 'shopping/beauty';
    } else if (descriptionAll.includes('YVES SAINT')) {
      newCategoryKey = 'shopping/beauty';
    } else if (descriptionAll.includes('GLOWRIGHT')) {
      newCategoryKey = 'household/appliances';
    } else if (descriptionAll.includes('IKEA SINGAPORE')) {
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('IPP IKEA')) {
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('DAISO JAPAN')) {
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('NITORI')) {
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('PHOONHUAT')) {
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('POWERON')) {
      // Power bank rental
      newCategoryKey = 'household/others';
    } else if (descriptionAll.includes('KOPITIAM')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SUBWAY')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('GENKI SUSHI')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SUSHI EXPRES')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SUSHIRO')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('HATSUMI')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('THE TREND Singapore')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('FR VIVO WEST')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('GREENWICHVEATRICH')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('TIONG BAHRU BAKERY')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('IKEA SWEDISH BISTRO')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('IKEA-RESTAURANT')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('PSCAFE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('WILD SEEDS')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('PICANHAS')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('APOLLO-COFFEE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SOUSFULLY')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SUPERGREEN')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('MCDONALD')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('JOLLIBEE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('NENE CHICKEN')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('GO ANG PRATUNAM')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SRISUN EXPRESS')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('POPEYES')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('DOMINOS PIZZA')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('HEAVENLYWANG')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('MALAYSIA BOLEH')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('PARIS BAGUETTE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SONG FA BAK')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('VICOLETTO')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('ISTEAK')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('YEW KEE SPECIALITIES')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('LOLAS CAFE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('CASA BRAZILIA')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('TSUI HIANG YUAN')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('THE PROVIDORE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('BURNT ENDS')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('JOSH S GRILL')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('DYNASTY @ SU')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('BINGZ')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('TONGUE TIP')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('EAT. @ NEX')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('KAMS ROAST')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('LAO WANG')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SHOPBACK LAO SINGAPORE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('TAMAGO EN')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('KANSHOKU RAMEN')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('ISSHIN MACHI')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('WONDERFUL BAPSANG')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('COFFEE BEE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('BAKERYCUISINE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('YABURI')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SUKIYA')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('WURSTHANS')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('SOI 19 THAI')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('HOT TO SINGAPORE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('THE COCOA TREES')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('RESTORAN ')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('FISH SOUP')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('MIXED RICE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('ANIPLUS SINGAPORE')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('REN LE FANG')) {
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('TASHDASH')) {
      // Super big burgers at Haji lane
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes('GRUPOALEGRIA')) {
      // Latin Asian cuisine restaurant (Grupo Alegria Pte Ltd)
      newCategoryKey = 'food/eating-out';
    } else if (descriptionAll.includes("AUNTIE ANNE'S")) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('TORI-Q')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('BASKIN ROBBINS')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('OCTOBOX')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('GARRETT POPCORN')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('OLD CHANG KE')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('FAMOUS AMOS')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('CHUN CHUN TI')) {
      // Dessert place at Serangoon gardens
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('TANG HENG HUAT')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('KANG JI SUGAR COATED')) {
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('ROLLNEY SINGAPORE')) {
      // Cold dessert place at vivo
      newCategoryKey = 'food/snacks';
    } else if (descriptionAll.includes('THE COFFEE BEAN')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('THE COFFEE B')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('HUDSONS COFFEE')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('STARBUCKS')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('LUCKIN COFFEE')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('TIM HORTONS')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('BACHA COFFEE')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('YA KUN')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('TOAST BOX')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('JOE & DOUGH')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('OAKS COFFEE')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('THE FINNWOOD CAF')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('KOPIFELLAS')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('THE TREND')) {
      // Cafe beside Rhythm In Me
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('CHICHA SAN')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('IJOOZ')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('APAC VENDING')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('ADAMO ENTERPRISE')) {
      // Vending machine in Kidztopia
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes(' VENDING ')) {
      newCategoryKey = 'food/drinks';
    } else if (descriptionAll.includes('FOOD PANDA')) {
      newCategoryKey = 'food/delivery';
    } else if (descriptionAll.includes('DELIVEROO')) {
      newCategoryKey = 'food/delivery';
    } else if (descriptionAll.includes('GV ONLINE')) {
      newCategoryKey = 'entertainment/movies';
    } else if (descriptionAll.includes('GV PAYA LEBAR')) {
      newCategoryKey = 'entertainment/movies';
    } else if (descriptionAll.includes('GV VIVOCITY')) {
      newCategoryKey = 'entertainment/movies';
    } else if (descriptionAll.includes('SHAW THEATRE')) {
      newCategoryKey = 'entertainment/movies';
    } else if (descriptionAll.includes('KIZTOPIA')) {
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('WAN TO PLAY')) {
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('PLAYGROUND APEX')) {
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('AMAZONIA')) {
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('SAFRA-TOA PAYOH')) {
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('WORLD OF BLO SINGAPORE')) {
      // World of blocks.
      newCategoryKey = 'entertainment/playground';
    } else if (descriptionAll.includes('WORLD OF PAWS')) {
      newCategoryKey = 'entertainment/others';
    } else if (descriptionAll.includes('ME CAFE GAMES')) {
      // Cat cafe at Orchard gateway
      newCategoryKey = 'entertainment/others';
    } else if (descriptionAll.includes('WALKINGONSUNSHINE')) {
      newCategoryKey = 'entertainment/others';
    } else if (
      descriptionAll.includes('BEAU') &&
      descriptionAll.includes('ONLINE')
    ) {
      // Pug dog cafe at Haji lane
      newCategoryKey = 'entertainment/others';
    } else if (descriptionAll.includes('CLAYFUL.SG')) {
      newCategoryKey = 'entertainment/others';
    } else if (descriptionAll.includes('FEVER*CANDLELIGHT')) {
      newCategoryKey = 'entertainment/others';
    } else if (descriptionAll.includes('AMAZON WEB SERVICES')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('SPOTIFY')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('1PASSWORD')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('STEAM PURCHASE')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('APPLE.COM/BILL')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('GOOGLE ONE')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('NETFLIX.COM')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('DISNEY PLUS')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('TIA NEWS SUBSCRIP')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('GENDOTXYZ')) {
      newCategoryKey = 'software';
    } else if (descriptionAll.includes('KSKIN')) {
      newCategoryKey = 'health/others';
    } else if (descriptionAll.includes('KIMAGE SALON')) {
      newCategoryKey = 'health/others';
    } else if (descriptionAll.includes('NOVITA')) {
      newCategoryKey = 'health/others';
    } else if (descriptionAll.includes('CHEN KANG WELLNESS')) {
      newCategoryKey = 'health/spa';
    } else if (descriptionAll.includes('HT 1 PTE LTD')) {
      // Healing touch spa
      newCategoryKey = 'health/spa';
    } else if (descriptionAll.includes(' SPA ')) {
      newCategoryKey = 'health/spa';
    } else if (descriptionAll.includes('DECATHLON')) {
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes('INMERSPLAY')) {
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes(' INMERS ')) {
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes('SHOPBACK INM SINGAPORE')) {
      // Guessing INMERSPLAY
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes('GRIDDY GRID')) {
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes('GRIDDYGRID')) {
      newCategoryKey = 'health/sports';
    } else if (descriptionAll.includes('DING CATERS')) {
      newCategoryKey = 'party';
    } else if (descriptionAll.includes('ELSIESKITCHEN')) {
      newCategoryKey = 'party';
    } else if (descriptionAll.includes('HUNGRYBBQPT')) {
      newCategoryKey = 'party';
    } else if (descriptionAll.includes('ORCA MARKETING PTE LT')) {
      // Butcher box
      newCategoryKey = 'party';
    } else if (descriptionAll.includes('AGODA.COM')) {
      newCategoryKey = 'holiday/accom';
    } else if (descriptionAll.includes('KAIDE SINGAPORE')) {
      newCategoryKey = 'holiday/others';
    } else if (descriptionAll.includes('FLYSCOOT')) {
      newCategoryKey = 'holiday/flights';
    } else if (descriptionAll.includes('MILES TRANSFER FEE')) {
      newCategoryKey = 'holiday/flights';
    } else if (descriptionAll.includes('SINGAPOREAI')) {
      newCategoryKey = 'holiday/flights';
    } else if (descriptionAll.includes('SINGAPOREAIR')) {
      newCategoryKey = 'holiday/flights';
    } else if (descriptionAll.includes('UDEMY')) {
      newCategoryKey = 'education/adults';
    } else if (descriptionAll.includes('AUREUSACADEMY')) {
      newCategoryKey = 'education/kids';
    } else if (descriptionAll.includes('AUREUS ACADEMY')) {
      newCategoryKey = 'education/kids';
    } else if (descriptionAll.includes('EDU GRID')) {
      newCategoryKey = 'education/kids';
    } else if (descriptionAll.includes('WANG LEARNING')) {
      newCategoryKey = 'education/kids';
    } else if (descriptionAll.includes('SCIENCE CENTRE')) {
      newCategoryKey = 'education/kids';
    } else if (descriptionAll.includes('POPULAR BOOK')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('PACIFIC BOOKSTORES')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('THE GREEN PARTY')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('TIGER FAMILY')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('TFORTOYS')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('WWW.SPLASHLE')) {
      newCategoryKey = 'education/toys-books';
    } else if (descriptionAll.includes('SP SERVICES')) {
      newCategoryKey = 'utilities';
    } else if (descriptionAll.includes('INSURANCE')) {
      newCategoryKey = 'insurance';
    } else if (descriptionAll.includes('PRUDENTIAL')) {
      newCategoryKey = 'insurance';
    } else if (descriptionAll.includes('GREAT EASTERN')) {
      newCategoryKey = 'insurance';
    } else if (descriptionAll.includes('$1,454.50')) {
      newCategoryKey = 'insurance';
    } else if (descriptionAll.includes('AMAZE* WALLET TOPUP')) {
      newCategoryKey = 'others/fees';
    } else if (descriptionAll.includes('AMAZE* FEES')) {
      newCategoryKey = 'others/fees';
    } else if (descriptionAll.includes('ANNUAL MEMBERSHIP FEE')) {
      newCategoryKey = 'others/fees';
    } else if (descriptionAll.includes('CITI PAYALL SERVICE FEE')) {
      newCategoryKey = 'others/fees';
    } else if (descriptionAll.includes('QUICKCASH/PAYLITE')) {
      newCategoryKey = 'loans';
    } else if (descriptionAll.includes('CITI FLEXIBILL')) {
      newCategoryKey = 'loans';
    } else if (descriptionAll.includes('INTEREST') && item.amount > 0) {
      newCategoryKey = 'loans';
    } else if (descriptionAll.includes('MYICA')) {
      newCategoryKey = 'government';
    } else if (descriptionAll.includes('MOM-WPD')) {
      newCategoryKey = 'government';
    } else if (descriptionAll.includes('GIVING.SG')) {
      newCategoryKey = 'donations';
    } else if (descriptionAll.includes('FACEBK *')) {
      newCategoryKey = 'scams';
    } else if (descriptionAll.includes('FOREIGN AMOUNT')) {
      newCategoryKey = 'holiday/others';
    } else if (descriptionAll.includes('CCY CONVERSION')) {
      newCategoryKey = 'holiday/others';
    }
    return { ...item, autoCategoryKey: newCategoryKey };
  });
};
