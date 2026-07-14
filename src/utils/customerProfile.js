import { getJSON, setJSON, storage } from "./storage";

// One record per phone number, in SHARED storage — so a customer's saved
// addresses/favorites/name follow their account (phone number) rather than
// being stuck on a single device the way the OTP session is.
const KEY_PREFIX = "vr-veg-customer:";
const keyFor = (phone) => `${KEY_PREFIX}${phone}`;

const blankRecord = (name = "") => ({ name, addresses: [], favorites: [] });

export async function getCustomerRecord(phone, fallbackName = "") {
  if (!phone) return blankRecord(fallbackName);
  const record = await getJSON(keyFor(phone), true, null);
  
  let favorites = record?.favorites || [];
  try {
    const res = await fetch(`/api/favorites/${phone}`);
    if (res.ok) favorites = await res.json();
  } catch (e) { /* fallback to local */ }

  if (!record) return { ...blankRecord(fallbackName), favorites };
  return { ...blankRecord(fallbackName), ...record, favorites };
}

export async function saveCustomerRecord(phone, record) {
  await setJSON(keyFor(phone), record, true);
  return record;
}

export async function updateCustomerName(phone, name) {
  const record = await getCustomerRecord(phone);
  const next = { ...record, name };
  await saveCustomerRecord(phone, next);
  return next;
}

export async function addAddress(phone, address) {
  const record = await getCustomerRecord(phone);
  const next = {
    ...record,
    addresses: [...(record.addresses || []), { id: Date.now().toString(36), ...address }],
  };
  await saveCustomerRecord(phone, next);
  return next;
}

export async function removeAddress(phone, addressId) {
  const record = await getCustomerRecord(phone);
  const next = { ...record, addresses: (record.addresses || []).filter((a) => a.id !== addressId) };
  await saveCustomerRecord(phone, next);
  return next;
}

export async function toggleFavorite(phone, productId) {
  const record = await getCustomerRecord(phone);
  const favs = record.favorites || [];
  const isFav = favs.includes(productId);
  const nextFavs = isFav ? favs.filter((id) => id !== productId) : [...favs, productId];
  const next = { ...record, favorites: nextFavs };
  
  try {
    await fetch(`/api/favorites/${productId}`, {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
  } catch (e) { /* ignore */ }

  await saveCustomerRecord(phone, next);
  return next;
}

// Used when a customer verifies a new phone number: copy their record over
// to the new key so addresses/favorites/name aren't lost.
export async function migrateCustomerRecord(oldPhone, newPhone) {
  const record = await getCustomerRecord(oldPhone);
  await saveCustomerRecord(newPhone, record);
  await storage.delete(keyFor(oldPhone), true);
  return record;
}
