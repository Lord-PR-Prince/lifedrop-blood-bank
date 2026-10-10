require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend files
app.use(express.static(path.join(__dirname, "../frontend")));


// =========================
// COMMON CONSTANTS
// =========================

const BLOOD_GROUPS = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-"
];

// =========================
// USER MODEL
// =========================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

// =========================
// PENDING SIGNUP MODEL
// =========================

const pendingSignupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: ""
    },

    otpHash: {
      type: String,
      required: true
    },

    otpExpiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const PendingSignup = mongoose.model(
  "PendingSignup",
  pendingSignupSchema
);

// =========================
// DONOR MODEL
// =========================

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // Extra donor information
    lastDonationDate: {
      type: String,
      default: "",
      trim: true
    },

    preferredHospital: {
      type: String,
      default: "",
      trim: true
    },

    orderId: {
      type: String,
      unique: true,
      index: true
    },

    trackId: {
      type: String,
      unique: true,
      index: true
    },

    status: {
      type: String,
      default: "Pending"
    },

    statusMessage: {
      type: String,
      default: "Donor registration received."
    },

    userId: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Donor = mongoose.model("Donor", donorSchema);

// =========================
// NORMAL BLOOD REQUEST MODEL
// =========================

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS
    },

    units: {
      type: Number,
      required: true,
      min: 1
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true
    },

    contact: {
      type: String,
      required: true,
      trim: true
    },

    details: {
      type: String,
      default: "",
      trim: true
    },

    orderId: {
      type: String,
      unique: true,
      index: true
    },

    trackId: {
      type: String,
      unique: true,
      index: true
    },

    status: {
      type: String,
      default: "Pending"
    },

    statusMessage: {
      type: String,
      default: "Blood request received."
    },

    userId: {
      type: String,
      default: "",
      index: true
    },

    requester: {
      name: {
        type: String,
        default: ""
      },

      email: {
        type: String,
        default: ""
      },

      phone: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: true
  }
);

const BloodRequest = mongoose.model(
  "BloodRequest",
  bloodRequestSchema
);

// =========================
// EMERGENCY BLOOD MODEL
// =========================

const emergencyBloodSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS
    },

    units: {
      type: Number,
      required: true,
      min: 1
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true
    },

    contact: {
      type: String,
      required: true,
      trim: true
    },

    details: {
      type: String,
      default: "",
      trim: true
    },

    priority: {
      type: String,
      default: "emergency"
    },

    orderId: {
      type: String,
      unique: true,
      index: true
    },

    trackId: {
      type: String,
      unique: true,
      index: true
    },

    status: {
      type: String,
      default: "Pending"
    },

    statusMessage: {
      type: String,
      default: "Emergency blood request received."
    },

    userId: {
      type: String,
      default: "",
      index: true
    },

    requester: {
      name: {
        type: String,
        default: ""
      },

      email: {
        type: String,
        default: ""
      },

      phone: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: true
  }
);

const EmergencyBlood = mongoose.model(
  "EmergencyBlood",
  emergencyBloodSchema
);

// =========================
// HOSPITAL MODEL
// =========================

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    city: {
      type: String,
      default: "",
      trim: true
    },

    address: {
      type: String,
      default: "",
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Hospital = mongoose.model(
  "Hospital",
  hospitalSchema
);

// =========================
// EMAIL
// =========================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =========================
// HELPER FUNCTIONS
// =========================

function generateOTP() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

function generateOrderId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomInt(1000, 10000)}`;
}

function generateTrackId(prefix) {
  return `LD-${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// Escape special regex characters
function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LifeDrop backend is running.",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// =========================
// SIGNUP
// =========================

app.post("/api/signup", async (req, res) => {
  try {
    const name = String(
      req.body.name || ""
    ).trim();

    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || ""
    );

    const phone = String(
      req.body.phone || ""
    ).replace(/\D/g, "");

    const bloodGroup = String(
      req.body.bloodGroup || ""
    ).trim();

    if (!name || !email || !password || !phone || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required."
      });
    }

    if (phone.length < 10 || phone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number."
      });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters."
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists."
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const expiresMinutes =
      Number(
        process.env.OTP_EXPIRES_MINUTES
      ) || 10;

    const otpExpiresAt = new Date(
      Date.now() +
        expiresMinutes * 60 * 1000
    );

    await PendingSignup.findOneAndDelete({
      email
    });

    await PendingSignup.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bloodGroup,
      otpHash,
      otpExpiresAt
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject:
        "LifeDrop Email Verification OTP",

      text:
        `Your LifeDrop verification OTP is ${otp}.\n\n` +
        `This OTP expires in ${expiresMinutes} minutes.`
    });

    res.json({
      success: true,
      message: "OTP sent successfully."
    });

  } catch (error) {
    console.error(
      "SIGNUP ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create signup request.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
});

