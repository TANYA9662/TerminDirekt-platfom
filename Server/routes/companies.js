import express from "express";
import companyController from "../controllers/companyController.js";
import { authenticateToken, requireRole, requireOwnerOrAdmin } from "../middlewares/authMiddleware.js";
import { createCompanyWithCategory, addCompanyImages, addServices, addSlots } from "../models/Company.js";
import multer from "multer";


const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // fajlovi se čuvaju u memoriji pre slanja u Cloudinary
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB po fajlu
});

/* ===== PUBLIC – SPECIFIC ===== */
router.get("/categories/:id/companies/details", companyController.getCompaniesByCategoryWithDetails);
router.get("/search", companyController.searchCompanies);
router.get("/withDetails", authenticateToken, companyController.getAllCompaniesWithDetails);
router.get("/user-view", companyController.getAllCompaniesForUsers);
router.get("/user/:id/details", companyController.getCompanyByUserWithDetails);
router.get("/user/:id", companyController.getCompanyByUser);
router.get("/:id/details", companyController.getCompanyByIdWithDetails);
router.get("/", companyController.getAllCompanies);

/* ===== AUTH ===== */
router.get("/me", authenticateToken, companyController.getMyCompany);

/* ===== CRUD ===== */
router.post("/", authenticateToken, requireRole("company"), upload.array("images", 10), companyController.upsertCompany);
router.post("/:id/images", authenticateToken, requireOwnerOrAdmin, upload.array("images", 10), companyController.uploadCompanyImages);
router.post(
  "/full",
  authenticateToken,
  requireRole("company"),
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { name, city, categoryId, services } = req.body;
      const parsedServices = JSON.parse(services || "[]");
      const company = await createCompanyWithCategory({ name, city, categoryId });

      if (req.files?.length) await addCompanyImages(company.id, req.files);

      for (const s of parsedServices) {
        const service = await addServices(company.id, s.name, s.price, s.duration);
        if (s.slots?.length) await addSlots(service.id, s.slots);
      }

      res.json({ message: "Firma uspešno kreirana sa svim detaljima", companyId: company.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ne mogu da kreiram firmu sa detaljima" });
    }
  }
);

router.put("/:id", authenticateToken, requireOwnerOrAdmin, companyController.updateCompany);
router.put("/:id/services", authenticateToken, requireOwnerOrAdmin, companyController.updateCompanyServices);
router.put("/:id/slots", authenticateToken, requireOwnerOrAdmin, companyController.saveSlotsHandler);

router.delete("/:id", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompany);
router.delete("/images/:imageId", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompanyImage);
//router.delete("/:id/services/:serviceId", authenticateToken, requireOwnerOrAdmin, companyController.deleteService);
router.delete("/:id/slots/:slotId", authenticateToken, requireOwnerOrAdmin, companyController.deleteSlot);

/* ===== DYNAMIC ROUTES ===== */
router.get("/:id/images", companyController.getCompanyImages);
router.get("/:id/slots", authenticateToken, companyController.getCompanySlots);

export default router;
