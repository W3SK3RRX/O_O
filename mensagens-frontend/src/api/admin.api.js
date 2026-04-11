import api from './axios'

export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export const getOnlineUsers = async () => {
  const { data } = await api.get('/admin/online')
  return data
}

export const getUsers = async () => {
  const { data } = await api.get('/admin/users')
  return data
}

export const createUser = async payload => {
  const { data } = await api.post('/admin/users', payload)
  return data
}

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/admin/users/${id}`, payload)
  return data
}

export const deleteUser = async id => {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}

export const toggleUserStatus = async (id, active) => {
  await api.patch(`/admin/users/${id}/status`, { active })
}

export const resetUserPassword = async id => {
  const { data } = await api.post(`/admin/users/${id}/reset-password`)
  return data
}