// =========================
// VERIFY OTP
// =========================

app.post(
  "/api/verify-otp",
  async (req, res) => {
    try {
      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const otp = String(
        req.body.otp || ""
      ).trim();

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required."
        });
      }

      const pending =
        await PendingSignup.findOne({
          email
        });

      if (!pending) {
        return res.status(404).json({
          success: false,
          message:
            "Signup request not found or OTP expired."
        });
      }

      if (
        new Date() >
        pending.otpExpiresAt
      ) {
        await PendingSignup.deleteOne({
          _id: pending._id
        });

        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please sign up again."
        });
      }

      const incomingOtpHash =
        hashOTP(otp);

      if (
        incomingOtpHash !==
        pending.otpHash
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP."
        });
      }

      const existingUser =
        await User.findOne({
          email: pending.email
        });

      if (existingUser) {
        await PendingSignup.deleteOne({
          _id: pending._id
        });

        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists."
        });
      }

      const user =
        await User.create({
          name: pending.name,
          email: pending.email,
          password: pending.password,
          phone: pending.phone || "",
          bloodGroup: pending.bloodGroup || ""
        });

      await PendingSignup.deleteOne({
        _id: pending._id
      });

      res.status(201).json({
        success: true,
        message:
          "Account created successfully.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bloodGroup: user.bloodGroup
        }
      });

    } catch (error) {
      console.error(
        "OTP VERIFY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to verify OTP.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// LOGIN
// =========================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      );

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required."
        });
      }

      const user =
        await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password."
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password."
        });
      }

      res.json({
        success: true,
        message:
          "Login successful.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bloodGroup: user.bloodGroup
        }
      });

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to login."
      });
    }
  }
);

// ======================================================
// DONOR APIs
// ======================================================

// =========================
// SAVE DONOR
// =========================

app.post(
  "/api/donors",
  async (req, res) => {
    try {
      const name = String(
        req.body.name || ""
      ).trim();

      const phone = String(
        req.body.phone || ""
      ).trim();

      const bloodGroup = String(
        req.body.bloodGroup || ""
      ).trim();

      const city = String(
        req.body.city || ""
      ).trim();

      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const lastDonationDate =
        String(
          req.body.lastDonationDate || ""
        ).trim();

      const preferredHospital =
        String(
          req.body.preferredHospital || ""
        ).trim();

      const userId = String(
        req.body.userId || ""
      ).trim();

      if (
        !name ||
        !phone ||
        !bloodGroup ||
        !city ||
        !email
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required donor fields."
        });
      }

      if (
        !BLOOD_GROUPS.includes(
          bloodGroup
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blood group."
        });
      }

      const donor =
        await Donor.create({
          name,
          phone,
          bloodGroup,
          city,
          email,
          lastDonationDate,
          preferredHospital,
          userId,
          orderId: generateOrderId("DON"),
          trackId: generateTrackId("DON"),
          status: "Pending",
          statusMessage: "Donor registration received."
        });

      console.log(
        "DONOR SAVED:",
        donor._id
      );

      res.status(201).json({
        success: true,
        message:
          "Donor saved successfully.",
        donor,
        orderId: donor.orderId,
        trackId: donor.trackId
      });

    } catch (error) {
      console.error(
        "DONOR SAVE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save donor.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// GET DONORS
// =========================

app.get(
  "/api/donors",
  async (req, res) => {
    try {
      const donors =
        await Donor.find()
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        donors
      });

    } catch (error) {
      console.error(
        "DONOR LIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load donors."
      });
    }
  }
);

