import React, { createContext, useState, useEffect } from 'react';
import { getProperties } from '../api/propertyService';

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  const fetchProperties = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProperties(filterParams);
      setProperties(data.properties || []);
    } catch (err) {
      setError('Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  return (
    <PropertyContext.Provider
      value={{ properties, loading, error, filters, setFilters, fetchProperties }}
    >
      {children}
    </PropertyContext.Provider>
  );
};
