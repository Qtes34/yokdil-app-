export interface VocabWord {
    id: string;                  // unique, e.g. "day1_necessary"
    dayId: string;               // e.g. "day1"
    word: string;                // English word
    partOfSpeech: string;        // adj, v, n, adv, n/v
    turkish: string;             // Turkish meaning
    exampleSentenceEN: string;   // English example sentence
    exampleSentenceTR: string;   // Turkish translation of example sentence
    synonyms: string;            // comma-separated synonyms

    // SM-2 Spaced Repetition fields
    interval: number;
    easeFactor: number;
    repetitions: number;
    dueDate: number;             // timestamp

    // Composite Scoring Fields (0.0 to 1.0, null if unattempted)
    flashcardScore: number | null;
    matchSynonymScore: number | null;
    matchTurkishScore: number | null;
    testSynonymScore: number | null;
    testTurkishScore: number | null;
}

export interface ActivityState {
    completedOnce: boolean;      // has the user finished this at least once?
    lastScore?: number;          // last score as percentage (0-100), for test activities
    lastPlayedAt?: number;       // timestamp
}

export interface StudyDay {
    id: string;                  // "day1", "day2", etc.
    label: string;               // "Gün 1", "Gün 2", etc.
    wordIds: string[];           // ordered list of word IDs in this day
    activities: {
        flashcard: ActivityState;
        matchSynonym: ActivityState;
        matchTurkish: ActivityState;
        testSynonym: ActivityState;
        testTurkish: ActivityState;
    };
}

export interface AppState {
    days: StudyDay[];
    words: VocabWord[];          // flat list of all words across all days
    streak: number;
    lastStudiedDate: string;     // ISO date string YYYY-MM-DD
}

// ---------- Raw word data (core fields only) ----------
type RawWord = Pick<VocabWord, 'id' | 'dayId' | 'word' | 'partOfSpeech' | 'turkish' | 'exampleSentenceEN' | 'exampleSentenceTR' | 'synonyms'>;

