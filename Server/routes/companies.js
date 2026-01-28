import express from "express";
import companyController, { getCompaniesByCategoryWithDetails } from "../controllers/companyController.js";
import { authenticateToken, requireRole, requireOwnerOrAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { createCompanyWithCategory, addCompanyImages, addServices, addSlots } from "../models/Company.js";

const router = express.Router();

/* ===== PUBLIC ===== */
router.get("/withDetails", authenticateToken, companyController.getAllCompaniesWithDetails); // auth only
router.get("/", companyController.getAllCompanies); // lista firmi, guest-friendly
router.get("/user-view", companyController.getAllCompaniesForUsers); // guest može da vidi
router.get("/user/:id", companyController.getCompanyByUser); // guest može da vidi
router.get("/:id/images", companyController.getCompanyImages); // guest može da vidi
router.get("/:id/slots", authenticateToken, companyController.getCompanySlots); // auth only
router.get("/user/:id/details", companyController.getCompanyByUserWithDetails); // guest-friendly

/* ===== AUTH ===== */
router.get("/me", authenticateToken, companyController.getMyCompany);

/* ===== COMPANY CRUD ===== */
router.post("/", authenticateToken, requireRole("company"), upload.array("images", 10), companyController.upsertCompany);
router.post("/:id/images", authenticateToken, requireOwnerOrAdmin, upload.array("images", 10), companyController.uploadCompanyImages);

router.put("/:id", authenticateToken, requireOwnerOrAdmin, companyController.updateCompany);
router.put("/:id/services", authenticateToken, requireOwnerOrAdmin, companyController.updateCompanyServices);
router.put("/:id/slots", authenticateToken, requireOwnerOrAdmin, companyController.saveSlotsHandler);

router.delete("/:id", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompany);
router.delete("/images/:imageId", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompanyImage);
router.delete("/:id/slots/:slotId", authenticateToken, requireOwnerOrAdmin, companyController.deleteSlot);

router.get("/search", companyController.searchCompanies);

/* ===== NEW: FULL COMPANY CREATION ===== */
router.post(
  "/full",
  authenticateToken,
  requireRole("company"),
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { name, city, categoryId, services } = req.body;
      // services očekuje JSON string [{ name, price, duration, slots: [{ start_time, end_time }] }]
      const parsedServices = JSON.parse(services || "[]");

      // 1️⃣ Kreiraj firmu i poveži sa kategorijom
      const company = await createCompanyWithCategory({ name, city, categoryId });

      // 2️⃣ Dodaj slike ako postoje
      if (req.files && req.files.length > 0) {
        await addCompanyImages(company.id, req.files);
      }

      // 3️⃣ Dodaj usluge i slotove
      for (const s of parsedServices) {
        const service = await addServices(company.id, s.name, s.price, s.duration);
        if (s.slots && s.slots.length > 0) {
          await addSlots(service.id, s.slots);
        }
      }

      res.json({ message: "Firma uspešno kreirana sa svim detaljima", companyId: company.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ne mogu da kreiram firmu sa detaljima" });
    }
  }
);

export default router;