// =========================
// DELETE DONOR
// =========================

app.delete(
  "/api/donors/:id",
  async (req, res) => {
    try {
      const donor =
        await Donor.findByIdAndDelete(
          req.params.id
        );

      if (!donor) {
        return res.status(404).json({
          success: false,
          message:
            "Donor not found."
        });
      }

      res.json({
        success: true,
        message:
          "Donor deleted successfully."
      });

    } catch (error) {
      console.error(
        "DONOR DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete donor."
      });
    }
  }
);

// ======================================================
// NORMAL BLOOD REQUEST APIs
// ======================================================

// =========================
// SAVE NORMAL BLOOD REQUEST
// =========================

app.post(
  "/api/blood-requests",
  async (req, res) => {
    try {
      const patientName =
        String(
          req.body.patientName || ""
        ).trim();

      const bloodGroup =
        String(
          req.body.bloodGroup || ""
        ).trim();

      const units =
        Number(req.body.units);

      const hospitalName =
        String(
          req.body.hospitalName ||
          req.body.hospital ||
          ""
        ).trim();

      const contact =
        String(
          req.body.contact || ""
        ).trim();

      const details =
        String(
          req.body.details ||
          req.body.address ||
          ""
        ).trim();

      const requester =
        req.body.requester || {};

      if (
        !patientName ||
        !bloodGroup ||
        !units ||
        !hospitalName ||
        !contact
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required blood request fields."
        });
      }

      if (
        !BLOOD_GROUPS.includes(
          bloodGroup
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blood group."
        });
      }

      if (
        !Number.isFinite(units) ||
        units < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Units must be at least 1."
        });
      }

      const request =
        await BloodRequest.create({
          patientName,
          bloodGroup,
          units,
          hospitalName,
          contact,
          details,
          userId: String(req.body.userId || "").trim(),
          orderId: generateOrderId("REQ"),
          trackId: generateTrackId("REQ"),
          status: "Pending",
          statusMessage: "Blood request received.",

          requester: {
            name: String(
              requester.name || ""
            ),

            email: String(
              requester.email || ""
            ),

            phone: String(
              requester.phone || ""
            )
          }
        });

      console.log(
        "NORMAL BLOOD REQUEST SAVED:",
        request._id
      );

      res.status(201).json({
        success: true,
        message:
          "Blood request saved successfully.",
        request,
        orderId: request.orderId,
        trackId: request.trackId
      });

    } catch (error) {
      console.error(
        "BLOOD REQUEST SAVE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save blood request.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// OLD NORMAL REQUEST ROUTE
// Compatibility
// =========================

app.post(
  "/api/requests",
  async (req, res) => {
    try {
      const patientName =
        String(
          req.body.patientName || ""
        ).trim();

      const bloodGroup =
        String(
          req.body.bloodGroup || ""
        ).trim();

      const units =
        Number(req.body.units);

      const hospitalName =
        String(
          req.body.hospitalName ||
          req.body.hospital ||
          ""
        ).trim();

      const contact =
        String(
          req.body.contact || ""
        ).trim();

      const details =
        String(
          req.body.details ||
          req.body.address ||
          ""
        ).trim();

      const requester =
        req.body.requester || {};

      if (
        !patientName ||
        !bloodGroup ||
        !units ||
        !hospitalName ||
        !contact
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required blood request fields."
        });
      }

      const request =
        await BloodRequest.create({
          patientName,
          bloodGroup,
          units,
          hospitalName,
          contact,
          details,
          userId: String(req.body.userId || "").trim(),
          orderId: generateOrderId("REQ"),
          trackId: generateTrackId("REQ"),
          status: "Pending",
          statusMessage: "Blood request received.",

          requester: {
            name: String(
              requester.name || ""
            ),

            email: String(
              requester.email || ""
            ),

            phone: String(
              requester.phone || ""
            )
          }
        });

      console.log(
        "NORMAL BLOOD REQUEST SAVED:",
        request._id
      );

      res.status(201).json({
        success: true,
        message:
          "Blood request saved successfully.",
        request,
        orderId: request.orderId,
        trackId: request.trackId
      });

    } catch (error) {
      console.error(
        "OLD BLOOD REQUEST SAVE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save blood request.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// GET NORMAL BLOOD REQUESTS
// =========================

app.get(
  "/api/blood-requests",
  async (req, res) => {
    try {
      const requests =
        await BloodRequest.find()
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        requests
      });

    } catch (error) {
      console.error(
        "BLOOD REQUEST LIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load blood requests."
      });
    }
  }
);

// =========================
// OLD GET REQUESTS
// Compatibility
// =========================

app.get(
  "/api/requests",
  async (req, res) => {
    try {
      const requests =
        await BloodRequest.find()
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        requests
      });

    } catch (error) {
      console.error(
        "REQUEST LIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load blood requests."
      });
    }
  }
);

