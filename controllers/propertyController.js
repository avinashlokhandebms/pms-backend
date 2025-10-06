// backend/controllers/propertyController.js
import User from "../models/user.js";
import Property from "../models/property.js";

export async function grantMembershipController(req, res) {
  try {
    const { customerId, propertyCode, role, modules } = req.body;

    const user = await User.findOne({ customerId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const property = await Property.findOne({ code: propertyCode });
    if (!property) return res.status(404).json({ message: "Property not found" });

    const mem = user.memberships.find(m => m.propertyCode === propertyCode);
    if (mem) {
      mem.role = role;
      mem.modules = modules || [];
    } else {
      user.memberships.push({ propertyCode, role, modules: modules || [] });
    }

    await user.save();
    res.json({ ok: true, message: "Membership updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