const RAW_WORDS: RawWord[] = [
    // ================= DAY 1 =================
    { "id": "day1_necessary", "dayId": "day1", "word": "NECESSARY", "partOfSpeech": "adj", "turkish": "Gerekli, zaruri, elzem", "exampleSentenceEN": "European countries should take the necessary precautions in order to reduce the cost of electricity.", "exampleSentenceTR": "Avrupa ülkeleri, elektrik maliyetini azaltmak için gerekli önlemleri almalıdır.", "synonyms": "Essential, needed, required, compulsory, obligatory" },
    { "id": "day1_occur", "dayId": "day1", "word": "OCCUR", "partOfSpeech": "v", "turkish": "Meydana gelmek, olmak", "exampleSentenceEN": "Half a million earthquakes occur worldwide each year.", "exampleSentenceTR": "Her yıl dünya çapında yarım milyon deprem meydana gelmektedir.", "synonyms": "Take place, happen" },
    { "id": "day1_penetrate", "dayId": "day1", "word": "PENETRATE", "partOfSpeech": "v", "turkish": "Nüfuz etmek, içine girmek", "exampleSentenceEN": "X-rays are a form of electromagnetic radiation that penetrates human flesh.", "exampleSentenceTR": "X-ışınları, insan etine nüfuz eden bir elektromanyetik radyasyon biçimidir.", "synonyms": "Enter, pass through" },
    { "id": "day1_supply", "dayId": "day1", "word": "SUPPLY", "partOfSpeech": "n/v", "turkish": "Sağlamak, temin etmek / arz", "exampleSentenceEN": "Coal-fired power stations supply half the electricity in many industrial countries.", "exampleSentenceTR": "Kömürle çalışan elektrik santralleri birçok sanayi ülkesinde elektriğin yarısını sağlamaktadır.", "synonyms": "Provide, deliver, contribute" },
    { "id": "day1_matter", "dayId": "day1", "word": "MATTER", "partOfSpeech": "n", "turkish": "Madde", "exampleSentenceEN": "The research may influence how we understand the relations among space, time and matter.", "exampleSentenceTR": "Araştırma uzay, zaman ve madde arasındaki ilişkileri nasıl anladığımızı etkileyebilir.", "synonyms": "Substance, material" },
    { "id": "day1_launch", "dayId": "day1", "word": "LAUNCH", "partOfSpeech": "v", "turkish": "Fırlatmak, başlatmak", "exampleSentenceEN": "Last year, NASA launched the Swift satellite into the space.", "exampleSentenceTR": "Geçen yıl, NASA uzaya Swift uydusunu fırlattı.", "synonyms": "Send off, throw" },
    { "id": "day1_influence", "dayId": "day1", "word": "INFLUENCE", "partOfSpeech": "n/v", "turkish": "Etkilemek / etki", "exampleSentenceEN": "Dams influence aquatic ecology and biodiversity.", "exampleSentenceTR": "Barajlar su ekolojisini ve biyoçeşitliliği etkiler.", "synonyms": "Affect, impact" },
    { "id": "day1_growth", "dayId": "day1", "word": "GROWTH", "partOfSpeech": "n", "turkish": "Büyüme, gelişme", "exampleSentenceEN": "The growth of planets in the solar system was closely connected with the large-scale deformation of asteroids.", "exampleSentenceTR": "Güneş sistemindeki gezegenlerin büyümesi, asteroitlerin büyük ölçekli deformasyonuyla yakından ilişkiliydi.", "synonyms": "Development, evolution, progress" },
    { "id": "day1_flexibility", "dayId": "day1", "word": "FLEXIBILITY", "partOfSpeech": "n", "turkish": "Esneklik, elastikiyet", "exampleSentenceEN": "Current industrial robots meet speed and flexibility requirements.", "exampleSentenceTR": "Mevcut endüstriyel robotlar hız ve esneklik gereksinimlerini karşılamaktadır.", "synonyms": "Elasticity, adaptability" },
    { "id": "day1_eventually", "dayId": "day1", "word": "EVENTUALLY", "partOfSpeech": "adv", "turkish": "Nihayet, sonunda", "exampleSentenceEN": "Human evolution will eventually allow humans to live in the extreme conditions of space.", "exampleSentenceTR": "İnsanın evrimi nihayetinde insanın uzayın zor koşullarında yaşamasına izin verecektir.", "synonyms": "Finally, ultimately, sooner or later" },
    { "id": "day1_useful", "dayId": "day1", "word": "USEFUL", "partOfSpeech": "adj", "turkish": "Yararlı, kullanışlı", "exampleSentenceEN": "Underwater turbines are particularly useful because they are unaffected by storms.", "exampleSentenceTR": "Sualtı türbinleri fırtınalardan etkilenmediğinden bilhassa yararlıdır.", "synonyms": "Beneficial, helpful, practical" },
    { "id": "day1_magnify", "dayId": "day1", "word": "MAGNIFY", "partOfSpeech": "v", "turkish": "Büyütmek", "exampleSentenceEN": "Their movements are tracked by video and magnified on a screen.", "exampleSentenceTR": "Onların hareketleri video ile izlenir ve ekranda büyültülür.", "synonyms": "Enlarge, amplify" },
    { "id": "day1_formerly", "dayId": "day1", "word": "FORMERLY", "partOfSpeech": "adv", "turkish": "Eskiden, daha önce", "exampleSentenceEN": "Formerly scientists thought that one large earthquake could not possibly affect the timing or location of the next.", "exampleSentenceTR": "Eskiden bilim insanları, büyük bir depremin bir sonrakinin zamanlamasını veya yerini etkilemeyeceğini düşünüyorlardı.", "synonyms": "Previously, in the past" },
    { "id": "day1_vague", "dayId": "day1", "word": "VAGUE", "partOfSpeech": "adj", "turkish": "Belirsiz, muğlak", "exampleSentenceEN": "The future of China's space program is vague because of high costs.", "exampleSentenceTR": "Çin'in uzay programının geleceği yüksek maliyetlerden ötürü belirsizdir.", "synonyms": "Unclear, indefinite, ambiguous" },
    { "id": "day1_enable", "dayId": "day1", "word": "ENABLE", "partOfSpeech": "v", "turkish": "Olanak sağlamak", "exampleSentenceEN": "Satellites enable us to transmit news all around the world.", "exampleSentenceTR": "Uydular, tüm dünyadaki haberleri iletmemizi sağlar.", "synonyms": "Allow, permit" },
    { "id": "day1_vanish", "dayId": "day1", "word": "VANISH", "partOfSpeech": "v", "turkish": "Yok olmak, ortadan kaybolmak", "exampleSentenceEN": "Due to logging and cultivation, forests are vanishing all over the world.", "exampleSentenceTR": "Ağaç kesme ve tarım nedeniyle ormanlar tüm dünyada yok oluyor.", "synonyms": "Die out, disappear" },
    { "id": "day1_wilderness", "dayId": "day1", "word": "WILDERNESS", "partOfSpeech": "n", "turkish": "Yaban hayat, vahşi yaşam", "exampleSentenceEN": "Noise pollution doubled sound levels in 12% of all wilderness areas.", "exampleSentenceTR": "Gürültü kirliliği, tüm vahşi yaşam alanlarının %12'sinde ses seviyesini ikiye katladı.", "synonyms": "Wild land, natural habitat" },
    { "id": "day1_enhance", "dayId": "day1", "word": "ENHANCE", "partOfSpeech": "v", "turkish": "Artırmak, geliştirmek", "exampleSentenceEN": "Certain genes can dramatically enhance an organism's health and extend its life span.", "exampleSentenceTR": "Bazı genler, bir organizmanın sağlığını ciddi biçimde artırabilir ve ömrünü uzatabilir.", "synonyms": "Improve, augment, boost, develop" },
    { "id": "day1_celestial", "dayId": "day1", "word": "CELESTIAL", "partOfSpeech": "adj", "turkish": "Gökle ilgili, göksel", "exampleSentenceEN": "The duty of an astronomer is to record celestial motions through careful observation.", "exampleSentenceTR": "Bir gökbilimcinin görevi dikkatli gözlem ile gökle ilgili hareketleri kaydetmektir.", "synonyms": "Heavenly, astronomical" },
    { "id": "day1_extinction", "dayId": "day1", "word": "EXTINCTION", "partOfSpeech": "n", "turkish": "Nesli tükenme, yok olma", "exampleSentenceEN": "The emergence of the Himalayas caused the extinction of many ocean species.", "exampleSentenceTR": "Himalayaların ortaya çıkışı birçok okyanus türünün yok olmasına neden oldu.", "synonyms": "Disappearance, dying out" },

    // ================= DAY 2 =================
    { "id": "day2_gain", "dayId": "day2", "word": "Gain", "partOfSpeech": "v", "turkish": "Kazanmak, elde etmek", "exampleSentenceEN": "Scientists have gained a new understanding of how everyday events are formed in the brain.", "exampleSentenceTR": "Bilim insanları, günlük olayların beyinde nasıl şekillendiği konusunda yeni bir anlayış kazanmışlardır.", "synonyms": "Get, achieve, acquire, obtain" },
    { "id": "day2_initially", "dayId": "day2", "word": "Initially", "partOfSpeech": "adv", "turkish": "Başlangıçta, ilk başlarda", "exampleSentenceEN": "The moon's craters were initially formed by asteroids crashing into it.", "exampleSentenceTR": "Ay'ın kraterleri ilk başta ona çarpan asteroitler tarafından oluşturuldu.", "synonyms": "At first, originally, to begin with" },
    { "id": "day2_pursue", "dayId": "day2", "word": "Pursue", "partOfSpeech": "v", "turkish": "Takip etmek, izlemek, peşinden koşmak", "exampleSentenceEN": "Companies are pursuing hundreds of experimental treatments involving gene therapy products.", "exampleSentenceTR": "Şirketler, gen terapi ürünleri içeren yüzlerce deneysel tedavinin peşinden koşuyorlar.", "synonyms": "Follow, go after, track" },
    { "id": "day2_reasonable", "dayId": "day2", "word": "Reasonable", "partOfSpeech": "adj", "turkish": "Makul, akıllıca", "exampleSentenceEN": "He thinks that yoga may be a reasonable alternative to physical therapy.", "exampleSentenceTR": "O, yoganın fizik tedaviye makul bir alternatif olabileceğini düşünüyor.", "synonyms": "Sensible, rational" },
    { "id": "day2_state", "dayId": "day2", "word": "State", "partOfSpeech": "n", "turkish": "Durum, hal", "exampleSentenceEN": "Electrical conductivity in the liquid state is generally due to the presence of ions.", "exampleSentenceTR": "Sıvı haldeki elektriksel iletkenlik genellikle iyonların varlığına bağlıdır.", "synonyms": "Condition, situation, shape" },
    { "id": "day2_prove", "dayId": "day2", "word": "Prove", "partOfSpeech": "v", "turkish": "Kanıtlamak, ispatlamak", "exampleSentenceEN": "Experts have proved that health depends on psychological condition.", "exampleSentenceTR": "Uzmanlar sağlığın psikolojik duruma bağlı olduğunu kanıtladılar.", "synonyms": "Demonstrate, verify, ascertain" },
    { "id": "day2_discard", "dayId": "day2", "word": "Discard", "partOfSpeech": "v", "turkish": "Atmak, gözden çıkarmak, kurtulmak", "exampleSentenceEN": "The failed scientists and scientific ideas are discarded.", "exampleSentenceTR": "Başarısız bilim insanları ve bilimsel fikirler gözden çıkarılır.", "synonyms": "Throw away, dispose of, get rid of" },
    { "id": "day2_knowledge", "dayId": "day2", "word": "Knowledge", "partOfSpeech": "n", "turkish": "Bilgi, ilim", "exampleSentenceEN": "Chemists in the past had no knowledge of atomic numbers and atomic weights.", "exampleSentenceTR": "Geçmişteki kimyagerler atom numarası ve atom ağırlıkları hakkında hiçbir bilgiye sahip değildi.", "synonyms": "Information, wisdom, education" },
    { "id": "day2_precaution", "dayId": "day2", "word": "Precaution", "partOfSpeech": "n", "turkish": "Önlem, tedbir", "exampleSentenceEN": "The US has started taking technological precautions along its Mexican borders.", "exampleSentenceTR": "ABD, Meksika sınırları boyunca teknolojik önlemler almaya başlamıştır.", "synonyms": "Measure, protection" },
    { "id": "day2_repair", "dayId": "day2", "word": "Repair", "partOfSpeech": "v", "turkish": "Tamir etmek, onarmak", "exampleSentenceEN": "NASA is going to send a team to repair the Hubble space telescope in the future.", "exampleSentenceTR": "NASA, gelecekte Hubble uzay teleskopunu tamir etmek için bir ekip gönderecek.", "synonyms": "Fix, overhaul" },
    { "id": "day2_primary", "dayId": "day2", "word": "Primary", "partOfSpeech": "adj", "turkish": "Başlıca, esas", "exampleSentenceEN": "The Red Crecent's primary concern is to preserve and protect human life.", "exampleSentenceTR": "Kızılay'ın başlıca ilgi alanı, insan hayatını muhafaza etmek ve korumaktır.", "synonyms": "Main, chief, most important" },
    { "id": "day2_reduce", "dayId": "day2", "word": "Reduce", "partOfSpeech": "v", "turkish": "Düşürmek, azaltmak", "exampleSentenceEN": "Deforestation may have reduced the number of plants contributing to atmospheric methane.", "exampleSentenceTR": "Ormansızlaşma atmosferik metana katkıda bulunan bitki sayısını azaltmış olabilir.", "synonyms": "Lower, lessen, diminish" },
    { "id": "day2_disease", "dayId": "day2", "word": "Disease", "partOfSpeech": "n", "turkish": "Hastalık", "exampleSentenceEN": "Scientists have been able to identify which parts of the brain are most vulnerable to disease.", "exampleSentenceTR": "Bilim adamları beynin hangi kısımlarının hastalığa karşı en savunmasız olduğunu tanımlayabildiler.", "synonyms": "Sickness, ailment, illness" },
    { "id": "day2_accessible", "dayId": "day2", "word": "Accessible", "partOfSpeech": "adj", "turkish": "Ulaşılabilir, erişilebilir", "exampleSentenceEN": "Very few points of space are accessible for human beings.", "exampleSentenceTR": "Uzayın çok az noktası insanoğlu için ulaşılabilir durumdadır.", "synonyms": "Available, reachable, handy" },
    { "id": "day2_agriculture", "dayId": "day2", "word": "Agriculture", "partOfSpeech": "n", "turkish": "Tarım, ziraat", "exampleSentenceEN": "Volcanic eruptions are a significant threat to people and agriculture.", "exampleSentenceTR": "Volkanik patlamalar insanlar ve tarım için önemli bir tehdittir.", "synonyms": "Farming, cultivation" },
    { "id": "day2_annual", "dayId": "day2", "word": "Annual", "partOfSpeech": "adj", "turkish": "Yıllık", "exampleSentenceEN": "Annual population growth in the world has the effect of raising the amount of carbon emissions.", "exampleSentenceTR": "Dünyadaki yıllık nüfus artışı karbon emisyonu miktarını artırma etkisine sahiptir.", "synonyms": "Yearly" },
    { "id": "day2_recommend", "dayId": "day2", "word": "Recommend", "partOfSpeech": "v", "turkish": "Tavsiye etmek, önermek", "exampleSentenceEN": "Doctors recommend vaccines during childhood because they're an incredibly effective way to prevent dangerous diseases.", "exampleSentenceTR": "Tehlikeli hastalıkları önlemenin inanılmaz derecede etkili bir yolu olması sebebiyle, doktorlar çocukluk döneminde aşıları önerirler.", "synonyms": "Suggest, advise" },
    { "id": "day2_vary", "dayId": "day2", "word": "Vary", "partOfSpeech": "v", "turkish": "Farklılık göstermek, değişmek", "exampleSentenceEN": "Currents in the dams vary greatly from season to season.", "exampleSentenceTR": "Barajlardaki akıntılar mevsimden mevsime büyük değişiklik gösterir.", "synonyms": "Change, alter" },
    { "id": "day2_approximately", "dayId": "day2", "word": "Approximately", "partOfSpeech": "adv", "turkish": "Takriben, yaklaşık", "exampleSentenceEN": "Approximately 200 thousand people were evacuated because of Chernobyl disaster.", "exampleSentenceTR": "Çernobil felaketi sebebiyle yaklaşık 200 bin kişi tahliye edildi.", "synonyms": "Around, about, roughly" },
    { "id": "day2_principle", "dayId": "day2", "word": "Principle", "partOfSpeech": "n", "turkish": "Prensip, ilke, kaide", "exampleSentenceEN": "Many ideas about the mind are derived from scholastic principles.", "exampleSentenceTR": "Zihin ile ilgili birçok fikir skolastik ilkelerden türetilir.", "synonyms": "Rule, theory, notion" },

    // ================= DAY 3 =================
    { "id": "day3_monitor", "dayId": "day3", "word": "Monitor", "partOfSpeech": "v", "turkish": "İzlemek, gözlemlemek", "exampleSentenceEN": "Equipment was installed to monitor air quality in the area.", "exampleSentenceTR": "Bölgedeki hava kalitesini izlemek için ekipman kuruldu.", "synonyms": "Watch, observe" },
    { "id": "day3_scarce", "dayId": "day3", "word": "Scarce", "partOfSpeech": "adj", "turkish": "Kısıtlı, yetersiz, kıt", "exampleSentenceEN": "Food, clean water, and compulsory vaccines are becoming scarce in Africa.", "exampleSentenceTR": "Afrika'da gıda, temiz su ve zorunlu aşılar kıtlaşıyor.", "synonyms": "Limited, inadequate, insufficient" },
    { "id": "day3_fluctuation", "dayId": "day3", "word": "Fluctuation", "partOfSpeech": "n", "turkish": "Dalgalanma, değişme", "exampleSentenceEN": "Signal fluctuation happens with every wireless network.", "exampleSentenceTR": "Sinyal dalgalanması her kablosuz ağda meydana gelir.", "synonyms": "Change, variation" },
    { "id": "day3_product", "dayId": "day3", "word": "Product", "partOfSpeech": "n", "turkish": "Ürün, sonuç", "exampleSentenceEN": "Volcanic activity in central Anatolia is a product of the region's position.", "exampleSentenceTR": "Orta Anadolu'daki volkanik faaliyet, bölgenin konumunun bir ürünüdür.", "synonyms": "Result, outcome, item" },
    { "id": "day3_invent", "dayId": "day3", "word": "Invent", "partOfSpeech": "v", "turkish": "İcat etmek, keşfetmek", "exampleSentenceEN": "He invented the lightweight fibre used in bullet-proof vests and body armour.", "exampleSentenceTR": "O, kurşun geçirmez yeleklerde ve vücut zırhlarında kullanılan hafif elyafı icat etti.", "synonyms": "Create, discover, devise" },
    { "id": "day3_exceptional", "dayId": "day3", "word": "Exceptional", "partOfSpeech": "adj", "turkish": "Fevkalade, istisnai, olağanüstü", "exampleSentenceEN": "Amazon, Google and the rest have exceptional Artificial Intelligence resources for sale.", "exampleSentenceTR": "Amazon, Google ve diğerleri satış için olağanüstü Yapay Zeka kaynaklarına sahiptir.", "synonyms": "Excellent, special, extraordinary" },
    { "id": "day3_illustrate", "dayId": "day3", "word": "Illustrate", "partOfSpeech": "v", "turkish": "Göstermek, sergilemek, resimlerle açıklamak", "exampleSentenceEN": "Skeletons in the museum illustrate how humanbeings evolved.", "exampleSentenceTR": "Müzedeki iskeletler insanın nasıl evrimleştiğini gösteriyor.", "synonyms": "Show, exhibit, explain with pictures" },
    { "id": "day3_opportunity", "dayId": "day3", "word": "Opportunity", "partOfSpeech": "n", "turkish": "Fırsat, şans, olanak", "exampleSentenceEN": "Electric cars offer a unique opportunity to cut both chemical and noise pollution.", "exampleSentenceTR": "Elektrikli otomobiller hem kimyasal hem de gürültü kirliliğini azaltmak için eşsiz bir fırsat sunuyor.", "synonyms": "Chance" },
    { "id": "day3_investigate", "dayId": "day3", "word": "Investigate", "partOfSpeech": "v", "turkish": "İncelemek, araştırmak", "exampleSentenceEN": "One of NASA's main aims in space travel is to investigate ways in which the body adjusts to life in space.", "exampleSentenceTR": "NASA'nın uzay yolculuğundaki başlıca amaçlarından biri, vücudun uzaydaki yaşama alışmasının yollarını araştırmaktır.", "synonyms": "Examine, look into, explore" },
    { "id": "day3_likelihood", "dayId": "day3", "word": "Likelihood", "partOfSpeech": "n", "turkish": "Olabilirlik, ihtimal", "exampleSentenceEN": "The likelihood that Proxima b is a transiting planet is very small.", "exampleSentenceTR": "Proxima b'nin geçiş yapan bir gezegen olma ihtimali çok düşüktür.", "synonyms": "Probability, possibility, prospect" },
    { "id": "day3_primitive", "dayId": "day3", "word": "Primitive", "partOfSpeech": "adj", "turkish": "İlkel, basit, eski çağa ait", "exampleSentenceEN": "Biologists value marine organisms because their primitive systems are good models for more complex organisms.", "exampleSentenceTR": "İlkel sistemleri daha karmaşık organizmalar için iyi modeller olduğundan biyologlar, deniz organizmalarına kıymet verirler.", "synonyms": "Simple, uncomplicated, ancient" },
    { "id": "day3_regulation", "dayId": "day3", "word": "Regulation", "partOfSpeech": "n", "turkish": "Kural, kaide, düzenleme", "exampleSentenceEN": "Some marine scientists believe fishing regulations are based on biased or inaccurate scientific data.", "exampleSentenceTR": "Bazı deniz bilimciler, balıkçılık düzenlemelerinin önyargılı veya yanlış bilimsel verilere dayandığına inanmaktadır.", "synonyms": "Rule, directive, guideline" },
    { "id": "day3_reason", "dayId": "day3", "word": "Reason", "partOfSpeech": "n", "turkish": "Neden, sebep", "exampleSentenceEN": "Part of the reason that gemstones reach high values is their rarity.", "exampleSentenceTR": "Değerli taşların yüksek değerlere ulaşmasının bir nedeni nadir olmalarıdır.", "synonyms": "Cause, basis" },
    { "id": "day3_especially", "dayId": "day3", "word": "Especially", "partOfSpeech": "adv", "turkish": "Özellikle, bilhassa", "exampleSentenceEN": "Hurricane Katrina became the moment of awakening, especially for national leaders, to reduce greenhouse gas emissions.", "exampleSentenceTR": "Katrina Kasırgası, sera gazı emisyonlarını azaltmak için özellikle ulusal liderlere uyanış anı olmuştur.", "synonyms": "Notably, particularly" },
    { "id": "day3_decade", "dayId": "day3", "word": "Decade", "partOfSpeech": "n", "turkish": "On yıl", "exampleSentenceEN": "For decades, nets have been the only method for controlling the mosquitoes.", "exampleSentenceTR": "On yıllardır, ağlar sivrisineklerin kontrolünde tek yöntem olmuştur.", "synonyms": "A ten year period" },
    { "id": "day3_purpose", "dayId": "day3", "word": "Purpose", "partOfSpeech": "n", "turkish": "Amaç, gaye", "exampleSentenceEN": "One of the most important purposes of environmental protection is the prevention of negative impacts on public health.", "exampleSentenceTR": "Çevrenin korunmasının en önemli amaçlarından biri, halk sağlığı üzerindeki olumsuz etkilerin önlenmesidir.", "synonyms": "Aim, target, goal, objective" },
    { "id": "day3_significantly", "dayId": "day3", "word": "Significantly", "partOfSpeech": "adv", "turkish": "Önemli ölçüde", "exampleSentenceEN": "The demand for energy sources that are lightweight and powerful has significantly increased in recent years.", "exampleSentenceTR": "Hafif ve güçlü enerji kaynakları talebi son yıllarda önemli ölçüde artmıştır.", "synonyms": "Substantially, considerably" },
    { "id": "day3_survey", "dayId": "day3", "word": "Survey", "partOfSpeech": "n", "turkish": "Araştırma, inceleme, anket", "exampleSentenceEN": "They recently completed the largest astronomical survey of the sky.", "exampleSentenceTR": "Son zamanlarda gökyüzünün en büyük astronomik araştırmasını tamamladılar.", "synonyms": "Review, study, examination, investigation, inspection" },
    { "id": "day3_detect", "dayId": "day3", "word": "Detect", "partOfSpeech": "v", "turkish": "Teşhis etmek, belirlemek, algılamak", "exampleSentenceEN": "Eyes can detect photons, the smallest quantum unit of an electromagnetic wave.", "exampleSentenceTR": "Gözler bir elektromanyetik dalganın en küçük kuantum birimi olan fotonları algılayabilir.", "synonyms": "Notice, identify, discover, perceive" },
    { "id": "day3_emerge", "dayId": "day3", "word": "Emerge", "partOfSpeech": "v", "turkish": "Ortaya çıkmak", "exampleSentenceEN": "Human-animal interactions enabled new viruses to emerge.", "exampleSentenceTR": "İnsan-hayvan etkileşimleri yeni virüslerin ortaya çıkmasına olanak sağladı.", "synonyms": "Come out, appear, come into view" },

    // ================= DAY 4 =================
    { "id": "day4_diverse", "dayId": "day4", "word": "Diverse", "partOfSpeech": "adj", "turkish": "Çeşitli, farklı", "exampleSentenceEN": "Research in the field of biology in recent years has yielded amazing knowledge about the human species and about thousands of other diverse life forms.", "exampleSentenceTR": "Son yıllarda biyoloji alanındaki araştırmalar, insan türüne ve diğer binlerce farklı yaşam biçimine ilişkin şaşırtıcı bilgiler ortaya koymuştur.", "synonyms": "Various, different" },
    { "id": "day4_pesticide", "dayId": "day4", "word": "Pesticide", "partOfSpeech": "n", "turkish": "Böcek ilacı", "exampleSentenceEN": "The pesticides that farmers use can also damage people's health.", "exampleSentenceTR": "Çiftçilerin kullandığı böcek ilaçları insanların sağlığına da zarar verebilir.", "synonyms": "Insecticide" },
    { "id": "day4_intensify", "dayId": "day4", "word": "Intensify", "partOfSpeech": "v", "turkish": "Yoğunlaştırmak, artırmak, güçlendirmek", "exampleSentenceEN": "Competition in the electric vehicle market is intensifying.", "exampleSentenceTR": "Elektrikli araç pazarındaki rekabet artıyor.", "synonyms": "Strengthen, escalate, step up, boost" },
    { "id": "day4_familiar", "dayId": "day4", "word": "Familiar", "partOfSpeech": "adj", "turkish": "Aşina, tanıdık", "exampleSentenceEN": "Probably every literate person is familiar with the famous relativity equation: E=mc2.", "exampleSentenceTR": "Muhtemelen her okuryazar kişi ünlü izafiyet denklemine aşinadır: E = mc2.", "synonyms": "Recognizable, acquainted" },
    { "id": "day4_particularly", "dayId": "day4", "word": "Particularly", "partOfSpeech": "adv", "turkish": "Özellikle, bilhassa", "exampleSentenceEN": "The pasteurization process is still used today, particularly for milk.", "exampleSentenceTR": "Pastörizasyon işlemi, bugün hâlâ kullanılmaktadır, bilhassa süt için.", "synonyms": "Especially, notably" },
    { "id": "day4_inadequate", "dayId": "day4", "word": "Inadequate", "partOfSpeech": "adj", "turkish": "Yetersiz, noksan, eksik", "exampleSentenceEN": "In underground mines, inadequate ventilation is the greatest hazard.", "exampleSentenceTR": "Yeraltı madenlerinde yetersiz havalandırma en büyük tehlikedir.", "synonyms": "Insufficient, scarce" },
    { "id": "day4_drift", "dayId": "day4", "word": "Drift", "partOfSpeech": "n", "turkish": "Sürüklenme, kayma", "exampleSentenceEN": "The theory of continental drift might have been accepted decades earlier.", "exampleSentenceTR": "Kıtasal kayma teorisi on yıllar önce kabul edilmiş olabilir.", "synonyms": "Float, flow, glide" },
    { "id": "day4_prevention", "dayId": "day4", "word": "Prevention", "partOfSpeech": "n", "turkish": "Koruma, önleme, engelleme", "exampleSentenceEN": "They have developed efficient technologies for the prevention of environmental pollution.", "exampleSentenceTR": "Çevre kirliliğinin önlenmesi için etkin teknolojiler geliştirdiler.", "synonyms": "Deterrence, inhibition, hindrance" },
    { "id": "day4_observation", "dayId": "day4", "word": "Observation", "partOfSpeech": "n", "turkish": "Gözlem, izleme", "exampleSentenceEN": "An astronomer must record celestial motions through careful observation.", "exampleSentenceTR": "Bir gökbilimci dikkatli gözlem ile göksel hareketleri kaydetmelidir.", "synonyms": "Scrutiny, watching, inspection" },
    { "id": "day4_demonstrate", "dayId": "day4", "word": "Demonstrate", "partOfSpeech": "v", "turkish": "Göstermek, ispatlamak", "exampleSentenceEN": "Manufacturers must demonstrate that their aircraft are capable of flying safely in cold and wet conditions.", "exampleSentenceTR": "İmalatçılar, uçaklarının soğuk ve ıslak koşullarda güvenli bir şekilde uçabileceğini göstermelidir.", "synonyms": "Display, show, prove" },
    { "id": "day4_compound", "dayId": "day4", "word": "Compound", "partOfSpeech": "n", "turkish": "Alaşım, bileşik", "exampleSentenceEN": "A compound is a substance containing two or more elements in a fixed ratio.", "exampleSentenceTR": "Bir bileşik, sabit bir oranda iki veya daha fazla element içeren bir maddedir.", "synonyms": "Mixture" },
    { "id": "day4_grow", "dayId": "day4", "word": "Grow", "partOfSpeech": "v", "turkish": "Büyümek, yetişmek, gelişmek", "exampleSentenceEN": "Genetic engineers are determined to grow crops in a shorter period of time.", "exampleSentenceTR": "Genetik mühendisleri, daha kısa sürede ürün yetiştirmeye kararlılar.", "synonyms": "Produce, develop" },
    { "id": "day4_harsh", "dayId": "day4", "word": "Harsh", "partOfSpeech": "adj", "turkish": "Sert, ağır, kaba", "exampleSentenceEN": "The 1997 Kyoto Protocol contains a set of extremely harsh sanctions on gas emissions.", "exampleSentenceTR": "1997 Kyoto Protokolü, gaz emisyonlarıyla ilgili son derece sert bir dizi yaptırımlar içeriyor.", "synonyms": "Severe, bleak, austere" },
    { "id": "day4_sample", "dayId": "day4", "word": "Sample", "partOfSpeech": "n", "turkish": "Numune, örnek", "exampleSentenceEN": "Duke University researchers analyzed each sample collected from 98 locations across North and South America for genetic variation.", "exampleSentenceTR": "Duke Üniversitesi araştırmacıları, genetik varyasyon için Kuzey ve Güney Amerika'daki 98 lokasyondan toplanan her bir numuneyi analiz etti.", "synonyms": "Example, tester, model" },
    { "id": "day4_discovery", "dayId": "day4", "word": "Discovery", "partOfSpeech": "n", "turkish": "Buluş, keşif", "exampleSentenceEN": "One of the great advances of astronomy over the past decade has been the discovery of planets outside our solar system.", "exampleSentenceTR": "Son on yılda gökbiliminin büyük ilerlemelerinden biri, güneş sistemimizin dışındaki gezegenlerin keşfedir.", "synonyms": "Detection, finding, unearthing" },
    { "id": "day4_eliminate", "dayId": "day4", "word": "Eliminate", "partOfSpeech": "v", "turkish": "Bertaraf etmek, ortadan kaldırmak, kurtulmak", "exampleSentenceEN": "Most governments have taken some precautions to eliminate environmental pollution.", "exampleSentenceTR": "Çoğu hükümet, çevre kirliliğini ortadan kaldırmak için bazı önlemler almıştır.", "synonyms": "Get rid of, remove, eradicate" },
    { "id": "day4_link", "dayId": "day4", "word": "Link", "partOfSpeech": "n", "turkish": "İlişki, bağ", "exampleSentenceEN": "Superfluid helium has profound mathematical links with the cosmos.", "exampleSentenceTR": "Süper akışkan helyum kozmos ile derin matematiksel bağlantılara sahiptir.", "synonyms": "Connection, relation, association, bond" },
    { "id": "day4_increase", "dayId": "day4", "word": "Increase", "partOfSpeech": "v", "turkish": "Artırmak, yükseltmek", "exampleSentenceEN": "Moon and Mars missions increased scientific knowledge about extraterrestrial bodies.", "exampleSentenceTR": "Ay ve Mars görevleri, dünya dışı cisimler hakkındaki bilimsel bilgiyi arttırdı.", "synonyms": "Boost, amplify, enhance" },
    { "id": "day4_outcome", "dayId": "day4", "word": "Outcome", "partOfSpeech": "n", "turkish": "Netice, sonuç", "exampleSentenceEN": "A significant outcome of air pollution is the high cost of cleanup and prevention.", "exampleSentenceTR": "Hava kirliliğinin önemli bir sonucu temizleme ve önleme maliyetinin yüksek olmasıdır.", "synonyms": "Consequence, result" },
    { "id": "day4_reliability", "dayId": "day4", "word": "Reliability", "partOfSpeech": "n", "turkish": "Güvenilirlik, tutarlılık", "exampleSentenceEN": "Some experts question the reliability of genetically modified food.", "exampleSentenceTR": "Bazı uzmanlar genetiği değiştirilmiş gıdaların güvenilirliğini sorguluyor.", "synonyms": "Dependability, consistency" },

    // ================= DAY 5 =================
    { "id": "day5_heighten", "dayId": "day5", "word": "Heighten", "partOfSpeech": "v", "turkish": "Artırmak, yükseltmek", "exampleSentenceEN": "Dwindling oil reserves and concerns about exhaust emissions have heightened the search for more sustainable sources.", "exampleSentenceTR": "Azalan petrol rezervleri ve egzoz emisyonlarıyla ilgili endişeler, daha sürdürülebilir kaynak arayışını artırmıştır.", "synonyms": "Intensify, amplify, increase, enhance" },
    { "id": "day5_gather", "dayId": "day5", "word": "Gather", "partOfSpeech": "v", "turkish": "Toplanmak, bir araya gelmek", "exampleSentenceEN": "Sharks gather at marine mammal habitats in California during autumn.", "exampleSentenceTR": "Köpekbalıkları, sonbaharda Kaliforniyadaki deniz memelileri yaşam alanlarında bir araya gelir.", "synonyms": "Get together, assemble" },
    { "id": "day5_desert", "dayId": "day5", "word": "Desert", "partOfSpeech": "n", "turkish": "Çöl", "exampleSentenceEN": "Many countries now suffer from the expansion of deserts.", "exampleSentenceTR": "Pekçok ülke şimdilerde çöllerin genişlemesinden muzdariptir.", "synonyms": "Wasteland, barren region" },
    { "id": "day5_layer", "dayId": "day5", "word": "Layer", "partOfSpeech": "n", "turkish": "Tabaka, katman", "exampleSentenceEN": "The atmosphere is an invisible layer of gases that envelops the Earth.", "exampleSentenceTR": "Atmosfer, Dünyayı saran görünmez bir gaz katmanıdır.", "synonyms": "Sheet, cover" },
    { "id": "day5_plausible", "dayId": "day5", "word": "Plausible", "partOfSpeech": "adj", "turkish": "Makul, akla yatkın", "exampleSentenceEN": "That the carbon molecules in the microbes come from methane is a plausible answer.", "exampleSentenceTR": "Mikropların içindeki karbon moleküllerinin metandan geldiği mantıklı bir cevaptır.", "synonyms": "Reasonable, sensible, logical" },
    { "id": "day5_contain", "dayId": "day5", "word": "Contain", "partOfSpeech": "v", "turkish": "İçermek, ihtiva etmek", "exampleSentenceEN": "The ashes of the burnt organic matter contain many minerals.", "exampleSentenceTR": "Yanmış organik maddenin külleri birçok mineral içerir.", "synonyms": "Hold, have, include" },
    { "id": "day5_policy", "dayId": "day5", "word": "Policy", "partOfSpeech": "n", "turkish": "Politika, hareket tarzı, plan", "exampleSentenceEN": "A significant policy change in management approaches is needed to prevent or reverse desertification.", "exampleSentenceTR": "Çölleşmeyi önlemek veya tersine çevirmek için yönetim yaklaşımlarında önemli bir hareket tarzı değişikliği gerekiyor.", "synonyms": "Course of action, strategy, plan" },
    { "id": "day5_menace", "dayId": "day5", "word": "Menace", "partOfSpeech": "n", "turkish": "Tehdit, korku", "exampleSentenceEN": "Fungi are a microscopic menace to global health and food security.", "exampleSentenceTR": "Mantarlar, küresel sağlık ve gıda güvenliği için mikroskopik bir tehdit oluşturmaktadır.", "synonyms": "Threat, danger, hazard, peril" },
    { "id": "day5_save", "dayId": "day5", "word": "Save", "partOfSpeech": "v", "turkish": "Kurtarmak, biriktirmek, korumak", "exampleSentenceEN": "Water recycling is reusing wastewater to save both energy and the environment.", "exampleSentenceTR": "Su geri dönüşümü hem enerjiyi hem de çevreyi korumak için atık suyu yeniden kullanmaktır.", "synonyms": "Protect, keep, hold" },
    { "id": "day5_combine", "dayId": "day5", "word": "Combine", "partOfSpeech": "v", "turkish": "Birleş(tir)mek, bir araya gelmek", "exampleSentenceEN": "The rise of sea levels, when combined with more intense storms in the future, would be a deadly combination.", "exampleSentenceTR": "Gelecekte daha şiddetli fırtınalarla birleştiğinde deniz seviyesinin yükselmesi ölümcül bir kombinasyon olacaktır.", "synonyms": "Unite, join, merge" },
    { "id": "day5_obtain", "dayId": "day5", "word": "Obtain", "partOfSpeech": "v", "turkish": "Edinmek, elde etmek, kazanmak", "exampleSentenceEN": "Explanation of the general causes of certain phenomena is obtained from experiments.", "exampleSentenceTR": "Bazı olguların genel nedenlerinin izahı deneylerden elde edilmiştir.", "synonyms": "Get hold of, gain, attain, acquire, achieve" },
    { "id": "day5_fume", "dayId": "day5", "word": "Fume", "partOfSpeech": "n", "turkish": "Duman, gaz", "exampleSentenceEN": "The lead from exhaust fumes is released into the atmosphere.", "exampleSentenceTR": "Egzoz gazı kaynaklı kurşun atmosfere salınır.", "synonyms": "Emission, smoke, gas" },
    { "id": "day5_strict", "dayId": "day5", "word": "Strict", "partOfSpeech": "adj", "turkish": "Katı, sıkı, sert", "exampleSentenceEN": "Strict training methods allow the human body to adapt to space.", "exampleSentenceTR": "Sıkı eğitim yöntemleri, insan vücudunun uzaya uyum sağlamasına olanak sağlar.", "synonyms": "Harsh, firm, severe" },
    { "id": "day5_improve", "dayId": "day5", "word": "Improve", "partOfSpeech": "v", "turkish": "İyileştirmek, geliştirmek", "exampleSentenceEN": "More research and development initiatives are required to improve a design.", "exampleSentenceTR": "Bir tasarımı iyileştirmek için daha fazla araştırma ve geliştirme girişimi gerekmektedir.", "synonyms": "Get better, enhance, advance" },
    { "id": "day5_determine", "dayId": "day5", "word": "Determine", "partOfSpeech": "v", "turkish": "Saptamak, belirlemek", "exampleSentenceEN": "The origin of the Himalayas is difficult to determine due to changes in the composition of its rocks.", "exampleSentenceTR": "Kayaların bileşimindeki değişiklikler nedeniyle Himalayaların kökenini belirlemek zordur.", "synonyms": "Find out, verify, ascertain, uncover" },
    { "id": "day5_relatively", "dayId": "day5", "word": "Relatively", "partOfSpeech": "adv", "turkish": "Nispeten, oranla", "exampleSentenceEN": "Since Viking Mission, humans have done relatively little to advance the crewed exploration of space.", "exampleSentenceTR": "Viking Görevinden bu yana, insanlar mürettebatlı uzay araştırmalarını geliştirmek için nispeten az şey yapmışlardır.", "synonyms": "Comparatively, moderately" },
    { "id": "day5_mild", "dayId": "day5", "word": "Mild", "partOfSpeech": "adj", "turkish": "Ilıman, hafif, yumuşak", "exampleSentenceEN": "H7N9 causes severe disease in people but only mild in poultry.", "exampleSentenceTR": "H7N9 insanlarda ağır hastalığa neden olur, ancak tavuklarda hafiftir.", "synonyms": "Slight, minor, unimportant" },
    { "id": "day5_affect", "dayId": "day5", "word": "Affect", "partOfSpeech": "v", "turkish": "Etkilemek, tesir etmek", "exampleSentenceEN": "The change in temperature distribution in the Arctic would also affect ocean currents.", "exampleSentenceTR": "Arktik sıcaklık dağılımındaki değişim, okyanus akıntılarını da etkiler.", "synonyms": "Influence, impact" },
    { "id": "day5_currently", "dayId": "day5", "word": "Currently", "partOfSpeech": "adv", "turkish": "Şuan, mevcut durumda", "exampleSentenceEN": "Biofuels are currently produced from crops such as corn and sugar cane.", "exampleSentenceTR": "Biyoyakıtlar şu anda mısır ve şeker kamışı gibi ürünlerden üretilmektedir.", "synonyms": "At present, now, at this time, presently" },
    { "id": "day5_evaluate", "dayId": "day5", "word": "Evaluate", "partOfSpeech": "v", "turkish": "Kıymetlendirmek, değerlendirmek", "exampleSentenceEN": "Every computer user should evaluate his or her situation in regard to upgrades.", "exampleSentenceTR": "Her bilgisayar kullanıcısı, güncellemelerle ilgili durumunu değerlendirmelidir.", "synonyms": "Assess, appraise" },
];

