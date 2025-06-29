import express from "express";
import multer from "multer";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  uploadCSV,
  getLeadStats,
} from "../controller/leadController";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Statistics route
router.get("/stats", getLeadStats);

// CSV upload route
router.post("/upload-csv", upload.single("file"), uploadCSV);

// CRUD routes
router.route("/").get(getAllLeads).post(createLead);

router.route("/:id").get(getLeadById).patch(updateLead).delete(deleteLead);

export default router;
