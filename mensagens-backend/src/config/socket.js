import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Token não fornecido'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new Error('Usuário não encontrado'))
    }

    socket.user = user
    return next()
  } catch (error) {
    return next(new Error('Não autorizado'))
  }
}