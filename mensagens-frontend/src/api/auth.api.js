import api from './axios'

export const loginRequest = async (email, password) => {
  const { data } = await api.post('/auth/login', {
    email,
    password
  })
  return data
}

export const registerRequest = async (name, email, password) => {
  const { data } = await api.post('/auth/register', {
    name,
    email,
    password
  })
  return data
}

// O refresh token vai no cookie httpOnly (withCredentials); sem body.
export const refreshTokenRequest = async () => {
  const { data } = await api.post('/auth/refresh')
  return data
}
