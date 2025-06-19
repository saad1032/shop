import axios from 'axios';

const BASE_URL = 'http://localhost:1337'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const getCategories = () =>
  api.get('/api/categories?populate=*');
export const getProductsByCategory = (categoryId) =>
  api.get(`/api/products?filters[category][id][$eq]=${categoryId}&populate=*`);

export const getProductById = (id) =>
  api.get(`/api/products/${id}?populate=*`);


export const getProductByIdFallback = async (id) => {
  const res = await api.get('/api/products?populate=*');
  const product = (res.data.data || []).find((p) => p.id === Number(id));
  return { data: { data: product } };
};

export default api; 