// =========================
// DELETE NORMAL REQUEST
// =========================

app.delete(
  "/api/blood-requests/:id",
  async (req, res) => {
    try {
      const request =
        await BloodRequest.findByIdAndDelete(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Blood request not found."
        });
      }

      res.json({
        success: true,
        message:
          "Blood request deleted successfully."
      });

    } catch (error) {
      console.error(
        "BLOOD REQUEST DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete blood request."
      });
    }
  }
);

// =========================
// OLD DELETE REQUEST
// Compatibility
// =========================

app.delete(
  "/api/requests/:id",
  async (req, res) => {
    try {
      const request =
        await BloodRequest.findByIdAndDelete(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Blood request not found."
        });
      }

      res.json({
        success: true,
        message:
          "Blood request deleted successfully."
      });

    } catch (error) {
      console.error(
        "REQUEST DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete blood request."
      });
    }
  }
);

// ======================================================
// EMERGENCY BLOOD APIs
// ======================================================

// =========================
// SAVE EMERGENCY REQUEST
// =========================

app.post(
  "/api/emergency-blood",
  async (req, res) => {
    try {
      const patientName =
        String(
          req.body.patientName || ""
        ).trim();

      const bloodGroup =
        String(
          req.body.bloodGroup || ""
        ).trim();

      const units =
        Number(req.body.units);

      const hospitalName =
        String(
          req.body.hospitalName ||
          req.body.hospital ||
          ""
        ).trim();

      const contact =
        String(
          req.body.contact || ""
        ).trim();

      const details =
        String(
          req.body.details ||
          req.body.address ||
          ""
        ).trim();

      const requester =
        req.body.requester || {};

      if (
        !patientName ||
        !bloodGroup ||
        !units ||
        !hospitalName ||
        !contact
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required emergency blood fields."
        });
      }

      if (
        !BLOOD_GROUPS.includes(
          bloodGroup
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blood group."
        });
      }

      if (
        !Number.isFinite(units) ||
        units < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Units must be at least 1."
        });
      }

      const emergencyRequest =
        await EmergencyBlood.create({
          patientName,
          bloodGroup,
          units,
          hospitalName,
          contact,
          details,
          priority: "emergency",
          userId: String(req.body.userId || "").trim(),
          orderId: generateOrderId("EMG"),
          trackId: generateTrackId("EMG"),
          status: "Pending",
          statusMessage: "Emergency blood request received.",

          requester: {
            name: String(
              requester.name || ""
            ),

            email: String(
              requester.email || ""
            ),

            phone: String(
              requester.phone || ""
            )
          }
        });

      console.log(
        "EMERGENCY BLOOD REQUEST SAVED:",
        emergencyRequest._id
      );

      res.status(201).json({
        success: true,
        message:
          "Emergency blood request saved successfully.",
        request: emergencyRequest,
        orderId: emergencyRequest.orderId,
        trackId: emergencyRequest.trackId
      });

    } catch (error) {
      console.error(
        "EMERGENCY BLOOD SAVE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save emergency blood request.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// GET EMERGENCY REQUESTS
// =========================

app.get(
  "/api/emergency-blood",
  async (req, res) => {
    try {
      const requests =
        await EmergencyBlood.find()
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        requests
      });

    } catch (error) {
      console.error(
        "EMERGENCY LIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load emergency requests."
      });
    }
  }
);

