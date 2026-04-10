export const adminOnly = (req, res, next) => {
  const isAdmin = req.user?.isAdmin === true || req.user?.role === 'admin'
  
  if (req.user && isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso não autorizado. Apenas administradores.' });
  }
};