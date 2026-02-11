import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, X, MapPin, Users, Calendar, Palette, Building, Hammer, Gem, Utensils, Shirt, PartyPopper, Camera, Globe, TrendingUp, Mountain, Wheat, Plane, Crown, Star, Award, Heart, Shield } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const AboutSudan: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [counters, setCounters] = useState({
    area: 0,
    population: 0,
    history: 0,
    languages: 0,
    agriculture: 0,
    gold: 0,
    tourism: 0,
    nile: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Database states
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [dbStatistics, setDbStatistics] = useState<any[]>([]);
  const [dbSections, setDbSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sudan Statistics - use database values or defaults
  const sudanStats = {
    area: 1861484, // km²
    population: 45000000,
    history: 5000, // years
    languages: 114,
    agriculture: 200000000, // feddan
    gold: 75, // tons annually
    tourism: 500000, // visitors
    nile: 6650 // km total length
  };

  // Get statistics from database or use defaults
  const getStatValue = (key: string) => {
    const dbStat = dbStatistics.find(s => s.stat_key === key);
    return dbStat ? dbStat.value : sudanStats[key as keyof typeof sudanStats] || 0;
  };

  const getStatLabel = (key: string, defaultLabel: string) => {
    const dbStat = dbStatistics.find(s => s.stat_key === key);
    return dbStat ? (language === 'ar' ? dbStat.label_ar : dbStat.label_en) : defaultLabel;
  };

  const getStatDescription = (key: string, defaultDesc: string) => {
    const dbStat = dbStatistics.find(s => s.stat_key === key);
    return dbStat ? (language === 'ar' ? dbStat.description_ar : dbStat.description_en) : defaultDesc;
  };

  // Use database sections if available, otherwise use default sections
  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Globe, Wheat, Crown, Camera, Palette, Gem, MapPin, Users, Calendar, Mountain, Heart, Building
    };
    return icons[iconName] || Globe;
  };

  const sections = dbSections.length > 0 ? dbSections.map(section => ({
    id: section.section_key,
    title: { ar: section.title_ar, en: section.title_en },
    icon: getIconComponent(section.icon),
    content: { ar: section.content_ar, en: section.content_en },
    image: section.image_url,
    stats: []
  })) : [
    {
      id: 'strategic-location',
      title: { ar: 'الموقع الاستراتيجي', en: 'Strategic Location' },
      icon: Globe,
      content: {
        ar: 'يقع السودان في موقع استراتيجي فريد يربط بين قارتي أفريقيا وآسيا، ويطل على البحر الأحمر بساحل يمتد لأكثر من 853 كيلومتراً. هذا الموقع جعله جسراً حضارياً وتجارياً عبر التاريخ، ونقطة التقاء بين الثقافات العربية والأفريقية.',
        en: 'Sudan is located in a unique strategic position linking Africa and Asia, overlooking the Red Sea with a coastline extending over 853 kilometers. This location has made it a civilizational and commercial bridge throughout history.'
      },
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'المساحة الإجمالية', value: '1.86 مليون كم²', icon: MapPin },
        { label: 'الساحل البحري', value: '853 كم', icon: Mountain },
        { label: 'الحدود الدولية', value: '7 دول', icon: Globe }
      ]
    },
    {
      id: 'food-security',
      title: { ar: 'سلة غذاء العالم', en: 'World\'s Food Basket' },
      icon: Wheat,
      content: {
        ar: 'يُعرف السودان بـ"سلة غذاء العالم" لما يمتلكه من أراضي زراعية خصبة تقدر بأكثر من 200 مليون فدان، ومياه وفيرة من النيل وروافده. ينتج السودان محاصيل استراتيجية مثل القمح والذرة والسمسم والفول السوداني والقطن، مما يجعله قادراً على إطعام مليار شخص.',
        en: 'Sudan is known as the "World\'s Food Basket" with over 200 million acres of fertile agricultural land and abundant water from the Nile. Sudan produces strategic crops that can feed a billion people.'
      },
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'الأراضي الزراعية', value: '200 مليون فدان', icon: Wheat },
        { label: 'إنتاج الذهب', value: '75 طن سنوياً', icon: Gem },
        { label: 'الثروة الحيوانية', value: '100 مليون رأس', icon: Heart }
      ]
    },
    {
      id: 'historical-depth',
      title: { ar: 'العمق التاريخي', en: 'Historical Depth' },
      icon: Crown,
      content: {
        ar: 'يمتد تاريخ السودان لأكثر من 5000 سنة، حيث قامت على أرضه حضارات عظيمة مثل مملكة كوش ومملكة مروي والممالك المسيحية النوبية. يضم السودان أكثر من 255 هرماً، أكثر من مصر، وآثاراً تشهد على عراقة هذه الأرض وحضارتها المتجذرة.',
        en: 'Sudan\'s history spans over 5000 years, with great civilizations like the Kingdom of Kush and Meroe. Sudan has more than 255 pyramids, more than Egypt, testament to its ancient civilization.'
      },
      image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'عمر الحضارة', value: '5000+ سنة', icon: Calendar },
        { label: 'الأهرامات', value: '255+ هرم', icon: Crown },
        { label: 'المواقع الأثرية', value: '50+ موقع', icon: Building }
      ]
    },
    {
      id: 'tourism-potential',
      title: { ar: 'الإمكانات السياحية', en: 'Tourism Potential' },
      icon: Camera,
      content: {
        ar: 'يتمتع السودان بتنوع سياحي فريد يشمل السياحة الأثرية في مروي والبجراوية، والسياحة البحرية على ساحل البحر الأحمر، والسياحة البيئية في محميات الدندر وسنقنيب، والسياحة الثقافية التي تعكس تنوع الثقافات والتقاليد السودانية الأصيلة.',
        en: 'Sudan enjoys unique tourism diversity including archaeological tourism in Meroe, marine tourism on the Red Sea coast, eco-tourism in reserves, and cultural tourism reflecting diverse Sudanese traditions.'
      },
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'المحميات الطبيعية', value: '13 محمية', icon: Mountain },
        { label: 'الشواطئ', value: '853 كم', icon: Plane },
        { label: 'المتاحف', value: '25+ متحف', icon: Building }
      ]
    },
    {
      id: 'regional-influence',
      title: { ar: 'التأثير الإقليمي', en: 'Regional Influence' },
      icon: Star,
      content: {
        ar: 'يلعب السودان دوراً محورياً في المنطقة العربية والأفريقية، فهو عضو في جامعة الدول العربية والاتحاد الأفريقي ومنظمة التعاون الإسلامي. موقعه الجغرافي وثرواته الطبيعية وتنوعه الثقافي يجعله جسراً مهماً بين العالم العربي وأفريقيا.',
        en: 'Sudan plays a pivotal role in the Arab and African regions as a member of the Arab League, African Union, and Islamic Cooperation Organization. Its strategic position makes it an important bridge between the Arab world and Africa.'
      },
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'المنظمات الدولية', value: '15+ منظمة', icon: Globe },
        { label: 'الاتفاقيات الثنائية', value: '50+ اتفاقية', icon: Shield },
        { label: 'السفارات', value: '40+ سفارة', icon: Building }
      ]
    },
    {
      id: 'natural-resources',
      title: { ar: 'الثروات الطبيعية', en: 'Natural Resources' },
      icon: Gem,
      content: {
        ar: 'يزخر السودان بثروات طبيعية هائلة تشمل الذهب والبترول والغاز الطبيعي والحديد والنحاس واليورانيوم. كما يمتلك ثروة مائية كبيرة من النيل الأزرق والأبيض والنيل الرئيسي، بالإضافة إلى ثروة حيوانية ضخمة تقدر بأكثر من 100 مليون رأس من الماشية.',
        en: 'Sudan is rich in natural resources including gold, oil, natural gas, iron, copper, and uranium. It also has significant water resources from the Blue and White Nile, plus livestock exceeding 100 million head.'
      },
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stats: [
        { label: 'احتياطي الذهب', value: '2000+ طن', icon: Gem },
        { label: 'الموارد المائية', value: '30 مليار م³', icon: Mountain },
        { label: 'الغابات', value: '70 مليون هكتار', icon: Mountain }
      ]
    }
  ];

  // Gallery images representing Sudan
  const galleryImages = [
    'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load page info
        const { data: pageData } = await supabase
          .from('about_sudan_page')
          .select('*')
          .eq('is_active', true)
          .single();

        if (pageData) {
          setPageInfo(pageData);
        }

        // Load statistics
        const { data: statsData } = await supabase
          .from('about_sudan_statistics')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (statsData && statsData.length > 0) {
          setDbStatistics(statsData);
        }

        // Load sections
        const { data: sectionsData } = await supabase
          .from('about_sudan_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (sectionsData && sectionsData.length > 0) {
          setDbSections(sectionsData);
        }
      } catch (error) {
        console.error('Error loading About Sudan data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startCountAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const startCountAnimation = () => {
    const duration = 2500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentStats = {
        area: getStatValue('area'),
        population: getStatValue('population'),
        history: getStatValue('history'),
        languages: getStatValue('languages'),
        agriculture: getStatValue('agriculture'),
        gold: getStatValue('gold'),
        tourism: getStatValue('tourism'),
        nile: getStatValue('nile')
      };

      setCounters({
        area: Math.floor(currentStats.area * easeOutQuart),
        population: Math.floor(currentStats.population * easeOutQuart),
        history: Math.floor(currentStats.history * easeOutQuart),
        languages: Math.floor(currentStats.languages * easeOutQuart),
        agriculture: Math.floor(currentStats.agriculture * easeOutQuart),
        gold: Math.floor(currentStats.gold * easeOutQuart),
        tourism: Math.floor(currentStats.tourism * easeOutQuart),
        nile: Math.floor(currentStats.nile * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(currentStats);
      }
    }, stepDuration);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + ' مليون';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + ' ألف';
    }
    return num.toLocaleString('ar-SA');
  };

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sections = document.querySelectorAll('[data-section]');
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionId = section.getAttribute('data-section');
        
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(sectionId || 'hero');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Header */}
      <Header />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        data-section="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Sudan Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <div 
            className="mb-8"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="inline-flex items-center space-x-4 rtl:space-x-reverse bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold">أرض الحضارات العريقة</span>
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {language === 'ar' ? (
              <>
                <span className="block text-white">جمهورية</span>
                <span className="block text-[#87ceeb] bg-gradient-to-r from-[#87ceeb] to-[#276073] bg-clip-text text-transparent">السودان</span>
              </>
            ) : (
              <>
                <span className="block text-white">Republic of</span>
                <span className="block text-[#87ceeb]">Sudan</span>
              </>
            )}
          </h1>
          
          <p 
            className="text-xl md:text-3xl mb-12 leading-relaxed opacity-90 max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {language === 'ar' 
              ? 'قلب أفريقيا النابض • سلة غذاء العالم • جسر الحضارات • أرض الذهب والنيل'
              : 'The beating heart of Africa • World\'s food basket • Bridge of civilizations • Land of gold and the Nile'
            }
          </p>

          {/* Key Stats Preview */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <MapPin className="w-8 h-8 text-[#87ceeb] mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{(getStatValue('area') / 1000000).toFixed(2)}</div>
              <div className="text-sm opacity-80">مليون كم²</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-[#87ceeb] mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{(getStatValue('population') / 1000000).toFixed(0)}</div>
              <div className="text-sm opacity-80">مليون نسمة</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Crown className="w-8 h-8 text-[#87ceeb] mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{getStatValue('history')}+</div>
              <div className="text-sm opacity-80">سنة حضارة</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Gem className="w-8 h-8 text-[#87ceeb] mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{getStatValue('gold')}</div>
              <div className="text-sm opacity-80">طن ذهب سنوياً</div>
            </div>
          </div>

          <button 
            className="bg-gradient-to-r from-[#276073] to-[#87ceeb] hover:from-[#87ceeb] hover:to-[#276073] text-white px-12 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            data-aos="fade-up"
            data-aos-delay="500"
            onClick={() => document.getElementById('strategic-location')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {language === 'ar' ? 'اكتشف السودان' : 'Discover Sudan'}
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section 
        ref={statsRef}
        className="py-20 bg-gradient-to-br from-[#276073] to-[#1e4a5a] text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="stats-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stats-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ar' ? 'السودان بالأرقام' : 'Sudan in Numbers'}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'أرقام وإحصائيات تعكس عظمة السودان وإمكاناته الهائلة'
                : 'Numbers and statistics reflecting Sudan\'s greatness and enormous potential'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Area */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.area)}
              </div>
              <div className="text-white/80">{getStatLabel('area', 'كيلومتر مربع')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('area', 'ثالث أكبر دولة أفريقية')}</div>
            </div>

            {/* Population */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.population)}
              </div>
              <div className="text-white/80">{getStatLabel('population', 'نسمة')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('population', 'شعب متنوع وثري')}</div>
            </div>

            {/* History */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.history)}+
              </div>
              <div className="text-white/80">{getStatLabel('history', 'سنة حضارة')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('history', 'تاريخ عريق ممتد')}</div>
            </div>

            {/* Languages */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {counters.languages}
              </div>
              <div className="text-white/80">{getStatLabel('languages', 'لغة ولهجة')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('languages', 'تنوع ثقافي فريد')}</div>
            </div>

            {/* Agriculture */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="500">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wheat className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.agriculture)}
              </div>
              <div className="text-white/80">{getStatLabel('agriculture', 'فدان زراعي')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('agriculture', 'سلة غذاء العالم')}</div>
            </div>

            {/* Gold */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="600">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {counters.gold}
              </div>
              <div className="text-white/80">{getStatLabel('gold', 'طن ذهب سنوياً')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('gold', 'ثروات معدنية هائلة')}</div>
            </div>

            {/* Tourism */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="700">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.tourism)}
              </div>
              <div className="text-white/80">{getStatLabel('tourism', 'زائر سنوياً')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('tourism', 'وجهة سياحية فريدة')}</div>
            </div>

            {/* Nile */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="800">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="w-10 h-10 text-[#87ceeb]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {formatNumber(counters.nile)}
              </div>
              <div className="text-white/80">{getStatLabel('nile', 'كم طول النيل')}</div>
              <div className="text-sm text-[#87ceeb] mt-1">{getStatDescription('nile', 'أطول أنهار العالم')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          data-section={section.id}
          className={`py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="container mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${
              index % 2 === 1 && !isRTL ? 'lg:grid-flow-col-dense' : ''
            }`}>
              {/* Content */}
              <div 
                className={`${index % 2 === 1 && !isRTL ? 'lg:col-start-2' : ''}`}
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#276073] to-[#87ceeb] rounded-full flex items-center justify-center shadow-lg">
                    <section.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {section.title[language]}
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  {section.content[language]}
                </p>

                {/* Statistics for this section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {section.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-[#276073]/10 rounded-lg flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-[#276073]" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="bg-gradient-to-r from-[#276073] to-[#87ceeb] hover:from-[#87ceeb] hover:to-[#276073] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  {language === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
                </button>
              </div>

              {/* Image */}
              <div 
                className={`${index % 2 === 1 && !isRTL ? 'lg:col-start-1' : ''}`}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src={section.image}
                    alt={section.title[language]}
                    className="w-full h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-bold mb-2">{section.title[language]}</h3>
                    <p className="text-sm text-white/90">اضغط للتكبير</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ar' ? 'صور من السودان' : 'Images from Sudan'}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'لقطات تعكس جمال السودان الطبيعي وتراثه الحضاري وتنوع شعبه الأصيل'
                : 'Snapshots reflecting Sudan\'s natural beauty, civilizational heritage, and diverse authentic people'
              }
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation
            pagination={{ clickable: true }}
            className="gallery-swiper"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {galleryImages.map((image, index) => (
              <SwiperSlide key={index} className="w-80">
                <div 
                  className="relative overflow-hidden rounded-2xl cursor-pointer group"
                  onClick={() => setLightboxImage(image)}
                >
                  <img
                    src={image}
                    alt={`Sudan Gallery ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-4xl md:text-6xl font-bold mb-8"
              data-aos="fade-up"
            >
              {language === 'ar' ? 'السودان ينتظركم' : 'Sudan Awaits You'}
            </h2>
            <p 
              className="text-xl md:text-2xl mb-12 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {language === 'ar' 
                ? 'اكتشفوا أرض الحضارات العريقة والثروات الطبيعية والشعب الكريم. السودان بوابة أفريقيا وقلب العالم العربي'
                : 'Discover the land of ancient civilizations, natural wealth, and generous people. Sudan is Africa\'s gateway and the heart of the Arab world'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center" data-aos="fade-up" data-aos-delay="200">
              <button className="bg-white text-[#276073] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
                {language === 'ar' ? 'خطط لزيارتك' : 'Plan Your Visit'}
              </button>
              <button className="bg-[#87ceeb] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#5dade2] transition-all duration-300 transform hover:scale-105 shadow-xl">
                {language === 'ar' ? 'استثمر في السودان' : 'Invest in Sudan'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage}
              alt="Gallery"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSudan;