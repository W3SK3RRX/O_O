import api from './axios'

export const getUsers = async () => {
  const { data } = await api.get('/admin/users')
  return data
}

export const createUser = async payload => {
  const { data } = await api.post('/admin/users', payload)
  return data
}

export const toggleUserStatus = async (id, active) => {
  await api.patch(`/admin/users/${id}/status`, { active })
}

export const resetUserPassword = async id => {
  await api.post(`/admin/users/${id}/reset-password`)
}
