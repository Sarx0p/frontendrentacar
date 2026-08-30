export function extractListFromApi(responseData) {
  const payload = responseData?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function getPaginator(responseData) {
  const payload = responseData?.data
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) return payload
  return null
}

export async function fetchAllPaginated(request, params = {}) {
  const first = await request(params)
  const firstPaginator = getPaginator(first.data)
  const items = [...extractListFromApi(first.data)]

  if (!firstPaginator?.last_page || firstPaginator.last_page <= firstPaginator.current_page) {
    return { items, response: first }
  }

  const lastPage = Number(firstPaginator.last_page)
  for (let page = Number(firstPaginator.current_page || 1) + 1; page <= lastPage; page++) {
    const res = await request({ ...params, page })
    items.push(...extractListFromApi(res.data))
  }

  return { items, response: first }
}
