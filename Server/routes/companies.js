import express from "express";
import companyController from "../controllers/companyController.js";
import { authenticateToken, requireRole, requireOwnerOrAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/* ===== PUBLIC ===== */
router.get("/", companyController.getAllCompanies);
router.get("/user/:id", companyController.getCompanyByUser);
router.get("/user/:id/details", authenticateToken, companyController.getCompanyWithDetails);
router.get("/:id/images", companyController.getCompanyImages);

/* ===== AUTHENTICATED ===== */
router.get("/me", authenticateToken, companyController.getMyCompany);

// UPSERT (create/update) company
router.post(
  "/",
  authenticateToken,
  requireRole("company"),
  upload.array("images", 10),
  companyController.upsertCompany
);

// Upload company images
router.post(
  "/:id/images",
  authenticateToken,
  requireOwnerOrAdmin,
  upload.array("images", 10),
  companyController.uploadCompanyImages
);

// Update company info
router.put("/:id", authenticateToken, requireOwnerOrAdmin, companyController.updateCompany);

// Update company services with prices
router.put(
  "/:id/services",
  authenticateToken,
  requireOwnerOrAdmin,
  companyController.updateCompanyServices
);

// Delete company
router.delete("/:id", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompany);

// Delete company image
router.delete("/images/:imageId", authenticateToken, requireOwnerOrAdmin, companyController.deleteCompanyImage);

// Search companies
router.get("/search", companyController.searchCompanies);

export default router;
