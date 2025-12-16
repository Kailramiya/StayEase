import api from './api';

export const contactOwner = async (payload) => {
  // payload: { propertyId, name, email, phone, preferredContact, message }
  const res = await api.post('/contact', payload, { timeout: 15000 });
  return res.data || res;
};

export default { contactOwner };
