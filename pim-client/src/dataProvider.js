import simpleRestDataProvider from "@refinedev/simple-rest";

/**
 * Custom data provider that wraps @refinedev/simple-rest
 * to handle our API's response format: { success, data, message, statusCode }
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const baseProvider = simpleRestDataProvider(API_URL);

const dataProvider = {
  ...baseProvider,

  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${API_URL}/${resource}`;
    const { current = 1, pageSize = 25 } = pagination ?? {};

    const query = new URLSearchParams();
    query.set("_start", String((current - 1) * pageSize));
    query.set("_end", String(current * pageSize));

    const response = await fetch(`${url}?${query.toString()}`);
    const json = await response.json();

    const data = json.data ?? json;
    const total = json.total ?? (Array.isArray(data) ? data.length : 0);

    return { data, total };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url);
    const json = await response.json();

    return { data: json.data ?? json };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${API_URL}/${resource}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    const json = await response.json();

    return { data: json.data ?? json };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    const json = await response.json();

    return { data: json.data ?? json };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    const json = await response.json();

    return { data: json.data ?? json };
  },
};

export default dataProvider;
