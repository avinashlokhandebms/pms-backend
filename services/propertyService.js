import Property from "../models/property.js";
import User from "../models/user.js";

/** Create a new property (superadmin only by policy) */
export async function createPropertyService({ code, name, ownerUserId }) {
  const exists = await Property.findOne({ code });
  if (exists) {
    const e = new Error("Property code already exists");
    e.status = 400;
    throw e;
  }
  const prop = await Property.create({ code, name, ownerUserId });
  return { code: prop.code, name: prop.name };
}

/** Grant membership (role) to a user for a property */
export async function grantMembershipService({ customerId, propertyCode, role }) {
  const user = await User.findOne({ customerId });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  const has = user.memberships.some(m => m.propertyCode === propertyCode);
  if (has) {
    // update role
    user.memberships = user.memberships.map(m =>
      m.propertyCode === propertyCode ? { ...m, role } : m
    );
  } else {
    user.memberships.push({ propertyCode, role });
  }
  await user.save();
  return { ok: true };
}

/** List a user's memberships (properties + roles) */
export async function listUserMembershipsService({ userId }) {
  const user = await User.findById(userId).lean();
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user.memberships || [];
}
