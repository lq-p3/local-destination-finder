import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db, seedDatabase } from "./server/db";
import { Destination, DestinationEdit, DestinationReport, Package, FavoriteList, Comparison, Notification, Review, TravelGuide, Booking, TravelOffice, Accommodation, QuoteRequest, QuoteProposal, ChatSession } from "./server/types";

async function startServer() {
  // Initialize and seed mock database
  seedDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Mock Authentication Helper (Extracted from Headers or simulated queries)
  const getLoggedInUser = (req: express.Request) => {
    const userEmail = req.headers['x-user-email'] || 'sarah.travels@example.com';
    const users = db.getUsers();
    return users.find(u => u.email === userEmail) || users[0];
  };

  // --- Auth APIs ---
  app.get("/api/auth/me", (req, res) => {
    const user = getLoggedInUser(req);
    res.json(user);
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json(user);
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    const users = db.getUsers();
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const userRole = (role === 'guide' || role === 'user') ? role : 'user';
    const newUser = {
      id: (userRole === 'guide' ? 'guide_' : 'user_') + Date.now(),
      name,
      email,
      passwordHash: password,
      role: userRole,
      points: 100,
      badges: userRole === 'guide' ? ['Certified Guide'] : ['Local Explorer']
    };
    users.push(newUser);
    db.saveUsers(users);
    res.json(newUser);
  });

  // Switch role for simulation purposes
  app.post("/api/auth/switch-role", (req, res) => {
    const { role } = req.body;
    const currentUser = getLoggedInUser(req);
    const users = db.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, role };
      }
      return u;
    });
    db.saveUsers(updatedUsers);
    res.json({ success: true, role });
  });

  // --- Regions & Cities APIs ---
  app.get("/api/regions", (req, res) => {
    res.json(db.getRegions());
  });

  app.get("/api/regions/:id", (req, res) => {
    const region = db.getRegions().find(r => r.id === req.params.id);
    if (!region) return res.status(404).json({ error: "Region not found" });
    
    const cities = db.getCities().filter(c => c.regionId === region.id);
    res.json({ region, cities });
  });

  app.get("/api/cities/:id", (req, res) => {
    const city = db.getCities().find(c => c.id === req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });

    const destinations = db.getDestinations().filter(d => d.cityId === city.id && d.status === 'approved');
    res.json({ city, destinations });
  });

  // --- Destination Submission & Modification Portal ---
  app.get("/api/destinations", (req, res) => {
    const destinations = db.getDestinations().filter(d => d.status === 'approved');
    res.json(destinations);
  });

  app.get("/api/destinations/:id", (req, res) => {
    const dest = db.getDestinations().find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });
    res.json(dest);
  });

  app.post("/api/destinations/submit", (req, res) => {
    const user = getLoggedInUser(req);
    const placeData = req.body;

    const newDest: Destination = {
      id: 'dest_' + Date.now(),
      cityId: placeData.cityId || 'riyadh',
      neighborhoodEn: placeData.neighborhoodEn || '',
      neighborhoodAr: placeData.neighborhoodAr || '',
      nameEn: placeData.nameEn,
      nameAr: placeData.nameAr,
      category: placeData.category || 'Nature',
      rating: 5.0,
      reviews: 0,
      image: placeData.image || 'https://images.unsplash.com/photo-1625414811202-e223ed33405c?auto=format&fit=crop&w=800&q=80',
      gallery: placeData.gallery || [],
      descriptionEn: placeData.descriptionEn,
      descriptionAr: placeData.descriptionAr,
      coordinates: placeData.coordinates || { lat: 24.7136, lng: 46.6753 },
      workingHoursEn: placeData.workingHoursEn || '09:00 AM - 05:00 PM',
      workingHoursAr: placeData.workingHoursAr || '09:00 ص - 05:00 م',
      entryFees: Number(placeData.entryFees) || 0,
      contactInfo: placeData.contactInfo || {},
      priceLevel: placeData.priceLevel || '$$',
      servicesEn: placeData.servicesEn || [],
      servicesAr: placeData.servicesAr || [],
      suitability: placeData.suitability || { families: true, kids: true, elderly: true, disabled: true },
      status: 'pending', // Pending Admin approval
      submittedBy: user.id
    };

    const dests = db.getDestinations();
    dests.push(newDest);
    db.saveDestinations(dests);

    // Gamification points: Add 50 points for submitting a place
    const users = db.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        const newPoints = u.points + 50;
        // Award badge: "Musahem Moathaq" (Trusted Contributor) if points > 500
        const badges = [...u.badges];
        if (newPoints >= 500 && !badges.includes('Trusted Contributor')) {
          badges.push('Trusted Contributor');
        }
        return { ...u, points: newPoints, badges };
      }
      return u;
    });
    db.saveUsers(updatedUsers);

    // Create Notification
    const notifs = db.getNotifications();
    notifs.push({
      id: 'notif_' + Date.now(),
      userId: user.id,
      type: 'system',
      titleEn: 'Destination Submitted',
      titleAr: 'تم إرسال المكان بنجاح',
      contentEn: `Your submission "${newDest.nameEn}" is pending review. You received 50 points!`,
      contentAr: `طلبك لإضافة "${newDest.nameAr}" قيد المراجعة الآن. حصلت على 50 نقطة!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    db.saveNotifications(notifs);

    res.json({ success: true, destination: newDest });
  });

  // Suggest edit for existing place
  app.post("/api/destinations/:id/edit-proposal", (req, res) => {
    const user = getLoggedInUser(req);
    const edits = db.getDestinationEdits();
    
    const newEdit: DestinationEdit = {
      id: 'edit_' + Date.now(),
      destinationId: req.params.id,
      userId: user.id,
      proposedChanges: req.body,
      status: 'pending'
    };

    edits.push(newEdit);
    db.saveDestinationEdits(edits);

    // Add points for contributing
    const users = db.getUsers();
    db.saveUsers(users.map(u => u.id === user.id ? { ...u, points: u.points + 15 } : u));

    res.json({ success: true });
  });

  // Report wrong info
  app.post("/api/destinations/:id/report", (req, res) => {
    const user = getLoggedInUser(req);
    const reports = db.getDestinationReports();
    const newReport: DestinationReport = {
      id: 'report_' + Date.now(),
      destinationId: req.params.id,
      userId: user.id,
      reason: req.body.reason,
      details: req.body.details || '',
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    db.saveDestinationReports(reports);
    res.json({ success: true });
  });

  // Fetch submissions for a specific user
  app.get("/api/my-submissions", (req, res) => {
    const user = getLoggedInUser(req);
    const submissions = db.getDestinations().filter(d => d.submittedBy === user.id);
    res.json(submissions);
  });

  // Reviews and ratings API
  app.get("/api/destinations/:id/reviews", (req, res) => {
    const reviews = db.getReviews().filter(r => r.itemId === req.params.id);
    res.json(reviews);
  });

  app.post("/api/destinations/:id/reviews", (req, res) => {
    const user = getLoggedInUser(req);
    const destId = req.params.id;
    const { rating, comment, cleanliness, safety, price, service, crowding } = req.body;

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      userId: user.id,
      userName: user.name,
      itemId: destId,
      rating,
      comment,
      cleanlinessRating: cleanliness,
      safetyRating: safety,
      priceRating: price,
      serviceRating: service,
      crowdRating: crowding,
      createdAt: new Date().toISOString()
    };

    const reviews = db.getReviews();
    reviews.push(newReview);
    db.saveReviews(reviews);

    // Update destination rating/reviews counts
    const dests = db.getDestinations();
    const updatedDests = dests.map(d => {
      if (d.id === destId) {
        const destReviews = reviews.filter(r => r.itemId === destId);
        const avgRating = destReviews.reduce((sum, r) => sum + r.rating, 0) / destReviews.length;
        return { ...d, rating: Number(avgRating.toFixed(1)), reviews: destReviews.length };
      }
      return d;
    });
    db.saveDestinations(updatedDests);

    res.json(newReview);
  });

  // --- Admin Review APIs ---
  app.get("/api/admin/pending-submissions", (req, res) => {
    const pending = db.getDestinations().filter(d => d.status !== 'approved');
    res.json(pending);
  });

  app.post("/api/admin/submissions/:id/review", (req, res) => {
    const { status, adminFeedback } = req.body; // approved, rejected, edit_needed
    const destId = req.params.id;

    const dests = db.getDestinations();
    const destIndex = dests.findIndex(d => d.id === destId);
    if (destIndex === -1) return res.status(404).json({ error: "Destination not found" });

    dests[destIndex].status = status;
    if (adminFeedback) dests[destIndex].adminFeedback = adminFeedback;
    db.saveDestinations(dests);

    // Notify user
    const submittedBy = dests[destIndex].submittedBy;
    if (submittedBy) {
      const notifs = db.getNotifications();
      notifs.push({
        id: 'notif_' + Date.now(),
        userId: submittedBy,
        type: 'system',
        titleEn: `Submission update: ${status}`,
        titleAr: `تحديث طلب الإضافة: ${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : 'يحتاج تعديل'}`,
        contentEn: `Your destination submission "${dests[destIndex].nameEn}" is now ${status}. ${adminFeedback ? 'Feedback: ' + adminFeedback : ''}`,
        contentAr: `تم تحديث حالة مكانك المضاف "${dests[destIndex].nameAr}" لتصبح: ${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : 'يحتاج لتعديل'}. ${adminFeedback ? 'ملاحظة الإدارة: ' + adminFeedback : ''}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      db.saveNotifications(notifs);
    }

    res.json({ success: true });
  });

  // --- Favorite Lists & Shared folders ---
  app.get("/api/favorite-lists", (req, res) => {
    const user = getLoggedInUser(req);
    const lists = db.getFavoriteLists().filter(l => l.userId === user.id || l.invitees.includes(user.email) || l.invitees.includes(user.id));
    res.json(lists);
  });

  app.post("/api/favorite-lists/create", (req, res) => {
    const user = getLoggedInUser(req);
    const { name, isPublic } = req.body;

    const newList: FavoriteList = {
      id: 'list_' + Date.now(),
      userId: user.id,
      name,
      isPublic: isPublic ?? false,
      invitees: [],
      votes: {},
      items: []
    };

    const lists = db.getFavoriteLists();
    lists.push(newList);
    db.saveFavoriteLists(lists);
    res.json(newList);
  });

  app.post("/api/favorite-lists/:id/add", (req, res) => {
    const { type, itemId } = req.body;
    const listId = req.params.id;

    const lists = db.getFavoriteLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) return res.status(404).json({ error: "List not found" });

    // Check duplicates
    const itemExists = lists[listIndex].items.some(i => i.type === type && i.itemId === itemId);
    if (!itemExists) {
      lists[listIndex].items.push({ type, itemId });
      lists[listIndex].votes[itemId] = []; // Initialize votes array
      db.saveFavoriteLists(lists);
    }
    res.json(lists[listIndex]);
  });

  app.post("/api/favorite-lists/:id/remove", (req, res) => {
    const { type, itemId } = req.body;
    const listId = req.params.id;

    const lists = db.getFavoriteLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) return res.status(404).json({ error: "List not found" });

    lists[listIndex].items = lists[listIndex].items.filter(i => !(i.type === type && i.itemId === itemId));
    delete lists[listIndex].votes[itemId];
    db.saveFavoriteLists(lists);
    res.json(lists[listIndex]);
  });

  app.post("/api/favorite-lists/:id/invite", (req, res) => {
    const { email } = req.body;
    const listId = req.params.id;

    const lists = db.getFavoriteLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) return res.status(404).json({ error: "List not found" });

    if (!lists[listIndex].invitees.includes(email)) {
      lists[listIndex].invitees.push(email);
      db.saveFavoriteLists(lists);
    }
    res.json({ success: true, invitees: lists[listIndex].invitees });
  });

  app.post("/api/favorite-lists/:id/vote", (req, res) => {
    const user = getLoggedInUser(req);
    const { itemId } = req.body;
    const listId = req.params.id;

    const lists = db.getFavoriteLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) return res.status(404).json({ error: "List not found" });

    if (!lists[listIndex].votes[itemId]) {
      lists[listIndex].votes[itemId] = [];
    }

    const votes = lists[listIndex].votes[itemId];
    if (votes.includes(user.id)) {
      // Remove vote
      lists[listIndex].votes[itemId] = votes.filter(uid => uid !== user.id);
    } else {
      // Add vote
      votes.push(user.id);
    }

    db.saveFavoriteLists(lists);
    res.json(lists[listIndex]);
  });

  app.delete("/api/favorite-lists/:id", (req, res) => {
    const lists = db.getFavoriteLists();
    const updated = lists.filter(l => l.id !== req.params.id);
    db.saveFavoriteLists(updated);
    res.json({ success: true });
  });

  // --- Travel Packages APIs ---
  app.get("/api/packages", (req, res) => {
    const pkgs = db.getPackages();
    res.json(pkgs);
  });

  app.get("/api/packages/:id", (req, res) => {
    const pkg = db.getPackages().find(p => p.id === req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  });

  // Customizable package ("صمّم بكجك") saving
  app.post("/api/packages/custom/save", (req, res) => {
    const user = getLoggedInUser(req);
    const customConfig = req.body; // hotel, guide, city, activities, dates, total cost

    const customPkg: Package = {
      id: 'custom_pkg_' + Date.now(),
      officeId: 'custom',
      officeNameEn: 'Self-Designed Trip',
      officeNameAr: 'بكج مصمم ذاتياً',
      nameEn: customConfig.nameEn || 'My Custom Trip',
      nameAr: customConfig.nameAr || 'رحلتي المخصصة',
      category: 'customizable',
      images: ['https://images.unsplash.com/photo-1682687981974-c5ef2111640c?auto=format&fit=crop&w=800&q=80'],
      citiesEn: [customConfig.cityEn || 'Riyadh'],
      citiesAr: [customConfig.cityAr || 'الرياض'],
      durationDays: Number(customConfig.daysCount) || 1,
      startDate: customConfig.startDate || new Date().toISOString().split('T')[0],
      endDate: customConfig.endDate || new Date().toISOString().split('T')[0],
      itinerary: customConfig.itinerary || [],
      transportTypeEn: 'Private transport',
      transportTypeAr: 'مواصلات خاصة',
      pricePerPerson: customConfig.totalCost || 0,
      totalSeats: 1,
      remainingSeats: 1,
      inclusionsEn: customConfig.inclusionsEn || [],
      inclusionsAr: customConfig.inclusionsAr || [],
      exclusionsEn: [],
      exclusionsAr: [],
      termsEn: 'Designed by tourist.',
      termsAr: 'تم تصميمه من قبل السائح.',
      cancellationPolicyEn: 'Standard policy applies.',
      cancellationPolicyAr: 'تطبق السياسة القياسية.',
      rating: 5.0,
      reviewsCount: 0,
      isAvailable: true
    };

    const pkgs = db.getPackages();
    pkgs.push(customPkg);
    db.savePackages(pkgs);

    res.json({ success: true, package: customPkg });
  });

  // --- Side-by-side comparisons ---
  app.get("/api/comparisons", (req, res) => {
    const user = getLoggedInUser(req);
    const comps = db.getComparisons();
    const userComp = comps.find(c => c.userId === user.id) || { userId: user.id, itemIds: [] };
    res.json(userComp);
  });

  app.post("/api/comparisons/add", (req, res) => {
    const user = getLoggedInUser(req);
    const { itemId } = req.body;

    const comps = db.getComparisons();
    let userComp = comps.find(c => c.userId === user.id);
    if (!userComp) {
      userComp = { userId: user.id, itemIds: [] };
      comps.push(userComp);
    }

    if (userComp.itemIds.length >= 3) {
      return res.status(400).json({ error: "Cannot compare more than 3 options" });
    }

    if (!userComp.itemIds.includes(itemId)) {
      userComp.itemIds.push(itemId);
      db.saveComparisons(comps);
    }

    res.json(userComp);
  });

  app.post("/api/comparisons/remove", (req, res) => {
    const user = getLoggedInUser(req);
    const { itemId } = req.body;

    const comps = db.getComparisons();
    const userComp = comps.find(c => c.userId === user.id);
    if (userComp) {
      userComp.itemIds = userComp.itemIds.filter(id => id !== itemId);
      db.saveComparisons(comps);
    }

    res.json(userComp || { userId: user.id, itemIds: [] });
  });

  // --- Notifications APIs ---
  app.get("/api/notifications", (req, res) => {
    const user = getLoggedInUser(req);
    const notifs = db.getNotifications().filter(n => n.userId === user.id);
    res.json(notifs);
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    const notifs = db.getNotifications();
    const index = notifs.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
      notifs[index].isRead = true;
      db.saveNotifications(notifs);
    }
    res.json({ success: true });
  });

  app.put("/api/notifications/read-all", (req, res) => {
    const user = getLoggedInUser(req);
    const notifs = db.getNotifications();
    const updated = notifs.map(n => n.userId === user.id ? { ...n, isRead: true } : n);
    db.saveNotifications(updated);
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", (req, res) => {
    const notifs = db.getNotifications();
    const updated = notifs.filter(n => n.id !== req.params.id);
    db.saveNotifications(updated);
    res.json({ success: true });
  });

  app.post("/api/notifications/settings", (req, res) => {
    const user = getLoggedInUser(req);
    const { settings } = req.body;

    const users = db.getUsers();
    const updated = users.map(u => {
      if (u.id === user.id) {
        return { ...u, notificationSettings: settings };
      }
      return u;
    });
    db.saveUsers(updated);
    res.json({ success: true });
  });

  // --- Phase 2: Travel Office Endpoints ---
  app.get("/api/offices", (req, res) => {
    res.json(db.getOffices());
  });

  app.get("/api/offices/:id", (req, res) => {
    const office = db.getOffices().find(o => o.id === req.params.id);
    if (!office) return res.status(404).json({ error: "Office not found" });
    res.json(office);
  });

  app.post("/api/offices/packages", (req, res) => {
    const user = getLoggedInUser(req);
    if (user.role !== 'office' && user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized. Office role required." });
    }
    const pkg: Package = {
      ...req.body,
      id: 'pkg_' + Date.now(),
      officeId: user.id === 'user_sarah' ? 'office_saudi_tours' : user.id, // Mock mapping
      officeNameEn: user.name || 'Local Agency',
      officeNameAr: user.name || 'وكالة محلية',
      rating: 5.0,
      reviewsCount: 0,
      isAvailable: true
    };
    const pkgs = db.getPackages();
    pkgs.push(pkg);
    db.savePackages(pkgs);
    res.json({ success: true, package: pkg });
  });

  app.put("/api/offices/packages/:id", (req, res) => {
    const user = getLoggedInUser(req);
    if (user.role !== 'office' && user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized." });
    }
    const pkgs = db.getPackages();
    const index = pkgs.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Package not found" });
    pkgs[index] = { ...pkgs[index], ...req.body };
    db.savePackages(pkgs);
    res.json({ success: true, package: pkgs[index] });
  });

  app.delete("/api/offices/packages/:id", (req, res) => {
    const user = getLoggedInUser(req);
    if (user.role !== 'office' && user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized." });
    }
    const pkgs = db.getPackages();
    const updated = pkgs.filter(p => p.id !== req.params.id);
    db.savePackages(updated);
    res.json({ success: true });
  });

  app.get("/api/offices/bookings", (req, res) => {
    const user = getLoggedInUser(req);
    // Find bookings where officeId is associated with user
    const officeId = user.id === 'user_sarah' ? 'office_saudi_tours' : user.id;
    const pkgs = db.getPackages().filter(p => p.officeId === officeId).map(p => p.id);
    const bookings = db.getBookings().filter(b => b.type === 'package' && pkgs.includes(b.itemId));
    res.json(bookings);
  });

  app.post("/api/offices/bookings/:id/action", (req, res) => {
    const { action } = req.body; // 'confirmed' or 'rejected'
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Booking not found" });

    bookings[index].status = action;
    db.saveBookings(bookings);

    // Notify client
    const clientNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId: bookings[index].userId,
      type: 'booking',
      titleEn: action === 'confirmed' ? 'Booking Confirmed!' : 'Booking Rejected',
      titleAr: action === 'confirmed' ? 'تم تأكيد الحجز!' : 'تم رفض طلب الحجز',
      contentEn: `Your booking for ${bookings[index].itemNameEn} has been ${action}.`,
      contentAr: `طلب الحجز الخاص بك لـ ${bookings[index].itemNameAr} تم ${action === 'confirmed' ? 'الموافقة عليه وتأكيده' : 'رفضه من قبل المزود'}.`,
      isRead: false,
      link: '/profile',
      createdAt: new Date().toISOString()
    };
    const notifs = db.getNotifications();
    notifs.push(clientNotif);
    db.saveNotifications(notifs);

    res.json({ success: true, booking: bookings[index] });
  });

  app.get("/api/offices/stats", (req, res) => {
    const user = getLoggedInUser(req);
    const officeId = user.id === 'user_sarah' ? 'office_saudi_tours' : user.id;
    const officePkgs = db.getPackages().filter(p => p.officeId === officeId);
    const pkgIds = officePkgs.map(p => p.id);
    const bookings = db.getBookings().filter(b => b.type === 'package' && pkgIds.includes(b.itemId));
    
    const totalSales = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.priceDetails.totalPrice, 0);

    res.json({
      packagesCount: officePkgs.length,
      bookingsCount: bookings.length,
      totalSales,
      avgRating: officePkgs.reduce((sum, p) => sum + p.rating, 0) / (officePkgs.length || 1)
    });
  });

  // --- Phase 2: Tourist Guides Endpoints ---
  app.get("/api/guides", (req, res) => {
    const guides = db.getGuides();
    const { city, specialty, price, language, availableOnly } = req.query;
    let filtered = guides;

    if (city) {
      filtered = filtered.filter(g => 
        g.citiesCoveredEn.some(c => c.toLowerCase() === (city as string).toLowerCase()) ||
        g.citiesCoveredAr.some(c => c.includes(city as string))
      );
    }
    if (specialty) {
      filtered = filtered.filter(g => 
        g.specialtiesEn.some(s => s.toLowerCase().includes((specialty as string).toLowerCase())) ||
        g.specialtiesAr.some(s => s.includes(specialty as string))
      );
    }
    if (price) {
      filtered = filtered.filter(g => g.pricePerHour <= Number(price));
    }
    if (language) {
      filtered = filtered.filter(g => 
        g.languagesEn.some(l => l.toLowerCase() === (language as string).toLowerCase()) ||
        g.languagesAr.some(l => l.includes(language as string))
      );
    }
    if (availableOnly === 'true') {
      filtered = filtered.filter(g => g.availability === 'available');
    }

    res.json(filtered);
  });

  app.get("/api/guides/:id", (req, res) => {
    const guide = db.getGuides().find(g => g.id === req.params.id);
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    res.json(guide);
  });

  app.put("/api/guides/my-profile", (req, res) => {
    const user = getLoggedInUser(req);
    const guides = db.getGuides();
    const index = guides.findIndex(g => g.userId === user.id);
    if (index === -1) {
      const newGuide: TravelGuide = {
        id: 'guide_' + Date.now(),
        userId: user.id,
        nameEn: user.name,
        nameAr: user.name,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        licenseNumber: 'G-TEMP-LIC',
        isVerified: false,
        languagesEn: ['Arabic'],
        languagesAr: ['العربية'],
        specialtiesEn: ['General Tours'],
        specialtiesAr: ['جولات عامة'],
        citiesCoveredEn: ['Riyadh'],
        citiesCoveredAr: ['الرياض'],
        pricePerHour: 30,
        pricePerDay: 200,
        rating: 5.0,
        reviewsCount: 0,
        yearsOfExperience: 1,
        availability: req.body.availability || 'available',
        workingHoursEn: '08:00 AM - 08:00 PM',
        workingHoursAr: '08:00 ص - 08:00 م',
        servicesEn: ['Walking tours'],
        servicesAr: ['جولات مشي'],
        approximateLocation: { lat: 24.7136, lng: 46.6753 }
      };
      guides.push(newGuide);
      db.saveGuides(guides);
      return res.json(newGuide);
    }
    guides[index] = { ...guides[index], ...req.body };
    db.saveGuides(guides);
    res.json(guides[index]);
  });

  // --- Phase 2: Accommodations Endpoints ---
  app.get("/api/accommodations", (req, res) => {
    const hotels = db.getAccommodations();
    const { city, type, price, rating } = req.query;
    let filtered = hotels;

    if (city) {
      filtered = filtered.filter(h => h.cityId.toLowerCase() === (city as string).toLowerCase());
    }
    if (type) {
      filtered = filtered.filter(h => h.type === type);
    }
    if (price) {
      filtered = filtered.filter(h => h.rooms.some(r => r.pricePerNight <= Number(price)));
    }
    if (rating) {
      filtered = filtered.filter(h => h.rating >= Number(rating));
    }

    res.json(filtered);
  });

  app.get("/api/accommodations/:id", (req, res) => {
    const hotel = db.getAccommodations().find(h => h.id === req.params.id);
    if (!hotel) return res.status(404).json({ error: "Accommodation not found" });
    res.json(hotel);
  });

  // --- OpenStreetMap & Places Endpoints ---
  function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  function getFallbackPlaces(type: 'hotels' | 'restaurants' | 'cafes', latitude: number, longitude: number, language: string) {
    if (type === 'hotels') {
      const accommodations = db.getAccommodations();
      return accommodations.map((h) => {
        const dist = calculateDistanceKm(latitude, longitude, h.coordinates?.lat || latitude, h.coordinates?.lng || longitude);
        return {
          id: h.id,
          osmId: h.id,
          name: language === 'ar' ? h.nameAr : h.nameEn,
          address: language === 'ar' ? `${h.cityId} - المملكة العربية السعودية` : `${h.cityId} - Saudi Arabia`,
          latitude: h.coordinates?.lat || latitude,
          longitude: h.coordinates?.lng || longitude,
          category: 'hotel',
          distanceKm: dist,
          openingHours: '24/7',
          website: 'https://example.com',
          phone: '+966 11 000 0000',
          image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          rating: h.rating || 4.7,
          userRatingCount: h.reviewsCount || 100,
          priceLevel: h.rooms?.some(r => r.pricePerNight > 1000) ? 'PRICE_LEVEL_VERY_EXPENSIVE' : 'PRICE_LEVEL_EXPENSIVE',
          primaryType: h.type || 'hotel',
          openNow: true,
          photoUrl: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
        };
      });
    }

    if (type === 'restaurants') {
      const mockRestaurants = [
        {
          id: 'rest_najd_village',
          osmId: 'N101',
          nameAr: 'قرية نجديات التراثية',
          nameEn: 'Najd Village Restaurant',
          addressAr: 'طريق الملك عبد العزيز، الرياض',
          addressEn: 'King Abdulaziz Rd, Riyadh',
          lat: 24.7136 + 0.01,
          lng: 46.6753 + 0.01,
          category: 'restaurant',
          cuisine: language === 'ar' ? 'مأكولات سعودية تقليدية' : 'Traditional Saudi Cuisine',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          priceLevel: 'PRICE_LEVEL_MODERATE'
        },
        {
          id: 'rest_al_baik',
          osmId: 'N102',
          nameAr: 'مطعم البيك',
          nameEn: 'Al Baik Restaurant',
          addressAr: 'طريق كورنيش جدة',
          addressEn: 'Jeddah Corniche Rd',
          lat: 21.5433 + 0.005,
          lng: 39.1728 + 0.005,
          category: 'restaurant',
          cuisine: language === 'ar' ? 'وجبات سريعة' : 'Fast Food',
          image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          priceLevel: 'PRICE_LEVEL_INEXPENSIVE'
        },
        {
          id: 'rest_tokyo',
          osmId: 'N103',
          nameAr: 'مطعم طوكيو السوشي',
          nameEn: 'Tokyo Fine Dining',
          addressAr: 'حي العليا، الرياض',
          addressEn: 'Olaya District, Riyadh',
          lat: 24.7136 - 0.008,
          lng: 46.6753 - 0.008,
          category: 'restaurant',
          cuisine: language === 'ar' ? 'ياباني فاخر' : 'Japanese Fine Dining',
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
          rating: 4.7,
          priceLevel: 'PRICE_LEVEL_VERY_EXPENSIVE'
        }
      ];

      return mockRestaurants.map(r => ({
        id: r.id,
        osmId: r.osmId,
        name: language === 'ar' ? r.nameAr : r.nameEn,
        address: language === 'ar' ? r.addressAr : r.addressEn,
        latitude: r.lat,
        longitude: r.lng,
        category: 'restaurant',
        distanceKm: calculateDistanceKm(latitude, longitude, r.lat, r.lng),
        openingHours: '12:00 PM - 12:00 AM',
        cuisine: r.cuisine,
        image: r.image,
        rating: r.rating,
        userRatingCount: 230,
        priceLevel: r.priceLevel,
        primaryType: 'restaurant',
        openNow: true,
        photoUrl: r.image
      }));
    }

    const mockCafes = [
      {
        id: 'cafe_elixir',
        osmId: 'C101',
        nameAr: 'إليكسير ديل كافيه - القهوة المختصة',
        nameEn: 'Elixir Bunn Coffee Roasters',
        addressAr: 'حي النخيل، الرياض',
        addressEn: 'Al Nakheel Dist, Riyadh',
        lat: 24.7136 + 0.003,
        lng: 46.6753 - 0.004,
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        priceLevel: 'PRICE_LEVEL_MODERATE'
      },
      {
        id: 'cafe_half_million',
        osmId: 'C102',
        nameAr: 'هاف مليون كافيه',
        nameEn: 'Half Million Cafe',
        addressAr: 'شارع التخصصي، الرياض',
        addressEn: 'Takhassusi St, Riyadh',
        lat: 24.7136 - 0.002,
        lng: 46.6753 + 0.006,
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        priceLevel: 'PRICE_LEVEL_INEXPENSIVE'
      },
      {
        id: 'cafe_alula_oasis',
        osmId: 'C103',
        nameAr: 'مقهى الواحة الأصيلة بالعلا',
        nameEn: 'AlUla Oasis Cafe',
        addressAr: 'البلدة القديمة، العلا',
        addressEn: 'Old Town, AlUla',
        lat: 26.6083 + 0.002,
        lng: 37.9186 + 0.002,
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        priceLevel: 'PRICE_LEVEL_EXPENSIVE'
      }
    ];

    return mockCafes.map(c => ({
      id: c.id,
      osmId: c.osmId,
      name: language === 'ar' ? c.nameAr : c.nameEn,
      address: language === 'ar' ? c.addressAr : c.addressEn,
      latitude: c.lat,
      longitude: c.lng,
      category: 'cafe',
      distanceKm: calculateDistanceKm(latitude, longitude, c.lat, c.lng),
      openingHours: '06:30 AM - 11:30 PM',
      image: c.image,
      rating: c.rating,
      userRatingCount: 185,
      priceLevel: c.priceLevel,
      primaryType: 'cafe',
      openNow: true,
      photoUrl: c.image
    }));
  }

  async function fetchOsmPlaces(latitude: number, longitude: number, radiusMeters: number, type: 'lodging' | 'restaurant' | 'cafe', language: string) {
    const queryTerm = type === 'lodging' ? 'hotels' : type === 'restaurant' ? 'restaurants' : 'cafes';
    let cityName = 'Saudi Arabia';
    if (Math.abs(latitude - 24.7136) < 0.8 && Math.abs(longitude - 46.6753) < 0.8) cityName = 'Riyadh';
    else if (Math.abs(latitude - 21.5433) < 0.8 && Math.abs(longitude - 39.1728) < 0.8) cityName = 'Jeddah';
    else if (Math.abs(latitude - 26.6083) < 0.8 && Math.abs(longitude - 37.9186) < 0.8) cityName = 'AlUla';
    else if (Math.abs(latitude - 18.2164) < 0.8 && Math.abs(longitude - 42.5053) < 0.8) cityName = 'Abha';
    else if (Math.abs(latitude - 21.2639) < 0.8 && Math.abs(longitude - 40.4072) < 0.8) cityName = 'Taif';

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryTerm)}+${encodeURIComponent(cityName)}+Saudi+Arabia&format=json&addressdetails=1&extratags=1&limit=15`;
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(nominatimUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data: any = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const defaultImages = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
      ];

      const results = data
        .map((item: any, idx: number) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lon)) return null;

          const rawName = item.display_name ? item.display_name.split(',')[0].trim() : '';
          const name = rawName || item.name || (language === 'ar' ? 'فندق محلي' : 'Local Hotel');
          const address = item.display_name || (language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia');
          const dist = calculateDistanceKm(latitude, longitude, lat, lon);
          const osmId = `osm_${item.osm_type || 'node'}_${item.osm_id || idx}`;
          const img = defaultImages[idx % defaultImages.length];

          return {
            id: osmId,
            osmId: osmId,
            name: name,
            address: address,
            latitude: lat,
            longitude: lon,
            category: type === 'lodging' ? 'hotel' : type,
            distanceKm: dist,
            openingHours: '24/7',
            website: item.extratags?.website || 'https://www.booking.com',
            phone: item.extratags?.phone || '+966 11 000 0000',
            image: img,
            rating: Math.round((4.6 + (idx % 4) * 0.1) * 10) / 10,
            userRatingCount: 85 + idx * 14,
            priceLevel: idx % 2 === 0 ? 'PRICE_LEVEL_VERY_EXPENSIVE' : 'PRICE_LEVEL_EXPENSIVE',
            primaryType: type === 'lodging' ? 'hotel' : type,
            openNow: true,
            photoUrl: img
          };
        })
        .filter(Boolean);

      return results.length > 0 ? results : null;
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
  }

  app.get("/api/places/nearby-hotels", async (req, res) => {
    const lat = Number(req.query.latitude) || 24.7136;
    const lng = Number(req.query.longitude) || 46.6753;
    const radius = Number(req.query.radius) || 25000;
    const lang = (req.query.language as string) || 'ar';

    const osmPlaces = await fetchOsmPlaces(lat, lng, radius, 'lodging', lang);
    if (osmPlaces && osmPlaces.length > 0) {
      return res.json(osmPlaces);
    }

    const fallbacks = getFallbackPlaces('hotels', lat, lng, lang);
    res.json(fallbacks);
  });

  app.get("/api/places/nearby-restaurants", async (req, res) => {
    const lat = Number(req.query.latitude) || 24.7136;
    const lng = Number(req.query.longitude) || 46.6753;
    const radius = Number(req.query.radius) || 25000;
    const lang = (req.query.language as string) || 'ar';

    const osmPlaces = await fetchOsmPlaces(lat, lng, radius, 'restaurant', lang);
    if (osmPlaces && osmPlaces.length > 0) {
      return res.json(osmPlaces);
    }

    const fallbacks = getFallbackPlaces('restaurants', lat, lng, lang);
    res.json(fallbacks);
  });

  app.get("/api/places/nearby-cafes", async (req, res) => {
    const lat = Number(req.query.latitude) || 24.7136;
    const lng = Number(req.query.longitude) || 46.6753;
    const radius = Number(req.query.radius) || 25000;
    const lang = (req.query.language as string) || 'ar';

    const osmPlaces = await fetchOsmPlaces(lat, lng, radius, 'cafe', lang);
    if (osmPlaces && osmPlaces.length > 0) {
      return res.json(osmPlaces);
    }

    const fallbacks = getFallbackPlaces('cafes', lat, lng, lang);
    res.json(fallbacks);
  });

  app.get("/api/places/details/:osmId", (req, res) => {
    const { osmId } = req.params;
    const lang = (req.query.language as string) || 'ar';

    const allPlaces = [
      ...getFallbackPlaces('hotels', 24.7136, 46.6753, lang),
      ...getFallbackPlaces('restaurants', 24.7136, 46.6753, lang),
      ...getFallbackPlaces('cafes', 24.7136, 46.6753, lang)
    ];

    const match = (allPlaces.find(p => p.osmId === osmId || p.id === osmId) || allPlaces[0]) as typeof allPlaces[0] & { phone?: string; website?: string; cuisine?: string };

    res.json({
      id: match.id,
      osmId: match.osmId,
      name: match.name,
      address: match.address,
      latitude: match.latitude,
      longitude: match.longitude,
      phone: match.phone || '+966 11 000 0000',
      website: match.website || 'https://example.com',
      openingHours: match.openingHours || '09:00 AM - 11:00 PM',
      cuisine: match.cuisine || (lang === 'ar' ? 'متنوع' : 'Varied'),
      accessibility: lang === 'ar' ? 'مناسب لذوي الاحتياجات الخاصة' : 'Wheelchair Accessible',
      photos: [
        match.image,
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
      ]
    });
  });

  // --- Phase 2: Unified Reservations APIs ---
  app.get("/api/bookings", (req, res) => {
    const user = getLoggedInUser(req);
    const bookings = db.getBookings().filter(b => b.userId === user.id);
    res.json(bookings);
  });

  app.get("/api/bookings/:id", (req, res) => {
    const booking = db.getBookings().find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking ticket not found" });
    res.json(booking);
  });

  app.post("/api/bookings/create", (req, res) => {
    const user = getLoggedInUser(req);
    const { type, itemId, startDate, endDate, roomId, travelersCount } = req.body;
    
    let itemNameEn = '';
    let itemNameAr = '';
    let itemImage = '';
    let pricePerUnit = 0;
    let cancelPolicyEn = 'Standard policy.';
    let cancelPolicyAr = 'السياسة القياسية.';

    if (type === 'package') {
      const pkg = db.getPackages().find(p => p.id === itemId);
      if (!pkg) return res.status(404).json({ error: "Package not found" });
      itemNameEn = pkg.nameEn;
      itemNameAr = pkg.nameAr;
      itemImage = pkg.images[0];
      pricePerUnit = pkg.pricePerPerson * (Number(travelersCount) || 1);
      cancelPolicyEn = pkg.cancellationPolicyEn;
      cancelPolicyAr = pkg.cancellationPolicyAr;
    } else if (type === 'guide') {
      const guide = db.getGuides().find(g => g.id === itemId);
      if (!guide) return res.status(404).json({ error: "Guide not found" });
      itemNameEn = `Local Guide: ${guide.nameEn}`;
      itemNameAr = `المرشد المحلي: ${guide.nameAr}`;
      itemImage = guide.avatar;
      pricePerUnit = guide.pricePerDay; 
      cancelPolicyEn = 'Free cancellation up to 24 hours before start.';
      cancelPolicyAr = 'إلغاء مجاني قبل ٢٤ ساعة من الموعد.';
    } else if (type === 'accommodation') {
      const hotel = db.getAccommodations().find(h => h.id === itemId);
      if (!hotel) return res.status(404).json({ error: "Accommodation not found" });
      const room = hotel.rooms.find(r => r.id === roomId);
      pricePerUnit = room ? room.pricePerNight : 200;
      itemNameEn = `${hotel.nameEn} (${room ? room.nameEn : 'Room'})`;
      itemNameAr = `${hotel.nameAr} (${room ? room.nameAr : 'غرفة'})`;
      itemImage = hotel.images[0];
      cancelPolicyEn = hotel.cancellationPolicyEn;
      cancelPolicyAr = hotel.cancellationPolicyAr;
    }

    const basePrice = pricePerUnit;
    const taxes = Math.round(basePrice * 0.15);
    const totalPrice = basePrice + taxes;

    const newBooking: Booking = {
      id: 'bkg_' + Math.floor(100000 + Math.random() * 900000),
      userId: user.id,
      type,
      itemId,
      itemNameEn,
      itemNameAr,
      itemImage,
      status: 'pending',
      startDate,
      endDate: endDate || startDate,
      priceDetails: { basePrice, taxes, totalPrice },
      qrCode: 'qr_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
      cancellationPolicyEn: cancelPolicyEn,
      cancellationPolicyAr: cancelPolicyAr,
      createdAt: new Date().toISOString()
    };

    const bookings = db.getBookings();
    bookings.push(newBooking);
    db.saveBookings(bookings);

    // Notify user
    const userNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId: user.id,
      type: 'booking',
      titleEn: 'Booking Requested',
      titleAr: 'تم تقديم طلب الحجز',
      contentEn: `Your booking request for ${itemNameEn} is pending verification.`,
      contentAr: `طلب الحجز الخاص بك لـ ${itemNameAr} في انتظار تأكيد مقدم الخدمة.`,
      isRead: false,
      link: '/profile',
      createdAt: new Date().toISOString()
    };
    const notifs = db.getNotifications();
    notifs.push(userNotif);
    db.saveNotifications(notifs);

    res.json({ success: true, booking: newBooking });
  });

  app.post("/api/bookings/:id/cancel", (req, res) => {
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Booking not found" });

    bookings[index].status = 'cancelled';
    db.saveBookings(bookings);
    res.json({ success: true, booking: bookings[index] });
  });

  app.post("/api/bookings/:id/complete", (req, res) => {
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Booking not found" });

    bookings[index].status = 'completed';
    db.saveBookings(bookings);
    res.json({ success: true, booking: bookings[index] });
  });

  app.post("/api/bookings/:id/review", (req, res) => {
    const user = getLoggedInUser(req);
    const bookings = db.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: "Reviews are only allowed after booking is completed." });
    }

    const { rating, comment, cleanliness, safety, price, service, crowding } = req.body;
    const newReview: Review = {
      id: 'rev_' + Date.now(),
      userId: user.id,
      userName: user.name,
      itemId: booking.itemId,
      bookingId: booking.id,
      rating,
      comment,
      cleanlinessRating: cleanliness,
      safetyRating: safety,
      priceRating: price,
      serviceRating: service,
      crowdRating: crowding,
      createdAt: new Date().toISOString()
    };

    const reviews = db.getReviews();
    reviews.push(newReview);
    db.saveReviews(reviews);

    res.json({ success: true, review: newReview });
  });

  // --- Phase 3: AI Planner Route (Gemini Integration) ---
  app.post("/api/chat/planner", async (req, res) => {
    try {
      const { cities, budget, daysCount, interests, tripType, transport, accommodation } = req.body;

      const prompt = `Generate a comprehensive day-by-day travel plan for a tourist in Saudi Arabia visiting: ${cities.join(', ')} for ${daysCount} days with a ${budget} budget. Interests: ${interests.join(', ')}. Trip type: ${tripType}. Transport: ${transport}. Lodging: ${accommodation}.
      Return ONLY a raw JSON object conforming to the TypeScript schema:
      interface Activity { time: string; textEn: string; textAr: string; estimatedCostSar: number }
      interface ItineraryDay { dayNumber: number; activitiesEn: Activity[]; activitiesAr: Activity[] }
      interface RecommendedHotel { nameEn: string; nameAr: string; pricePerNightSar: number; rating: number }
      interface RecommendedRestaurant { nameEn: string; nameAr: string; typeEn: string; typeAr: string; avgCostPerPersonSar: number }
      interface BudgetBreakdown { lodgingCostSar: number; transportCostSar: number; activitiesCostSar: number; foodCostSar: number; totalCostSar: number }
      interface TravelPlan {
        days: ItineraryDay[];
        hotels: RecommendedHotel[];
        restaurants: RecommendedRestaurant[];
        budgetBreakdown: BudgetBreakdown;
        routeSummaryEn: string;
        routeSummaryAr: string;
      }
      Do NOT wrap in markdown formatting or write any explanations. Return only valid JSON object matching the TravelPlan interface.`;

      let generatedItinerary = null;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        
        let text = response.text || '';
        // Strip markdown code block wrappers if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        generatedItinerary = JSON.parse(text);
      } catch (geminiErr) {
        console.warn("Gemini planner fallback triggered:", geminiErr);
        // Resilient Fallback to generate a clean programmatic TravelPlan if API key not found or network offline
        const days = Array.from({ length: Number(daysCount) || 1 }, (_, i) => ({
          dayNumber: i + 1,
          activitiesEn: [
            { time: '09:00 AM', textEn: 'Morning walk in historical city center and museums.', estimatedCostSar: 30 },
            { time: '01:00 PM', textEn: 'Traditional lunch at recommended local restaurant.', estimatedCostSar: 75 },
            { time: '04:00 PM', textEn: 'Afternoon nature sightseeing and sunset viewpoints.', estimatedCostSar: 0 }
          ],
          activitiesAr: [
            { time: '09:00 ص', textAr: 'جولة مشي صباحية في وسط البلد التراثي والمتاحف.', estimatedCostSar: 30 },
            { time: '01:00 م', textAr: 'وجبة غداء تراثية في مطعم شعبي موصى به.', estimatedCostSar: 75 },
            { time: '04:00 م', textAr: 'جولة استكشافية طبيعية ومشاهدة الغروب من المطل.', estimatedCostSar: 0 }
          ]
        }));
        
        generatedItinerary = {
          days,
          hotels: [
            { nameEn: 'Saudi Heritage Hotel', nameAr: 'فندق التراث السعودي', pricePerNightSar: 350, rating: 4.8 },
            { nameEn: 'Desert Resort & Spa', nameAr: 'منتجع وسبا الصحراء', pricePerNightSar: 600, rating: 4.6 }
          ],
          restaurants: [
            { nameEn: 'Najd Village Restaurant', nameAr: 'مطعم القرية النجدية', typeEn: 'Traditional', typeAr: 'تراثي سعودي', avgCostPerPersonSar: 90 },
            { nameEn: 'Red Sea Grill', nameAr: 'شواية البحر الأحمر', typeEn: 'Seafood', typeAr: 'مأكولات بحرية', avgCostPerPersonSar: 120 }
          ],
          budgetBreakdown: {
            lodgingCostSar: (Number(daysCount) || 1) * 450,
            transportCostSar: (Number(daysCount) || 1) * 150,
            activitiesCostSar: (Number(daysCount) || 1) * 50,
            foodCostSar: (Number(daysCount) || 1) * 180,
            totalCostSar: (Number(daysCount) || 1) * 830
          },
          routeSummaryEn: `Optimized route starting from regional city hub covering highlights.`,
          routeSummaryAr: `مسار رحلة مُحسّن يبدأ من مركز المدينة الإقليمي ويغطي أبرز المعالم السياحية.`
        };
      }

      res.json({ success: true, itinerary: generatedItinerary });
    } catch (error: any) {
      console.error("AI Planner error:", error);
      res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  });

  // --- Phase 3: Travel Agency Quotes Center ---
  app.post("/api/quotes/request", (req, res) => {
    const user = getLoggedInUser(req);
    const { cities, startDate, daysCount, budget, notes } = req.body;

    const newRequest: QuoteRequest = {
      id: 'quote_req_' + Date.now(),
      userId: user.id,
      userName: user.name,
      cities,
      startDate,
      daysCount: Number(daysCount),
      budget,
      notes,
      createdAt: new Date().toISOString()
    };

    const requests = db.getQuoteRequests();
    requests.push(newRequest);
    db.saveQuoteRequests(requests);

    res.json({ success: true, request: newRequest });
  });

  app.get("/api/quotes/requests", (req, res) => {
    res.json(db.getQuoteRequests());
  });

  app.get("/api/quotes/my-requests", (req, res) => {
    const user = getLoggedInUser(req);
    const requests = db.getQuoteRequests().filter(r => r.userId === user.id);
    const proposals = db.getQuoteProposals();
    
    // Group proposals by request
    const result = requests.map(reqItem => ({
      ...reqItem,
      proposals: proposals.filter(p => p.requestId === reqItem.id)
    }));

    res.json(result);
  });

  app.post("/api/quotes/:requestId/proposal", (req, res) => {
    const user = getLoggedInUser(req);
    const { price, itinerarySummary } = req.body;

    const newProposal: QuoteProposal = {
      id: 'proposal_' + Date.now(),
      requestId: req.params.requestId,
      officeId: user.id === 'user_sarah' ? 'office_saudi_tours' : user.id,
      officeNameEn: user.name || 'Local Agency',
      officeNameAr: user.name || 'وكالة محلية',
      price: Number(price),
      itinerarySummary,
      status: 'pending'
    };

    const proposals = db.getQuoteProposals();
    proposals.push(newProposal);
    db.saveQuoteProposals(proposals);

    res.json({ success: true, proposal: newProposal });
  });

  app.post("/api/quotes/proposals/:proposalId/accept", (req, res) => {
    const user = getLoggedInUser(req);
    const proposals = db.getQuoteProposals();
    const index = proposals.findIndex(p => p.id === req.params.proposalId);
    if (index === -1) return res.status(404).json({ error: "Proposal not found" });

    proposals[index].status = 'accepted';
    db.saveQuoteProposals(proposals);

    // Create a pending booking ticket
    const newBooking: Booking = {
      id: 'bkg_' + Math.floor(100000 + Math.random() * 900000),
      userId: user.id,
      type: 'package',
      itemId: proposals[index].id,
      itemNameEn: `Custom Package: ${proposals[index].officeNameEn}`,
      itemNameAr: `بكج مخصص: ${proposals[index].officeNameAr}`,
      itemImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      priceDetails: {
        basePrice: proposals[index].price,
        taxes: Math.round(proposals[index].price * 0.15),
        totalPrice: Math.round(proposals[index].price * 1.15)
      },
      qrCode: 'qr_token_' + Date.now(),
      invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
      cancellationPolicyEn: 'Standard custom package cancellation policy.',
      cancellationPolicyAr: 'تطبق الشروط والأحكام القياسية لعروض الأسعار.',
      createdAt: new Date().toISOString()
    };

    const bookings = db.getBookings();
    bookings.push(newBooking);
    db.saveBookings(bookings);

    res.json({ success: true, booking: newBooking });
  });

  // --- Phase 3: In-App Messaging Chats ---
  app.get("/api/chats", (req, res) => {
    const user = getLoggedInUser(req);
    const sessions = db.getChatSessions().filter(s => s.participants.includes(user.id));
    res.json(sessions);
  });

  app.get("/api/chats/:id", (req, res) => {
    const session = db.getChatSessions().find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: "Chat thread not found" });
    res.json(session);
  });

  app.post("/api/chats/:id/send", (req, res) => {
    const user = getLoggedInUser(req);
    const { text, imageUrl, location } = req.body;

    const sessions = db.getChatSessions();
    const index = sessions.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Chat thread not found" });

    const newMsg = {
      senderId: user.id,
      senderName: user.name,
      text,
      imageUrl,
      location,
      createdAt: new Date().toISOString()
    };

    sessions[index].messages.push(newMsg);
    db.saveChatSessions(sessions);

    res.json(sessions[index]);
  });

  app.post("/api/bookings/checkout", (req, res) => {
    const user = getLoggedInUser(req);
    const { basePrice, couponCode, pointsToRedeem, bookingId } = req.body;

    let discount = 0;
    // 1. Coupon checks
    if (couponCode === 'LDF2026') {
      discount += Math.round(basePrice * 0.10); // 10% discount
    }

    // 2. Points checks (100 points = 10 SAR)
    let pointsCost = 0;
    if (pointsToRedeem) {
      const redeemed = Number(pointsToRedeem);
      if (user.points < redeemed) {
        return res.status(400).json({ error: "Insufficient points balance." });
      }
      discount += Math.round(redeemed / 10);
      pointsCost = redeemed;
    }

    const priceAfterDiscount = Math.max(0, basePrice - discount);
    const taxes = Math.round(priceAfterDiscount * 0.15);
    const totalPrice = priceAfterDiscount + taxes;

    // Loyalty points reward: 10% of cash spent is rewarded back as points!
    const pointsEarned = Math.round(totalPrice * 0.10);

    // Update user balance
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].points = Math.max(0, users[userIndex].points - pointsCost + pointsEarned);
      if (users[userIndex].points > 500 && !users[userIndex].badges.includes('Trusted Contributor')) {
        users[userIndex].badges.push('Trusted Contributor');
      }
      db.saveUsers(users);
    }

    // Mark the booking as confirmed
    if (bookingId) {
      const bookings = db.getBookings();
      const bIndex = bookings.findIndex(b => b.id === bookingId);
      if (bIndex !== -1) {
        bookings[bIndex].status = 'confirmed';
        bookings[bIndex].priceDetails = {
          basePrice,
          taxes,
          totalPrice
        };
        db.saveBookings(bookings);
      }
    }

    res.json({
      success: true,
      totalPrice,
      discount,
      pointsEarned,
      newUserPoints: userIndex !== -1 ? users[userIndex].points : user.points
    });
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are an expert, friendly AI travel planner for "LDF (Local Destination Finder)", focusing on Saudi Arabia tourism.
          You help users discover amazing places in Saudi Arabia, like Abha, AlUla, Riyadh, Jeddah, Taif, NEOM, The Red Sea, Diriyah, Hegra, and Farasan Islands.
          Keep answers concise, engaging, and highly informative. Format with short paragraphs and bullet points for readability. Provide recommendations that fit a premium, modern travel experience.`,
        },
      });

      const lastMessage = messages[messages.length - 1].content;

      const response = await chat.sendMessage({ message: lastMessage });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