// ---------- Day definitions ----------
const DAY_DEFINITIONS: { id: string; label: string; wordIds: string[] }[] = [
    {
        id: "day1", label: "Gün 1",
        wordIds: ["day1_necessary", "day1_occur", "day1_penetrate", "day1_supply", "day1_matter", "day1_launch", "day1_influence", "day1_growth", "day1_flexibility", "day1_eventually", "day1_useful", "day1_magnify", "day1_formerly", "day1_vague", "day1_enable", "day1_vanish", "day1_wilderness", "day1_enhance", "day1_celestial", "day1_extinction"]
    },
    {
        id: "day2", label: "Gün 2",
        wordIds: ["day2_gain", "day2_initially", "day2_pursue", "day2_reasonable", "day2_state", "day2_prove", "day2_discard", "day2_knowledge", "day2_precaution", "day2_repair", "day2_primary", "day2_reduce", "day2_disease", "day2_accessible", "day2_agriculture", "day2_annual", "day2_recommend", "day2_vary", "day2_approximately", "day2_principle"]
    },
    {
        id: "day3", label: "Gün 3",
        wordIds: ["day3_monitor", "day3_scarce", "day3_fluctuation", "day3_product", "day3_invent", "day3_exceptional", "day3_illustrate", "day3_opportunity", "day3_investigate", "day3_likelihood", "day3_primitive", "day3_regulation", "day3_reason", "day3_especially", "day3_decade", "day3_purpose", "day3_significantly", "day3_survey", "day3_detect", "day3_emerge"]
    },
    {
        id: "day4", label: "Gün 4",
        wordIds: ["day4_diverse", "day4_pesticide", "day4_intensify", "day4_familiar", "day4_particularly", "day4_inadequate", "day4_drift", "day4_prevention", "day4_observation", "day4_demonstrate", "day4_compound", "day4_grow", "day4_harsh", "day4_sample", "day4_discovery", "day4_eliminate", "day4_link", "day4_increase", "day4_outcome", "day4_reliability"]
    },
    {
        id: "day5", label: "Gün 5",
        wordIds: ["day5_heighten", "day5_gather", "day5_desert", "day5_layer", "day5_plausible", "day5_contain", "day5_policy", "day5_menace", "day5_save", "day5_combine", "day5_obtain", "day5_fume", "day5_strict", "day5_improve", "day5_determine", "day5_relatively", "day5_mild", "day5_affect", "day5_currently", "day5_evaluate"]
    },
];

