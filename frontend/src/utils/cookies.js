// Simple cookie helpers for storing small pieces of data (user, theme, token)
export function setCookie(name, value, days = 7) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const safeValue = typeof value === 'string' ? value : JSON.stringify(value);
    // Use encodeURIComponent to avoid injection of characters
    document.cookie = `${name}=${encodeURIComponent(safeValue)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('setCookie failed', err);
  }
}

export function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (err) {
    console.warn('getCookie failed', err);
    return null;
  }
}

export function deleteCookie(name) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('deleteCookie failed', err);
  }
}