// =========================
// DELETE EMERGENCY REQUEST
// =========================

app.delete(
  "/api/emergency-blood/:id",
  async (req, res) => {
    try {
      const request =
        await EmergencyBlood.findByIdAndDelete(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Emergency blood request not found."
        });
      }

      res.json({
        success: true,
        message:
          "Emergency blood request deleted successfully."
      });

    } catch (error) {
      console.error(
        "EMERGENCY DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete emergency request."
      });
    }
  }
);

// ======================================================
// USER PROFILE / MY REQUESTS / TRACKING
// ======================================================

app.get("/api/me", async (req, res) => {
  try {
    const userId = String(req.query.userId || "").trim();
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone || "", bloodGroup: user.bloodGroup || "" } });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load profile." });
  }
});

app.get("/api/my-requests", async (req, res) => {
  try {
    const userId = String(req.query.userId || "").trim();
    const email = String(req.query.email || "").trim().toLowerCase();

    if (!userId && !email) {
      return res.status(400).json({ success: false, message: "userId or email is required." });
    }

    const userFilter = userId ? { userId } : {};
    const requesterFilter = email ? { "requester.email": email } : {};

    const [bloodRequests, emergencyRequests, donors] = await Promise.all([
      BloodRequest.find(userId ? userFilter : requesterFilter).sort({ createdAt: -1 }).lean(),
      EmergencyBlood.find(userId ? userFilter : requesterFilter).sort({ createdAt: -1 }).lean(),
      Donor.find(userId ? userFilter : { email }).sort({ createdAt: -1 }).lean()
    ]);

    const requests = [
      ...bloodRequests.map(r => ({ ...r, type: "blood", requestType: "Request Blood", hospital: r.hospitalName })),
      ...emergencyRequests.map(r => ({ ...r, type: "emergency", requestType: "Emergency Blood", hospital: r.hospitalName })),
      ...donors.map(r => ({ ...r, type: "donor", requestType: "Become a Donor", hospital: r.preferredHospital || "" }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, requests });
  } catch (error) {
    console.error("MY REQUESTS ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load your requests." });
  }
});

app.get("/api/track/:id", async (req, res) => {
  try {
    const trackId = String(req.params.id || "").trim().toUpperCase();
    if (!trackId) {
      return res.status(400).json({ success: false, message: "Track ID is required." });
    }

    let request = await BloodRequest.findOne({ trackId }).lean();
    let type = "Request Blood";

    if (!request) {
      request = await EmergencyBlood.findOne({ trackId }).lean();
      type = "Emergency Blood";
    }

    if (!request) {
      request = await Donor.findOne({ trackId }).lean();
      type = "Become a Donor";
    }

    if (!request) {
      return res.status(404).json({ success: false, message: "No request found for this Track ID." });
    }

    res.json({
      success: true,
      type,
      orderId: request.orderId || "",
      trackId: request.trackId || trackId,
      status: request.status || "Pending",
      statusMessage: request.statusMessage || "",
      request
    });
  } catch (error) {
    console.error("TRACK LOOKUP ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to track this request." });
  }
});

// ======================================================
// INDIA CITY AUTOCOMPLETE
// ======================================================

const INDIA_CITIES = [
  "Delhi", "New Delhi", "Mumbai", "Pune", "Nagpur", "Nashik", "Thane",
  "Faridabad", "Gurugram", "Noida", "Ghaziabad", "Chandigarh", "Jaipur",
  "Jodhpur", "Kota", "Udaipur", "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly",
  "Dehradun", "Haridwar", "Amritsar", "Ludhiana", "Jalandhar", "Patiala",
  "Bengaluru", "Mysuru", "Chennai", "Coimbatore", "Hyderabad", "Visakhapatnam",
  "Vijayawada", "Kolkata", "Bhubaneswar", "Ranchi", "Patna", "Guwahati",
  "Bhopal", "Indore", "Raipur", "Rourkela", "Kochi", "Thiruvananthapuram",
  "Mangaluru", "Goa", "Navi Mumbai", "Vasai-Virar", "Aurangabad", "Mathura",
  "Aligarh", "Moradabad", "Gwalior", "Ajmer", "Srinagar", "Jammu"
];

