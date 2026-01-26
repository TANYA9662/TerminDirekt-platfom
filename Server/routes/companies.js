import express from "express";
import companyController from "../controllers/companyController.js";
import { authenticateToken, requireRole, requireOwnerOrAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

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

router.post("/", authenticateToken, requireRole("company"), upload.array("images", 10), companyController.upsertCompany);
router.post("/:id/images", authenticateToken, requireOwnerOrAdmin, upload.array("images", 10), companyController.uploadCompanyImages);

router.put("/:id", authenticateToken, requireOwnerOrAdmin, companyController.updateCompany);
router.put("/:id/services", authenticateToken, requireOwnerOrAdmin, companyController.updateCompanyServices);
router.put("/:id/slots", authenticateToken, requireOwnerOrAdmin, companyController.saveSlotsHandler);

router.delete("/:id", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompany);
router.delete("/images/:imageId", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompanyImage);
router.delete("/:id/slots/:slotId", authenticateToken, requireOwnerOrAdmin, companyController.deleteSlot);

router.get("/search", companyController.searchCompanies);

export default router;
