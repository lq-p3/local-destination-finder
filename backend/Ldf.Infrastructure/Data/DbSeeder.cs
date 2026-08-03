using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Ldf.Core.Entities;

namespace Ldf.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(LdfDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        // 1. Seed Roles
        var roles = new[] { "admin", "user", "guide", "office", "provider" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // 2. Seed Users
        var seedUsers = new[]
        {
            new { Id = "admin_user", Email = "admin@ldf.com", Name = "System Admin", Role = "admin", Points = 500, Badges = "[\"Platform Admin\"]" },
            new { Id = "user_sarah", Email = "sarah.travels@example.com", Name = "Sarah Al-Fahad", Role = "user", Points = 380, Badges = "[\"Trusted Contributor\"]" },
            new { Id = "guide_abdullah", Email = "abdullah.guide@example.com", Name = "Abdullah Al-Asiri", Role = "guide", Points = 150, Badges = "[\"Certified Guide\"]" },
            new { Id = "office_tours", Email = "horizon.travels@example.com", Name = "Saudi Horizon Travel", Role = "office", Points = 200, Badges = "[\"Verified Agency\"]" }
        };

        foreach (var u in seedUsers)
        {
            var existingUser = await userManager.FindByEmailAsync(u.Email);
            if (existingUser == null)
            {
                var newUser = new User
                {
                    Id = u.Id,
                    UserName = u.Email,
                    Email = u.Email,
                    Name = u.Name,
                    Points = u.Points,
                    BadgesJson = u.Badges,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(newUser, "Pass@123456");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(newUser, u.Role);
                }
            }
        }

        // 3. Seed Image Metadata
        var seedImages = new List<ImageMetadata>
        {
            new ImageMetadata { Id = "img_riyadh_night", ImageUrl = "/riyadh_night.png", ThumbnailUrl = "/riyadh_night.png", AltTextAr = "الرياض ليلاً", AltTextEn = "Riyadh skyline at night", Photographer = "Saudi Tourism", Source = "Visit Saudi", License = "CC-BY" },
            new ImageMetadata { Id = "img_abha_jacaranda", ImageUrl = "/abha_jacaranda.jpg", ThumbnailUrl = "/abha_jacaranda.jpg", AltTextAr = "شارع الفن بأبها مع زهور الجاكاراندا البنفسجية", AltTextEn = "Abha Art Street covered with purple jacaranda blossoms", Photographer = "Visit Saudi", Source = "Visit Saudi Portal", License = "CC-BY" },
            new ImageMetadata { Id = "img_alula_hegra", ImageUrl = "/alula_hegra.jpg", ThumbnailUrl = "/alula_hegra.jpg", AltTextAr = "موقع الحجر الأثري في العلا", AltTextEn = "Hegra Archaeological UNESCO Site in AlUla", Photographer = "Experience AlUla", Source = "RCU Media Gallery", License = "CC-BY" },
            new ImageMetadata { Id = "img_jeddah_balad", ImageUrl = "/jeddah_corniche.jpg", ThumbnailUrl = "/jeddah_corniche.jpg", AltTextAr = "كورنيش جدة التاريخي", AltTextEn = "Jeddah seafront and historic district", Photographer = "Jeddah Season", Source = "Visit Saudi", License = "CC-BY" },
            new ImageMetadata { Id = "img_taif_shafa", ImageUrl = "https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=2000&q=80", ThumbnailUrl = "https://images.unsplash.com/photo-1632731057400-f925c4efc587?auto=format&fit=crop&w=200&q=80", AltTextAr = "مرتفعات الشفا بالطائف", AltTextEn = "Al Shafa mountains in Taif", Photographer = "Taif Tourism", Source = "Unsplash", License = "Unsplash License" },
            new ImageMetadata { Id = "img_neom_trojena", ImageUrl = "https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=2000&q=80", ThumbnailUrl = "https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=200&q=80", AltTextAr = "جبال تروجينا الثلجية بنيوم", AltTextEn = "NEOM Trojena winter snow mountains", Photographer = "NEOM Gallery", Source = "NEOM Media Kit", License = "NEOM Editorial" },
            new ImageMetadata { Id = "img_hotel_riyadh_ritz", ImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", ThumbnailUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80", AltTextAr = "فندق الريتز كارلتون الرياض", AltTextEn = "The Ritz-Carlton Hotel Riyadh exterior", Photographer = "Ritz Media", Source = "Ritz Press Office", License = "Editorial" },
            new ImageMetadata { Id = "img_hotel_jeddah_hilton", ImageUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", ThumbnailUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=200&q=80", AltTextAr = "فندق والدورف أستوريا جدة قصر الشرق", AltTextEn = "Waldorf Astoria Jeddah Qasr Al Sharq lobby", Photographer = "Hilton PR", Source = "Hilton Media", License = "Editorial" },
            new ImageMetadata { Id = "img_rest_riyadh_najd", ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", ThumbnailUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80", AltTextAr = "القرية النجدية بالرياض مطعم شعبي", AltTextEn = "Najd Village traditional dining setup", Photographer = "Najd Village", Source = "Najd Village Web", License = "Fair Use" }
        };

        foreach (var img in seedImages)
        {
            if (!context.ImageMetadata.Any(i => i.Id == img.Id))
            {
                context.ImageMetadata.Add(img);
            }
        }
        await context.SaveChangesAsync();

        // 4. Seed 13 Administrative Regions of Saudi Arabia
        var seedRegions = new List<Region>
        {
            new Region { Id = "riyadh_region", Slug = "riyadh", NameEn = "Riyadh Region", NameAr = "منطقة الرياض", CoverImageId = "img_riyadh_night", DescriptionEn = "The capital and financial heart of Saudi Arabia, home to Diriyah UNESCO heritage site, Boulevard World, and Edge of the World.", DescriptionAr = "عاصمة المملكة وقلبها المالي والتاريخي، موطن الدرعية التراثية وبوليفارد وورلد وحافة العالم.", BestTimeToVisitEn = "October to March", BestTimeToVisitAr = "من أكتوبر إلى مارس", Latitude = 24.7136, Longitude = 46.6753 },
            new Region { Id = "makkah_region", Slug = "makkah", NameEn = "Makkah Al-Mukarramah Region", NameAr = "منطقة مكة المكرمة", CoverImageId = "img_jeddah_balad", DescriptionEn = "Home to the Holy City of Makkah, historical Al-Balad in Jeddah along the Red Sea, and mountain retreats in Taif.", DescriptionAr = "موطن مكة المكرمة وجدة التاريخية (البلد) على البحر الأحمر والمنتجعات الجبلية في الطائف.", BestTimeToVisitEn = "November to April", BestTimeToVisitAr = "من نوفمبر إلى أبريل", Latitude = 21.4225, Longitude = 39.8262 },
            new Region { Id = "madinah_region", Slug = "madinah", NameEn = "Al-Madinah Al-Munawwarah Region", NameAr = "منطقة المدينة المنورة", CoverImageId = "img_alula_hegra", DescriptionEn = "Home to Al-Madinah, the Prophet's Mosque, and the world-famous UNESCO Hegra tombs in ancient AlUla.", DescriptionAr = "موطن المسجد النبوي الشريف في المدينة المنورة ومقابر الحجر الأثرية العالمية بالعلا.", BestTimeToVisitEn = "October to April", BestTimeToVisitAr = "من أكتوبر إلى أبريل", Latitude = 24.5247, Longitude = 39.5692 },
            new Region { Id = "qassim_region", Slug = "qassim", NameEn = "Al-Qassim Region", NameAr = "منطقة القصيم", CoverImageId = "img_riyadh_night", DescriptionEn = "Saudi Arabia's agricultural jewel, renowned for vast palm groves, historical date markets, and rich culinary heritage.", DescriptionAr = "واحة الزراعة بالمملكة، تفتخر بمزارع النخيل الشاسعة وأكبر سوق للتمور بالعالم والتراث الغني.", BestTimeToVisitEn = "November to March", BestTimeToVisitAr = "من نوفمبر إلى مارس", Latitude = 26.3260, Longitude = 43.9750 },
            new Region { Id = "eastern_region", Slug = "eastern-province", NameEn = "Eastern Province", NameAr = "المنطقة الشرقية", CoverImageId = "img_jeddah_balad", DescriptionEn = "Bordering the Arabian Gulf, featuring Dammam corniche, Khobar waterfront, and Al-Ahsa Oasis UNESCO palm groves.", DescriptionAr = "تطل على الخليج العربي، وتتميز بكورنيش الدمام والخبر وواحة الأحساء التراثية العالمية.", BestTimeToVisitEn = "November to April", BestTimeToVisitAr = "من نوفمبر إلى أبريل", Latitude = 26.4207, Longitude = 50.0888 },
            new Region { Id = "aseer_region", Slug = "aseer", NameEn = "Aseer Region", NameAr = "منطقة عسير", CoverImageId = "img_abha_jacaranda", DescriptionEn = "A mountainous green paradise famous for high Soodah peaks, fog-draped scenery, purple jacaranda trees, and Rijal Almaa heritage.", DescriptionAr = "جنة خضراء جبلية تشتهر بقمم السودة العالية، ومناظر الضباب وأشجار الجاكاراندا وقرية رجال ألمع التراثية.", BestTimeToVisitEn = "June to September", BestTimeToVisitAr = "من يونيو إلى سبتمبر", Latitude = 18.2164, Longitude = 42.5053 },
            new Region { Id = "tabuk_region", Slug = "tabuk", NameEn = "Tabuk Region", NameAr = "منطقة تبوك", CoverImageId = "img_neom_trojena", DescriptionEn = "Gateway to NEOM, Trojena snowy peaks, Wadi Al-Disah, and pristine Red Sea turquoise waters.", DescriptionAr = "بوابة نيوم وقمم تروجينا الثلجية ووادي الديسة الخلاب وشواطئ البحر الأحمر الفيروزية.", BestTimeToVisitEn = "October to April", BestTimeToVisitAr = "من أكتوبر إلى أبريل", Latitude = 28.3835, Longitude = 36.5662 },
            new Region { Id = "hail_region", Slug = "hail", NameEn = "Hail Region", NameAr = "منطقة حائل", CoverImageId = "img_alula_hegra", DescriptionEn = "Land of generous hospitality, UNESCO Jubbah desert rock art, and dramatic granite mountain landscapes.", DescriptionAr = "أرض الكرم والضيافة، وتضم الفنون الصخرية النادرة في جبة المسجلة باليونسكو وجبال أجا وسلمى.", BestTimeToVisitEn = "October to March", BestTimeToVisitAr = "من أكتوبر إلى مارس", Latitude = 27.5219, Longitude = 41.6961 },
            new Region { Id = "northern_borders_region", Slug = "northern-borders", NameEn = "Northern Borders Region", NameAr = "منطقة الحدود الشمالية", CoverImageId = "img_riyadh_night", DescriptionEn = "Expansive northern plains, falconry culture, and historical migratory bird havens around Arar and Turaif.", DescriptionAr = "سهول الشمال الفسيحة، مهد الصقارة ورحلات التخييم البري ومحميات الصيد الطبيعية.", BestTimeToVisitEn = "November to March", BestTimeToVisitAr = "من نوفمبر إلى مارس", Latitude = 30.9753, Longitude = 41.0381 },
            new Region { Id = "jazan_region", Slug = "jazan", NameEn = "Jazan Region", NameAr = "منطقة جازان", CoverImageId = "img_abha_jacaranda", DescriptionEn = "Tropical southwestern coast, Farasan Islands coral reefs, coffee farms in Feyfa mountains, and mango orchards.", DescriptionAr = "الساحل الاستوائي الجنوبي الغربي، جزر فرسان المرجانية والمزارع الجبلية ومهرجان المانجو.", BestTimeToVisitEn = "November to March", BestTimeToVisitAr = "من نوفمبر إلى مارس", Latitude = 16.8892, Longitude = 42.5511 },
            new Region { Id = "najran_region", Slug = "najran", NameEn = "Najran Region", NameAr = "منطقة نجران", CoverImageId = "img_alula_hegra", DescriptionEn = "Ancient southern oasis famous for Hima Cultural Area UNESCO petroglyphs, mud-brick palaces, and citrus farms.", DescriptionAr = "واحة الجنوب العريقة المشهورة بنقوش حمى الثقافية وقصور الطين التراثية ومزارع الحمضيات.", BestTimeToVisitEn = "October to March", BestTimeToVisitAr = "من أكتوبر إلى مارس", Latitude = 17.4924, Longitude = 44.1277 },
            new Region { Id = "albahah_region", Slug = "albahah", NameEn = "Al Bahah Region", NameAr = "منطقة الباحة", CoverImageId = "img_abha_jacaranda", DescriptionEn = "Cloud-draped mountain paradise, Zee Aine marble village, dense juniper forests, and ancient watchtowers.", DescriptionAr = "عروس الجبال المكسوة بالضباب، قرية ذي عين الرخامية وغابات رغدان ومدرجاتها الخضراء.", BestTimeToVisitEn = "May to October", BestTimeToVisitAr = "من مايو إلى أكتوبر", Latitude = 20.0129, Longitude = 41.4677 },
            new Region { Id = "aljouf_region", Slug = "aljouf", NameEn = "Al Jouf Region", NameAr = "منطقة الجوف", CoverImageId = "img_riyadh_night", DescriptionEn = "The olive capital of the Kingdom, featuring Za'abal Castle, Marid Castle in Dumat Al-Jandal, and vast olive groves.", DescriptionAr = "عاصمة الزيتون بالمملكة، وتضم قلعة مارد بحيرة دومة الجندل وقلعة زعبل الأثرية.", BestTimeToVisitEn = "October to March", BestTimeToVisitAr = "من أكتوبر إلى مارس", Latitude = 29.9697, Longitude = 40.2064 }
        };

        foreach (var r in seedRegions)
        {
            if (!context.Regions.Any(reg => reg.Id == r.Id))
            {
                context.Regions.Add(r);
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed Cities
        var seedCities = new List<City>
        {
            new City
            {
                Id = "riyadh",
                RegionId = "central_region",
                NameEn = "Riyadh",
                NameAr = "الرياض",
                CoverImageId = "img_riyadh_night",
                DescriptionEn = "The dynamic capital city where heritage meets ultra-modernity.",
                DescriptionAr = "العاصمة الديناميكية حيث يلتقي التراث مع الحداثة الفائقة.",
                Latitude = 24.7136,
                Longitude = 46.6753,
                Temp = 28,
                WeatherStatusEn = "Clear Sky",
                WeatherStatusAr = "سماء صافية",
                WindSpeed = 12.0
            },
            new City
            {
                Id = "abha",
                RegionId = "aseer_region",
                NameEn = "Abha",
                NameAr = "أبها",
                CoverImageId = "img_abha_jacaranda",
                DescriptionEn = "High altitude resort city offering cooler climate and mountainous views.",
                DescriptionAr = "مدينة جبلية مرتفعة تتميز بطقس بارد وإطلالات طبيعية خلابة.",
                Latitude = 18.2171,
                Longitude = 42.5053,
                Temp = 18,
                WeatherStatusEn = "Foggy",
                WeatherStatusAr = "ضبابي",
                WindSpeed = 8.5
            },
            new City
            {
                Id = "alula",
                RegionId = "western_region",
                NameEn = "AlUla",
                NameAr = "العلا",
                CoverImageId = "img_alula_hegra",
                DescriptionEn = "A living open-air museum of historic tombs and sandstone canyons.",
                DescriptionAr = "متحف مفتوح للمقابر الأثرية والتكوينات الصخرية الرملية الفريدة.",
                Latitude = 26.6167,
                Longitude = 37.9167,
                Temp = 24,
                WeatherStatusEn = "Sunny",
                WeatherStatusAr = "مشمس",
                WindSpeed = 10.0
            },
            new City
            {
                Id = "jeddah",
                RegionId = "western_region",
                NameEn = "Jeddah",
                NameAr = "جدة",
                CoverImageId = "img_jeddah_balad",
                DescriptionEn = "Historic port city serving as the gateway to Mecca, famous for its historic architecture.",
                DescriptionAr = "بوابة البحر الأحمر التاريخية، تتميز بأسواقها ومبانيها التراثية الفريدة.",
                Latitude = 21.5433,
                Longitude = 39.1728,
                Temp = 32,
                WeatherStatusEn = "Humid",
                WeatherStatusAr = "رطب",
                WindSpeed = 15.0
            },
            new City
            {
                Id = "taif",
                RegionId = "aseer_region",
                NameEn = "Taif",
                NameAr = "الطائف",
                CoverImageId = "img_taif_shafa",
                DescriptionEn = "The Rose City of Saudi Arabia, perched on the mountains of Hejaz.",
                DescriptionAr = "مدينة الورود، تقع على جبال الحجاز وتشتهر بطبيعتها وطقسها الجميل.",
                Latitude = 21.2854,
                Longitude = 40.4244,
                Temp = 22,
                WeatherStatusEn = "Cool Breeze",
                WeatherStatusAr = "نسيم بارد",
                WindSpeed = 11.0
            },
            new City
            {
                Id = "neom",
                RegionId = "western_region",
                NameEn = "NEOM",
                NameAr = "نيوم",
                CoverImageId = "img_neom_trojena",
                DescriptionEn = "The land of the future, spanning snowy mountains to pristine Red Sea coasts.",
                DescriptionAr = "أرض المستقبل الواعدة، تمتد من جبال الثلوج إلى سواحل البحر الأحمر.",
                Latitude = 28.2800,
                Longitude = 34.6200,
                Temp = 26,
                WeatherStatusEn = "Breezy",
                WeatherStatusAr = "عليل",
                WindSpeed = 14.0
            }
        };

        foreach (var c in seedCities)
        {
            if (!context.Cities.Any(city => city.Id == c.Id))
            {
                context.Cities.Add(c);
            }
        }
        await context.SaveChangesAsync();

        // 6. Seed Destinations
        var seedDestinations = new List<Destination>
        {
            new Destination
            {
                Id = "riyadh_masmak",
                CityId = "riyadh",
                NameEn = "Al Masmak Palace Museum",
                NameAr = "متحف قصر المصمك",
                Category = "Historical",
                Rating = 4.8,
                ReviewsCount = 1420,
                MainImageId = "img_riyadh_night",
                DescriptionEn = "A clay and mud-brick fort in the old city of Riyadh, which played a pivotal role in the unification of Saudi Arabia.",
                DescriptionAr = "حصن طيني سميك في وسط مدينة الرياض القديمة، لعب دوراً محورياً في توحيد المملكة العربية السعودية.",
                Latitude = 24.6312,
                Longitude = 46.7134,
                WorkingHoursEn = "08:00 AM - 09:00 PM",
                WorkingHoursAr = "08:00 ص - 09:00 م",
                EntryFees = 0,
                Phone = "+966114110091",
                Email = "info@masmak.sa",
                PriceLevel = "$",
                ServicesEnJson = "[\"Audio Guides\", \"Exhibits Hall\", \"Souvenir Shop\", \"Restrooms\"]",
                ServicesArJson = "[\"أجهزة إرشاد صوتي\", \"قاعات عرض\", \"متجر هدايا\", \"دورات مياه\"]",
                FamiliesSuitability = true,
                KidsSuitability = true,
                ElderlySuitability = true,
                DisabledSuitability = true,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "Current location",
                DistanceAr = "الموقع الحالي"
            },
            new Destination
            {
                Id = "abha_jacaranda",
                CityId = "abha",
                NameEn = "Art Street & Jacaranda Valley",
                NameAr = "شارع الفن ووادي الجاكاراندا",
                Category = "Nature",
                Rating = 4.7,
                ReviewsCount = 856,
                MainImageId = "img_abha_jacaranda",
                DescriptionEn = "A magical avenue lined with purple jacaranda trees that bloom beautifully during spring and summer months.",
                DescriptionAr = "شارع ساحر تحفه أشجار الجاكاراندا البنفسجية التي تتفتح بشكل رائع خلال أشهر الربيع والصيف.",
                Latitude = 18.2185,
                Longitude = 42.5020,
                WorkingHoursEn = "24/7",
                WorkingHoursAr = "على مدار الساعة",
                EntryFees = 0,
                Phone = "",
                Email = "",
                PriceLevel = "$",
                ServicesEnJson = "[\"Cafes & Restaurants\", \"Benches\", \"Art Galleries\", \"Pedestrian Walkway\"]",
                ServicesArJson = "[\"مقاهي ومطاعم\", \"مقاعد للجلوس\", \"معارض فنية\", \"ممشى مشاة\"]",
                FamiliesSuitability = true,
                KidsSuitability = true,
                ElderlySuitability = true,
                DisabledSuitability = true,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "2 hr flight",
                DistanceAr = "رحلة طيران ساعتين"
            },
            new Destination
            {
                Id = "alula_hegra",
                CityId = "alula",
                NameEn = "Hegra (Mada’in Salih)",
                NameAr = "الحجر (مدائن صالح)",
                Category = "Historical",
                Rating = 4.9,
                ReviewsCount = 1240,
                MainImageId = "img_alula_hegra",
                DescriptionEn = "The first UNESCO World Heritage site in Saudi Arabia, boasting 111 monumental tombs carved into sandstone rocks.",
                DescriptionAr = "أول موقع للتراث العالمي لليونسكو في المملكة العربية السعودية، ويضم 111 مقبرة أثرية ضخمة منحوتة في صخور الحجر الرملي.",
                Latitude = 26.7900,
                Longitude = 37.9500,
                WorkingHoursEn = "09:00 AM - 05:00 PM",
                WorkingHoursAr = "09:00 ص - 05:00 م",
                EntryFees = 95,
                Phone = "+966920025000",
                Email = "info@rcu.gov.sa",
                PriceLevel = "$$",
                ServicesEnJson = "[\"Guided Tours\", \"Shuttle Buses\", \"Restrooms\", \"Visitor Center\"]",
                ServicesArJson = "[\"جولات سياحية\", \"حافلات ترددية\", \"دورات مياه\", \"مركز الزوار\"]",
                FamiliesSuitability = true,
                KidsSuitability = true,
                ElderlySuitability = true,
                DisabledSuitability = false,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "3 hr flight",
                DistanceAr = "رحلة طيران ٣ ساعات"
            },
            new Destination
            {
                Id = "jeddah_balad",
                CityId = "jeddah",
                NameEn = "Historic Jeddah (Al-Balad)",
                NameAr = "جدة التاريخية (البلد)",
                Category = "Historical",
                Rating = 4.6,
                ReviewsCount = 2150,
                MainImageId = "img_jeddah_balad",
                DescriptionEn = "Fascinating ancient residential block characterized by unique Roshan wooden windows and authentic historic houses.",
                DescriptionAr = "منطقة سكنية قديمة ورائعة تتميز بنوافذ الروشان الخشبية الفريدة والبيوت التاريخية الأصيلة.",
                Latitude = 21.4820,
                Longitude = 39.1865,
                WorkingHoursEn = "04:00 PM - 11:00 PM",
                WorkingHoursAr = "04:00 م - 11:00 م",
                EntryFees = 0,
                Phone = "",
                Email = "info@jeddahalbalad.sa",
                PriceLevel = "$$",
                ServicesEnJson = "[\"Bazaar Markets\", \"Local Cafes\", \"Heritage Hotels\", \"Guided Golf Carts\"]",
                ServicesArJson = "[\"أسواق شعبية\", \"مقاهي محلية\", \"فنادق تراثية\", \"عربات غولف بإرشاد\"]",
                FamiliesSuitability = true,
                KidsSuitability = true,
                ElderlySuitability = false,
                DisabledSuitability = false,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "1.5 hr flight",
                DistanceAr = "رحلة طيران ساعة ونصف"
            },
            new Destination
            {
                Id = "taif_shafa",
                CityId = "taif",
                NameEn = "Al Shafa Mountain View",
                NameAr = "جبل الشفا المفتوح",
                Category = "Mountains",
                Rating = 4.5,
                ReviewsCount = 620,
                MainImageId = "img_taif_shafa",
                DescriptionEn = "Famous for its pleasant weather, fragrant rose farms, and scenic winding mountain roads.",
                DescriptionAr = "تشتهر بطقسها اللطيف ومزارع الورود العطرة والطرق الجبلية المتعرجة الخلابة.",
                Latitude = 21.2854,
                Longitude = 40.4244,
                WorkingHoursEn = "24/7",
                WorkingHoursAr = "على مدار الساعة",
                EntryFees = 0,
                Phone = "",
                Email = "",
                PriceLevel = "$",
                ServicesEnJson = "[\"Viewpoints\", \"Cafes\", \"Hiking Paths\"]",
                ServicesArJson = "[\"مطلات طبيعية\", \"مقاهي\", \"مسارات مشي\"]",
                FamiliesSuitability = true,
                KidsSuitability = true,
                ElderlySuitability = true,
                DisabledSuitability = false,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "2.5 hr drive",
                DistanceAr = "٢.٥ ساعة بالسيارة"
            },
            new Destination
            {
                Id = "neom_trojena",
                CityId = "neom",
                NameEn = "Trojena Snow Mountain",
                NameAr = "تروجينا نيوم",
                Category = "Adventure",
                Rating = 4.9,
                ReviewsCount = 412,
                MainImageId = "img_neom_trojena",
                DescriptionEn = "NEOM ski resort and outdoor mountain destination in Trojena.",
                DescriptionAr = "مركز تزلج نيوم الجبلي الشهير في مرتفعات تروجينا.",
                Latitude = 28.2800,
                Longitude = 34.6200,
                WorkingHoursEn = "08:00 AM - 08:00 PM",
                WorkingHoursAr = "08:00 ص - 08:00 م",
                EntryFees = 150,
                Phone = "",
                Email = "",
                PriceLevel = "$$$",
                ServicesEnJson = "[\"Ski Slopes\", \"Luxury Lodging\", \"Guided Sports\"]",
                ServicesArJson = "[\"منحدرات تزلج\", \"سكن فاخر\", \"رياضات بإرشاد\"]",
                FamiliesSuitability = true,
                KidsSuitability = false,
                ElderlySuitability = false,
                DisabledSuitability = false,
                Status = "Published",
                SubmittedBy = "admin_user",
                DistanceEn = "2 hr flight",
                DistanceAr = "رحلة طيران ساعتين"
            }
        };

        foreach (var dest in seedDestinations)
        {
            if (!context.Destinations.Any(d => d.Id == dest.Id))
            {
                context.Destinations.Add(dest);
            }
        }
        await context.SaveChangesAsync();

        // 7. Seed Hotels
        var seedHotels = new List<Hotel>
        {
            new Hotel
            {
                Id = "hotel_riyadh_ritz",
                CityId = "riyadh",
                NameEn = "The Ritz-Carlton, Riyadh",
                NameAr = "الريتز كارلتون، الرياض",
                Stars = 5,
                Rating = 4.9,
                MainImageId = "img_hotel_riyadh_ritz",
                PriceRange = "SAR 1500 - 3000",
                AddressEn = "Makkah Al Mukarramah Rd, Al Hada District, Riyadh",
                AddressAr = "طريق مكة المكرمة، حي الهدا، الرياض",
                Phone = "+966118028020",
                Website = "https://www.ritzcarlton.com",
                DescriptionEn = "A majestic palace hotel nestled in 52 acres of landscaped gardens.",
                DescriptionAr = "فندق قصر مهيب يقع وسط 52 فداناً من الحدائق المنسقة.",
                ExternalBookingUrl = "https://booking.com/ritz-riyadh"
            },
            new Hotel
            {
                Id = "hotel_jeddah_hilton",
                CityId = "jeddah",
                NameEn = "Waldorf Astoria Jeddah - Qasr Al Sharq",
                NameAr = "قصر الشرق - والدورف أستوريا جدة",
                Stars = 5,
                Rating = 4.8,
                MainImageId = "img_hotel_jeddah_hilton",
                PriceRange = "SAR 1200 - 2500",
                AddressEn = "North Corniche Road, Jeddah",
                AddressAr = "طريق الكورنيش الشمالي، جدة",
                Phone = "+966920009565",
                Website = "https://www.hilton.com",
                DescriptionEn = "An oasis of luxury offering personal butler service and opulent design.",
                DescriptionAr = "واحة من الفخامة تقدم خدمات المساعد الشخصي وتصاميم داخلية مذهبة.",
                ExternalBookingUrl = "https://booking.com/qasr-al-sharq-jeddah"
            }
        };

        foreach (var h in seedHotels)
        {
            if (!context.Hotels.Any(hotel => hotel.Id == h.Id))
            {
                context.Hotels.Add(h);
            }
        }
        await context.SaveChangesAsync();

        // 8. Seed Restaurants
        var seedRestaurants = new List<Restaurant>
        {
            new Restaurant
            {
                Id = "rest_riyadh_najd",
                CityId = "riyadh",
                NameEn = "Najd Village",
                NameAr = "القرية النجدية",
                CuisineEn = "Traditional Najdi",
                CuisineAr = "شعبي نجدي",
                Rating = 4.7,
                PriceLevel = "$$",
                MainImageId = "img_rest_riyadh_najd",
                AddressEn = "Takhassusi St, Riyadh",
                AddressAr = "شارع التخصصي، الرياض",
                Phone = "+966920033511",
                Website = "https://najdvillage.com"
            }
        };

        foreach (var r in seedRestaurants)
        {
            if (!context.Restaurants.Any(rest => rest.Id == r.Id))
            {
                context.Restaurants.Add(r);
            }
        }
        await context.SaveChangesAsync();

        // 9. Seed Activities
        var seedActivities = new List<Activity>
        {
            new Activity
            {
                Id = "act_masmak_tour",
                DestinationId = "riyadh_masmak",
                NameEn = "Masmak Castle Museum Guided Tour",
                NameAr = "جولة إرشادية داخل قصر المصمك",
                PricePerPerson = 0,
                DurationMinutes = 60,
                DescriptionEn = "A comprehensive guided walk tracing the history of the fortress and unification of Saudi Arabia.",
                DescriptionAr = "جولة إرشادية متكاملة تتناول تاريخ الحصن ودوره المحوري في توحيد المملكة العربية السعودية."
            },
            new Activity
            {
                Id = "act_hegra_shuttle",
                DestinationId = "alula_hegra",
                NameEn = "Hegra Vintage Land Rover Tour",
                NameAr = "جولة سيارات لاند روفر الكلاسيكية في الحجر",
                PricePerPerson = 150,
                DurationMinutes = 120,
                DescriptionEn = "Ride a vintage 4x4 open-top vehicle across Hegra tombs with a specialized guide.",
                DescriptionAr = "قم بجولة بسيارة لاندروفر مكشوفة كلاسيكية عبر مقابر الحجر الأثرية برفقة راوٍ مختص."
            }
        };

        foreach (var act in seedActivities)
        {
            if (!context.Activities.Any(a => a.Id == act.Id))
            {
                context.Activities.Add(act);
            }
        }
        await context.SaveChangesAsync();

        // 10. Seed Coupons
        if (!context.Coupons.Any())
        {
            context.Coupons.Add(new Coupon
            {
                Id = "coupon_ldf2026",
                Code = "LDF2026",
                DiscountPercentage = 10.0,
                IsActive = true
            });
            await context.SaveChangesAsync();
        }

        // 11. Seed Chat Sessions & Messages
        if (!context.ChatSessions.Any())
        {
            var session = new ChatSession
            {
                Id = "chat_sarah_abdullah",
                ParticipantAId = "user_sarah",
                ParticipantBId = "guide_abdullah"
            };
            context.ChatSessions.Add(session);

            context.ChatMessages.AddRange(new List<ChatMessage>
            {
                new ChatMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    SessionId = "chat_sarah_abdullah",
                    SenderId = "guide_abdullah",
                    SenderName = "Abdullah Al-Asiri",
                    Text = "مرحباً سارة، كيف يمكنني مساعدتك في رحلتك القادمة إلى أبها؟",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                },
                new ChatMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    SessionId = "chat_sarah_abdullah",
                    SenderId = "user_sarah",
                    SenderName = "Sarah Al-Fahad",
                    Text = "أهلاً عبدالله، أريد حجز جولة هايكنج في السودة عسير يوم السبت القادم",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-25)
                },
                new ChatMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    SessionId = "chat_sarah_abdullah",
                    SenderId = "guide_abdullah",
                    SenderName = "Abdullah Al-Asiri",
                    Text = "بالتأكيد، الجو رائع هناك حالياً ودرجة الحرارة 18 مئوية. سأرتب لكِ المسار والمعدات اللازمة.",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-20)
                }
            });
            await context.SaveChangesAsync();
        }

        // 12. Seed Packages if empty
        if (!context.Packages.Any())
        {
            context.Packages.AddRange(new List<Package>
            {
                new Package
                {
                    Id = "pkg_alula_heritage",
                    OfficeId = "office_tours",
                    OfficeNameEn = "Saudi Horizon Travel",
                    OfficeNameAr = "آفاق السعودية للسياحة",
                    NameEn = "AlUla Heritage & Wonders Tour",
                    NameAr = "بكج العجائب والتراث في العلا",
                    Category = "family",
                    ImagesJson = "[\"/alula_hegra.jpg\"]",
                    CitiesEnJson = "[\"AlUla\"]",
                    CitiesArJson = "[\"العلا\"]",
                    DurationDays = 3,
                    StartDate = "2026-10-01",
                    EndDate = "2026-10-04",
                    ItineraryJson = "[{\"dayNumber\":1,\"activitiesEn\":[{\"time\":\"09:00 AM\",\"text\":\"Arrive in AlUla & Hegra Visit\"}],\"activitiesAr\":[{\"time\":\"09:00 ص\",\"text\":\"الوصول إلى العلا وزيارة الحجر\"}]}]",
                    TransportTypeEn = "4x4 Luxury SUV",
                    TransportTypeAr = "سيارات فورويل فاخرة",
                    PricePerPerson = 2450.00,
                    TotalSeats = 15,
                    RemainingSeats = 8,
                    InclusionsEnJson = "[\"Luxury Hotel Stay\",\"Hegra Entrance Pass\",\"Local Guide\",\"Breakfast\"]",
                    InclusionsArJson = "[\"إقامة في فندق فاخر\",\"تصريح دخول الحجر\",\"مرشد محلي\",\"وجبة الإفطار\"]",
                    ExclusionsEnJson = "[\"Personal expenses\",\"Flight tickets\"]",
                    ExclusionsArJson = "[\"المصاريف الشخصية\",\"تذاكر الطيران\"]",
                    TermsEn = "Free cancellation up to 48 hours before start date.",
                    TermsAr = "إلغاء مجاني حتى 48 ساعة قبل موعد الرحلة.",
                    CancellationPolicyEn = "Full refund if cancelled 48h prior.",
                    CancellationPolicyAr = "استرداد كامل في حال الإلغاء قبل 48 ساعة.",
                    Rating = 4.9,
                    ReviewsCount = 128,
                    IsAvailable = true
                },
                new Package
                {
                    Id = "pkg_riyadh_weekend",
                    OfficeId = "office_tours",
                    OfficeNameEn = "Saudi Horizon Travel",
                    OfficeNameAr = "آفاق السعودية للسياحة",
                    NameEn = "Riyadh Season & Diriyah Wonders",
                    NameAr = "عطلة نهاية الأسبوع في الرياض والدرعية",
                    Category = "culture",
                    ImagesJson = "[\"/riyadh_night.png\"]",
                    CitiesEnJson = "[\"Riyadh\"]",
                    CitiesArJson = "[\"الرياض\"]",
                    DurationDays = 3,
                    StartDate = "2026-11-01",
                    EndDate = "2026-11-04",
                    ItineraryJson = "[{\"dayNumber\":1,\"activitiesEn\":[{\"time\":\"04:00 PM\",\"text\":\"Boulevard World Tour\"}],\"activitiesAr\":[{\"time\":\"04:00 م\",\"text\":\"جولة بوليفارد وورلد\"}]}]",
                    TransportTypeEn = "VIP Transfer Private Car",
                    TransportTypeAr = "سيارة خاصة فارهة",
                    PricePerPerson = 2100.00,
                    TotalSeats = 10,
                    RemainingSeats = 5,
                    InclusionsEnJson = "[\"5 Star Hotel Stay\",\"Boulevard World VIP Ticket\",\"Diriyah Pass\"]",
                    InclusionsArJson = "[\"إقامة فندق 5 نجوم\",\"تذكرة VIP بوليفارد وورلد\",\"تصريح دخول الدرعية\"]",
                    ExclusionsEnJson = "[\"Flight tickets\"]",
                    ExclusionsArJson = "[\"تذاكر الطيران\"]",
                    TermsEn = "Free cancellation up to 24 hours.",
                    TermsAr = "إلغاء مجاني حتى 24 ساعة.",
                    CancellationPolicyEn = "Full refund prior 24h.",
                    CancellationPolicyAr = "استرداد كامل قبل 24 ساعة.",
                    Rating = 4.9,
                    ReviewsCount = 210,
                    IsAvailable = true
                },
                new Package
                {
                    Id = "pkg_jeddah_redsea",
                    OfficeId = "office_tours",
                    OfficeNameEn = "Saudi Horizon Travel",
                    OfficeNameAr = "آفاق السعودية للسياحة",
                    NameEn = "Jeddah Al-Balad & Red Sea Cruise",
                    NameAr = "بكج عروس البحر الأحمر وجدة التاريخية",
                    Category = "nature",
                    ImagesJson = "[\"/jeddah_corniche.jpg\"]",
                    CitiesEnJson = "[\"Jeddah\"]",
                    CitiesArJson = "[\"جدة\"]",
                    DurationDays = 3,
                    StartDate = "2026-09-10",
                    EndDate = "2026-09-13",
                    ItineraryJson = "[{\"dayNumber\":1,\"activitiesEn\":[{\"time\":\"05:00 PM\",\"text\":\"Yacht Cruise & Sunset Dinner\"}],\"activitiesAr\":[{\"time\":\"05:00 م\",\"text\":\"جولة باليخت وعشاء الغروب\"}]}]",
                    TransportTypeEn = "Luxury Yacht & SUV",
                    TransportTypeAr = "يخت فاخر وسيارات VIP",
                    PricePerPerson = 2900.00,
                    TotalSeats = 12,
                    RemainingSeats = 6,
                    InclusionsEnJson = "[\"Seafront Resort Stay\",\"Private Yacht Trip\",\"Historical Balad Tour\"]",
                    InclusionsArJson = "[\"إقامة في منتجع ساحلي\",\"رحلة يخت خاصة\",\"جولة البلد التاريخية\"]",
                    ExclusionsEnJson = "[\"Personal Shopping\"]",
                    ExclusionsArJson = "[\"المشتريات الشخصية\"]",
                    TermsEn = "Standard refund policy.",
                    TermsAr = "سياسة الاسترداد المعيارية.",
                    CancellationPolicyEn = "Flexible refund.",
                    CancellationPolicyAr = "إلغاء واسترداد مرن.",
                    Rating = 4.95,
                    ReviewsCount = 180,
                    IsAvailable = true
                },
                new Package
                {
                    Id = "pkg_tabuk_neom",
                    OfficeId = "office_tours",
                    OfficeNameEn = "Saudi Horizon Travel",
                    OfficeNameAr = "آفاق السعودية للسياحة",
                    NameEn = "Tabuk & NEOM Disah Canyon Discovery",
                    NameAr = "رحلة اكتشاف تبوك ووادي الديسة بنيوم",
                    Category = "adventure",
                    ImagesJson = "[\"https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=2000&q=80\"]",
                    CitiesEnJson = "[\"Tabuk\"]",
                    CitiesArJson = "[\"تبوك\"]",
                    DurationDays = 4,
                    StartDate = "2026-10-15",
                    EndDate = "2026-10-19",
                    ItineraryJson = "[{\"dayNumber\":1,\"activitiesEn\":[{\"time\":\"08:00 AM\",\"text\":\"Wadi Al-Disah Offroad Safari\"}],\"activitiesAr\":[{\"time\":\"08:00 ص\",\"text\":\"سفاري وادي الديسة بالدفع الرباعي\"}]}]",
                    TransportTypeEn = "4x4 Desert Safari Vehicle",
                    TransportTypeAr = "سيارات دفع رباعي مجهزة للصحراء",
                    PricePerPerson = 3200.00,
                    TotalSeats = 8,
                    RemainingSeats = 3,
                    InclusionsEnJson = "[\"Desert Eco-Lodge Stay\",\"Camping Gear\",\"Barbecue Dinner\"]",
                    InclusionsArJson = "[\"إقامة مخيمات فندقية بيئية\",\"معدات التخييم\",\"عشاء مشاوي بري\"]",
                    ExclusionsEnJson = "[\"Flight tickets\"]",
                    ExclusionsArJson = "[\"تذاكر الطيران\"]",
                    TermsEn = "Eco-friendly policy.",
                    TermsAr = "سياسة التخييم البيئي.",
                    CancellationPolicyEn = "Full refund if cancelled 7 days prior.",
                    CancellationPolicyAr = "استرداد كامل قبل 7 أيام.",
                    Rating = 5.0,
                    ReviewsCount = 76,
                    IsAvailable = true
                }
            });
            await context.SaveChangesAsync();
        }
    }
}
