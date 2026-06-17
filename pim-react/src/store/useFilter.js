import { useState, useMemo } from 'react'

export function useFilter(items, searchFields, filterKey) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = useMemo(() => {
    let result = Array.isArray(items) ? items : []
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const val = item[field]
          return val && String(val).toLowerCase().includes(q)
        })
      )
    }
    if (filterKey && activeFilter !== 'All') {
      result = result.filter(item => item[filterKey] === activeFilter)
    }
    return result
  }, [items, query, activeFilter])

  return { query, setQuery, activeFilter, setActiveFilter, filtered }
}
