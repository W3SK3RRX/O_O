import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import env from './env.js'

export default async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Token não fornecido'))
    }

    const decoded = jwt.verify(token, env.JWT_SECRET)

    // Mesmas garantias do middleware HTTP protect: só access token, usuário
    // ativo e versão de token atual (revogação de sessão vale para o socket).
    if (decoded.type !== 'access') {
      return next(new Error('Não autorizado'))
    }

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new Error('Usuário não encontrado'))
    }

    if (user.active === false) {
      return next(new Error('Conta desativada'))
    }

    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return next(new Error('Sessão expirada'))
    }

    socket.user = user
    return next()
  } catch {
    return next(new Error('Não autorizado'))
  }
}