app.get("/api/india-cities", (req, res) => {
  const search = String(req.query.search || "").trim().toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const cities = INDIA_CITIES
    .filter(city => !search || city.toLowerCase().startsWith(search) || city.toLowerCase().includes(search))
    .slice(0, limit);

  res.json({ success: true, cities });
});

// ======================================================
// HOSPITAL APIs
// ======================================================

// =========================
// HOSPITAL AUTOCOMPLETE
// =========================

app.get(
  "/api/hospitals",
  async (req, res) => {
    try {
      const search = String(
        req.query.search || ""
      ).trim();

      // If nothing is typed, return latest hospitals
      if (!search) {
        const hospitals =
          await Hospital.find()
            .sort({ name: 1 })
            .limit(20);

        return res.json({
          success: true,
          hospitals
        });
      }

      const safeSearch =
        escapeRegex(search);

      const hospitals =
        await Hospital.find({
          name: {
            $regex:
              "^" + safeSearch,
            $options: "i"
          }
        })
          .sort({ name: 1 })
          .limit(10);

      res.json({
        success: true,
        hospitals
      });

    } catch (error) {
      console.error(
        "HOSPITAL SEARCH ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to search hospitals."
      });
    }
  }
);

// =========================
// ADD HOSPITAL
// =========================

app.post(
  "/api/hospitals",
  async (req, res) => {
    try {
      const name = String(
        req.body.name || ""
      ).trim();

      const city = String(
        req.body.city || ""
      ).trim();

      const address = String(
        req.body.address || ""
      ).trim();

      const phone = String(
        req.body.phone || ""
      ).trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Hospital name is required."
        });
      }

      const existing =
        await Hospital.findOne({
          name
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Hospital already exists.",
          hospital: existing
        });
      }

      const hospital =
        await Hospital.create({
          name,
          city,
          address,
          phone
        });

      console.log(
        "HOSPITAL SAVED:",
        hospital._id
      );

      res.status(201).json({
        success: true,
        message:
          "Hospital saved successfully.",
        hospital
      });

    } catch (error) {
      console.error(
        "HOSPITAL SAVE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save hospital.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined
      });
    }
  }
);

// =========================
// GET ALL HOSPITALS
// =========================

app.get(
  "/api/hospitals/all",
  async (req, res) => {
    try {
      const hospitals =
        await Hospital.find()
          .sort({ name: 1 });

      res.json({
        success: true,
        hospitals
      });

    } catch (error) {
      console.error(
        "HOSPITAL LIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load hospitals."
      });
    }
  }
);

// =========================
// DELETE HOSPITAL
// =========================

app.delete(
  "/api/hospitals/:id",
  async (req, res) => {
    try {
      const hospital =
        await Hospital.findByIdAndDelete(
          req.params.id
        );

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message:
            "Hospital not found."
        });
      }

      res.json({
        success: true,
        message:
          "Hospital deleted successfully."
      });

    } catch (error) {
      console.error(
        "HOSPITAL DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete hospital."
      });
    }
  }
);

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing in .env file."
      );
    }

    if (!process.env.EMAIL_USER) {
      throw new Error(
        "EMAIL_USER is missing in .env file."
      );
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error(
        "EMAIL_PASS is missing in .env file."
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "MongoDB connected successfully."
    );
    // Email verification is skipped during server startup.
   // Gmail will still be used when OTP emails are sent.
  console.log(
    "Email transporter configured."
             );
    

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `LifeDrop server running at http://localhost:${PORT}`
        );

        console.log(
          "Blood Request API: /api/blood-requests"
        );

        console.log(
          "Emergency API: /api/emergency-blood"
        );

        console.log(
          "Donor API: /api/donors"
        );

        console.log(
          "Hospital API: /api/hospitals"
        );
      }
    );

  } catch (error) {
    console.error(
      "SERVER START ERROR:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