// ---------- Auto-generate full VocabWord objects with defaults ----------
const generateInitialWords = (): VocabWord[] => {
    const now = Date.now();
    return RAW_WORDS.map(raw => ({
        ...raw,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        dueDate: now,
        flashcardScore: null,
        matchSynonymScore: null,
        matchTurkishScore: null,
        testSynonymScore: null,
        testTurkishScore: null,
    }));
};

// ---------- Build initial AppState ----------
const defaultActivityState: ActivityState = { completedOnce: false };

const buildDay = (def: typeof DAY_DEFINITIONS[0]): StudyDay => ({
    id: def.id,
    label: def.label,
    wordIds: def.wordIds,
    activities: {
        flashcard: { ...defaultActivityState },
        matchSynonym: { ...defaultActivityState },
        matchTurkish: { ...defaultActivityState },
        testSynonym: { ...defaultActivityState },
        testTurkish: { ...defaultActivityState },
    },
});

export const getInitialAppState = (): AppState => ({
    days: DAY_DEFINITIONS.map(buildDay),
    words: generateInitialWords(),
    streak: 0,
    lastStudiedDate: "",
});

/** Exported for use by the migration function in store.ts */
export { buildDay, DAY_DEFINITIONS, defaultActivityState, generateInitialWords, RAW_WORDS };

